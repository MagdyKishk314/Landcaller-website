import crypto from "node:crypto";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { getGhlPool } from "../db.js";
import { getProfile, type ProfileName } from "./permissionProfiles.js";

/**
 * GoHighLevel / LeadConnector API client - port of the legacy HighLevelAPI.php.
 *
 * Differences from the PHP, by design:
 * - The agency OAuth token lives in the `oauth_tokens` DB table, not a JSON
 *   file inside the webroot.
 * - Request/response bodies are never logged (the PHP error_log'd both, with
 *   tokens and PII, on every call).
 * - Permission/scope sets come from one profiles module instead of ~8 inline
 *   copies.
 */

type Json = Record<string, unknown>;

interface TokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: string; // DATETIME string (dateStrings pool)
  company_id: string | null;
}

export class GhlApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
  }
}

const PROVIDER = "ghl_agency";

async function loadTokenRow(): Promise<TokenRow | null> {
  const [rows] = await getGhlPool().query(
    "SELECT access_token, refresh_token, expires_at, company_id FROM oauth_tokens WHERE provider = ? LIMIT 1",
    [PROVIDER]
  );
  const list = rows as TokenRow[];
  return list[0] ?? null;
}

async function saveTokenRow(t: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  companyId?: string;
  raw?: unknown;
}): Promise<void> {
  await getGhlPool().query(
    `INSERT INTO oauth_tokens (provider, access_token, refresh_token, expires_at, company_id, raw)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?)
     ON DUPLICATE KEY UPDATE
       access_token = VALUES(access_token),
       refresh_token = VALUES(refresh_token),
       expires_at = VALUES(expires_at),
       company_id = COALESCE(VALUES(company_id), company_id),
       raw = VALUES(raw)`,
    [
      PROVIDER,
      t.accessToken,
      t.refreshToken,
      t.expiresInSeconds,
      t.companyId ?? null,
      t.raw ? JSON.stringify(t.raw) : null,
    ]
  );
}

export class GhlClient {
  private cachedToken: { token: string; companyId: string; expiresAtMs: number } | null = null;

