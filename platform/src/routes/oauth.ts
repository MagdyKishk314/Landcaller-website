import crypto from "node:crypto";
import { Router } from "express";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { ghl } from "../lib/ghl.js";

/**
 * GHL Marketplace OAuth connect - port of authorize.php / callback.php.
 * Legacy gaps closed: a `state` parameter (CSRF) is required, and tokens are
 * never echoed to the browser (the PHP print_r'd the full token payload).
 */
const router = Router();

// Same scope list the legacy authorize.php requested.
const SCOPES = [
  "contacts.readonly", "contacts.write",
  "locations.readonly", "locations.write",
  "locations/customValues.readonly", "locations/customValues.write",
  "locations/customFields.readonly", "locations/customFields.write",
  "opportunities.readonly", "opportunities.write",
  "users.readonly", "users.write",
  "companies.readonly",
].join(" ");

const STATE_COOKIE = "lc_oauth_state";

router.get("/authorize.php", (_req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: 10 * 60 * 1000,
  });
  const url = new URL("https://marketplace.gohighlevel.com/oauth/chooselocation");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", config.ghl.redirectUri);
  url.searchParams.set("client_id", config.ghl.clientId);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  res.redirect(302, url.toString());
});

router.get("/callback.php", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const expectedState = parseCookie(req.headers.cookie, STATE_COOKIE);

  if (!code) {
    res.status(400).send("No authorization code provided");
    return;
  }
  if (!expectedState || state !== expectedState) {
    res.status(400).send("OAuth state mismatch - restart the connect flow at /authorize.php");
    return;
  }
  try {
    const data = await ghl.exchangeCode(code);
    res
      .status(200)
      .send(
        `<h2>GHL connected</h2><p>Agency token stored for company ${escapeHtml(
          String(data.companyId ?? "?")
        )}. You can close this tab.</p>`
      );
  } catch (err) {
    logger.error("oauth callback failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).send("Token exchange failed - check the service logs.");
  }
});

/** Minimal cookie parse (no cookie-parser dependency). */
function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export default router;
