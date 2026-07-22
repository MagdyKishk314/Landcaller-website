import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.APP_ENV === "production";

/**
 * Read an env var. In production a missing required value throws at first use
 * (fail fast, but only on the code path that needs it - so e.g. Stripe keys
 * aren't required just to boot the health endpoint in Phase 1).
 */
function required(name: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (isProd) throw new Error(`Missing required env var ${name}`);
  return "";
}

export const config = {
  isProd,
  port: Number(process.env.PORT ?? 3100),
  logLevel: process.env.LOG_LEVEL ?? "info",

  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    nameGhl: process.env.DB_NAME_GHL ?? "landcaller_ghl",
    nameLcds: process.env.DB_NAME_LCDS ?? "lcds_db",
  },

  ghl: {
    get clientId() { return required("GHL_CLIENT_ID"); },
    get clientSecret() { return required("GHL_CLIENT_SECRET"); },
    redirectUri: process.env.GHL_REDIRECT_URI ?? "https://app.landcaller.com/callback.php",
    get companyId() { return required("GHL_COMPANY_ID"); },
    masterLocationId: process.env.GHL_MASTER_LOCATION_ID ?? "",
    snapshotId: process.env.GHL_SNAPSHOT_ID ?? "",
    get webhookSharedSecret() { return required("GHL_WEBHOOK_SHARED_SECRET"); },
    apiBase: "https://services.leadconnectorhq.com",
    apiVersion: "2021-07-28",
  },

  stripe: {
    get secretKeyLc() { return required("STRIPE_SECRET_KEY_LC"); },
    get secretKeyLlc() { return required("STRIPE_SECRET_KEY_LLC"); },
    get webhookSecretBridge() { return required("STRIPE_WEBHOOK_SECRET_BRIDGE"); },
    get webhookSecretEnterprise() { return required("STRIPE_WEBHOOK_SECRET_ENTERPRISE"); },
    siftrConnectAccountId: process.env.SIFTR_CONNECT_ACCOUNT_ID ?? "",
  },

  zoho: {
    get clientId() { return required("ZOHO_CLIENT_ID"); },
    get clientSecret() { return required("ZOHO_CLIENT_SECRET"); },
    get refreshToken() { return required("ZOHO_REFRESH_TOKEN"); },
    get organizationId() { return required("ZOHO_ORGANIZATION_ID"); },
    accountsBase: "https://accounts.zoho.com",
    apiBase: "https://www.zohoapis.com/books/v3",
  },

  siftr: {
    apiUrl: process.env.SIFTR_API_URL ?? "https://console.siftr.net",
    get bearerToken() { return required("SIFTR_BEARER_TOKEN"); },
  },

  sso: {
    privateKeyPath: process.env.SSO_PRIVATE_KEY_PATH ?? "./keys/sso-private.pem",
    issuer: process.env.SSO_ISSUER ?? "https://app.landcaller.com",
    audience: process.env.SSO_AUDIENCE ?? "siftr-landcaller",
    exchangeUrl: process.env.SSO_EXCHANGE_URL ?? "https://data.landcaller.com/api/auth/landcaller/exchange",
  },
} as const;