  /** Exchange an OAuth authorization code (agency install) and persist tokens. */
  async exchangeCode(code: string): Promise<Json> {
    const body = new URLSearchParams({
      client_id: config.ghl.clientId,
      client_secret: config.ghl.clientSecret,
      grant_type: "authorization_code",
      code,
      user_type: "Company",
      redirect_uri: config.ghl.redirectUri,
    });
    const res = await fetch(`${config.ghl.apiBase}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as Json;
    if (!res.ok || !data.access_token) {
      throw new GhlApiError("GHL code exchange failed", res.status, data);
    }
    await saveTokenRow({
      accessToken: String(data.access_token),
      refreshToken: String(data.refresh_token ?? ""),
      expiresInSeconds: Number(data.expires_in ?? 86399),
      companyId: data.companyId ? String(data.companyId) : undefined,
      raw: data,
    });
    this.cachedToken = null;
    logger.info("ghl token exchanged", { companyId: data.companyId });
    return data;
  }

  private async refreshToken(refreshToken: string): Promise<void> {
    const body = new URLSearchParams({
      client_id: config.ghl.clientId,
      client_secret: config.ghl.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
    const res = await fetch(`${config.ghl.apiBase}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as Json;
    if (!res.ok || !data.access_token) {
      throw new GhlApiError("GHL token refresh failed", res.status, data);
    }
    await saveTokenRow({
      accessToken: String(data.access_token),
      refreshToken: String(data.refresh_token ?? refreshToken),
      expiresInSeconds: Number(data.expires_in ?? 86399),
      companyId: data.companyId ? String(data.companyId) : undefined,
      raw: data,
    });
    this.cachedToken = null;
    logger.info("ghl token refreshed");
  }

  /** Valid agency access token (refreshing if within 60s of expiry). */
  private async ensureToken(): Promise<{ token: string; companyId: string }> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAtMs - 60_000) {
      return this.cachedToken;
    }
    const row = await loadTokenRow();
    if (!row) {
      throw new Error(
        "No GHL agency token in oauth_tokens - run the OAuth connect flow (/authorize.php) once"
      );
    }
    const expiresAtMs = new Date(row.expires_at.replace(" ", "T") + "Z").getTime();
    if (Date.now() >= expiresAtMs - 60_000) {
      await this.refreshToken(row.refresh_token);
      const fresh = await loadTokenRow();
      if (!fresh) throw new Error("Token refresh did not persist");
      this.cachedToken = {
        token: fresh.access_token,
        companyId: fresh.company_id ?? config.ghl.companyId,
        expiresAtMs: new Date(fresh.expires_at.replace(" ", "T") + "Z").getTime(),
      };
    } else {
      this.cachedToken = {
        token: row.access_token,
        companyId: row.company_id ?? config.ghl.companyId,
        expiresAtMs,
      };
    }
    return this.cachedToken;
  }

  /**
   * Core request path. Retries once on 401 after a forced refresh (mirrors the
   * PHP behavior). `token` overrides the agency token (location-token calls).
   */
  async request<T = Json>(
    method: string,
    path: string,
    body?: unknown,
    opts: { token?: string; retry?: boolean } = {}
  ): Promise<T> {
    const retry = opts.retry ?? true;
    const auth = opts.token ?? (await this.ensureToken()).token;
    const res = await fetch(`${config.ghl.apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${auth}`,
        Version: config.ghl.apiVersion,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 401 && retry && !opts.token) {
      const row = await loadTokenRow();
      if (row) await this.refreshToken(row.refresh_token);
      return this.request<T>(method, path, body, { ...opts, retry: false });
    }
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text.slice(0, 500) };
    }
    logger.debug("ghl request", { method, path, status: res.status });
    if (!res.ok) {
      throw new GhlApiError(`GHL ${method} ${path} -> ${res.status}`, res.status, data);
    }
    return data as T;
  }

  /** Short-lived location token minted from the agency token. Not persisted. */
  async getLocationToken(locationId: string): Promise<string | null> {
    const { token, companyId } = await this.ensureToken();
    const body = new URLSearchParams({ companyId, locationId });
    const res = await fetch(`${config.ghl.apiBase}/oauth/locationToken`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: config.ghl.apiVersion,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });
    const data = (await res.json().catch(() => ({}))) as Json;
    if (!res.ok || !data.access_token) {
      logger.warn("ghl location token mint failed", { locationId, status: res.status });
      return null;
    }
    return String(data.access_token);
  }

  // ---- Locations ----

  async createLocation(d: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }): Promise<Json> {
    const { companyId } = await this.ensureToken();
    return this.request("POST", "/locations/", {
      name: `${d.firstName} ${d.lastName}`.trim(),
      companyId,
      phone: d.phone,
      address: d.address,
      city: d.city,
      state: d.state,
      country: d.country,
      postalCode: d.postalCode,
      timezone: "US/Central",
      isAgencySubAccount: false,
      ...(config.ghl.snapshotId ? { snapshotId: config.ghl.snapshotId } : {}),
      prospectInfo: { firstName: d.firstName, lastName: d.lastName, email: d.email },
    });
  }

  getLocationById(id: string): Promise<Json> {
    return this.request("GET", `/locations/${id}`);
  }

  async updateLocationById(id: string, data: Json): Promise<Json> {
    const { companyId } = await this.ensureToken();
    return this.request("PUT", `/locations/${id}`, { ...data, companyId });
  }

  // ---- Users ----

  /**
   * Create a user under a location. Mirrors the PHP: random throwaway password
   * (never surfaced - users get in via GHL's own invite/reset), role admin,
   * DEFAULT_CREATE permission profile.
   */
  async createUser(d: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    locationId: string;
  }): Promise<Json> {
    const { companyId } = await this.ensureToken();
    const profile = getProfile("DEFAULT_CREATE");
    return this.request("POST", "/users/", {
      companyId,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      password: crypto.randomBytes(4).toString("hex") + "Aa1!",
      type: "account",
      role: "admin",
      locationIds: [d.locationId],
      permissions: profile.permissions,
      scopes: profile.scopes,
    });
  }

  async updateUserById(userId: string, data: Json): Promise<Json> {
    const { companyId } = await this.ensureToken();
    return this.request("PUT", `/users/${userId}`, { ...data, companyId });
  }

  getUserById(userId: string): Promise<Json> {
    return this.request("GET", `/users/${userId}`);
  }

  async getUsersByLocation(locationId: string): Promise<Json[]> {
    const token = await this.getLocationToken(locationId);
    if (!token) return [];
    const data = await this.request<{ users?: Json[] }>(
      "GET",
      `/users/?locationId=${encodeURIComponent(locationId)}`,
      undefined,
      { token }
    );
    return data.users ?? [];
  }

  /** Apply a permission profile to a single user. */
  async applyProfile(userId: string, profileName: ProfileName): Promise<Json> {
    const p = getProfile(profileName);
    return this.updateUserById(userId, {
      role: p.role,
      permissions: p.permissions,
      scopes: p.scopes,
    });
  }

  /**
   * Port of accessManagement(): apply give/block profile to EVERY user in the
   * location. Returns per-user results; success=true when all users updated.
   */
  async accessManagement(
    locationId: string,
    action: "giveaccess" | "blockaccess"
  ): Promise<{ success: boolean; updated: number; failed: number }> {
    const users = await this.getUsersByLocation(locationId);
    const profileName: ProfileName = action === "giveaccess" ? "ACCESS_GIVE" : "ACCESS_BLOCK";
    let updated = 0;
    let failed = 0;
    for (const u of users) {
      const id = String((u as { id?: unknown }).id ?? "");
      if (!id) continue;
      try {
        await this.applyProfile(id, profileName);
        updated++;
      } catch (err) {
        failed++;
        logger.warn("accessManagement user update failed", {
          locationId,
          userId: id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { success: failed === 0 && updated > 0, updated, failed };
  }

  // ---- Contacts ----

  /** Live contact count for a location (meta.total with limit=1). */
  async getContactCount(locationId: string): Promise<number | null> {
    const token = await this.getLocationToken(locationId);
    if (!token) return null;
    const data = await this.request<{ meta?: { total?: number } }>(
      "GET",
      `/contacts/?locationId=${encodeURIComponent(locationId)}&limit=1`,
      undefined,
      { token }
    );
    return data.meta?.total ?? null;
  }
}

/** Shared singleton - token cache benefits from one instance per process. */
export const ghl = new GhlClient();
