import dotenv from "dotenv";

// Load a local .env for development / VPS. On Vercel the environment is injected
// by the platform (and no .env file exists), so we skip dotenv there.
if (!process.env.VERCEL) {
  dotenv.config();
}

/**
 * Centralized, lazily-read environment access. Values are exposed as getters so
 * they reflect `process.env` at call time.
 */
export const env = {
  /** Shared password gating the /admin dashboard. */
  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD || "";
  },
  /** Secret used to sign the admin session cookie. */
  get sessionSecret(): string {
    return process.env.SESSION_SECRET || "dev-insecure-session-secret-change-me";
  },
  /**
   * Origin of the legacy server that still hosts pages this site doesn't have
   * (e.g. the old Hostinger box). Unknown GET requests are redirected there,
   * same path and query. Set to an empty string to disable and serve a real 404.
   */
  get fallbackOrigin(): string {
    const raw = process.env.FALLBACK_ORIGIN;
    const origin = raw === undefined ? "http://82.180.172.113" : raw.trim();
    return origin.replace(/\/+$/, "");
  },
  /** True in production (Vercel or NODE_ENV=production). */
  get isProd(): boolean {
    return !!process.env.VERCEL || process.env.NODE_ENV === "production";
  },
};
