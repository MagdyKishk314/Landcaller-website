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
  /** Shared password gating the /admin blog dashboard. */
  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD || "";
  },
  /** Secret used to sign the admin session cookie. */
  get sessionSecret(): string {
    return process.env.SESSION_SECRET || "dev-insecure-session-secret-change-me";
  },
  /** True in production (Vercel or NODE_ENV=production). */
  get isProd(): boolean {
    return !!process.env.VERCEL || process.env.NODE_ENV === "production";
  },
};
