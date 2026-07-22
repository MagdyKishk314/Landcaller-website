import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { config } from "../config.js";
import { logger } from "../logger.js";
import * as tenants from "../repos/tenants.js";

/**
 * SSO bridge into the Siftr data dashboard - port of sso-launch.php.
 * Mints a 5-minute RS256 JWT and auto-POSTs it to data.landcaller.com.
 *
 * Uses a NEW keypair (the legacy private.pem shipped in the webroot and is
 * considered compromised). Generate on the VPS:
 *   mkdir -p platform/keys
 *   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out platform/keys/sso-private.pem
 *   openssl pkey -in platform/keys/sso-private.pem -pubout -out platform/keys/sso-public.pem
 * and send sso-public.pem to Siftr before cutover.
 *
 * This route is browser-facing (GHL custom-menu link) and therefore public,
 * matching legacy: possession of a locationId grants an SSO assertion for that
 * tenant; Siftr validates signature/audience/expiry on its side.
 */
const router = Router();

let cachedKey: string | null = null;
function privateKey(): string | null {
  if (cachedKey) return cachedKey;
  try {
    cachedKey = fs.readFileSync(path.resolve(process.cwd(), config.sso.privateKeyPath), "utf8");
    return cachedKey;
  } catch {
    return null;
  }
}

const b64url = (b: Buffer) => b.toString("base64url");

function signJwt(payload: Record<string, unknown>, key: string): string {
  const header = b64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = crypto.sign("RSA-SHA256", Buffer.from(`${header}.${body}`), key);
  return `${header}.${body}.${b64url(sig)}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

router.get("/sso-launch.php", async (req, res) => {
  const locationId = typeof req.query.locationId === "string" ? req.query.locationId.trim() : "";
  if (!locationId) {
    res.status(400).send("Missing locationId");
    return;
  }

  const key = privateKey();
  if (!key) {
    logger.error("sso key missing", { path: config.sso.privateKeyPath });
    res.status(503).send("SSO is not configured on this server yet.");
    return;
  }

  const row = await tenants.findByLocationId(locationId);
  if (!row) {
    res.status(404).send("No user found");
    return;
  }
  if (!row.email) {
    res.status(400).send("Email missing");
    return;
  }
  // Gate: un-provisioned/unsigned tenants (no Package) get the explainer page.
  if (!row.Package) {
    res.status(200).send(
      `<!doctype html><html><body style="font-family:sans-serif;text-align:center;padding:4rem">
        <h1>Account Not Found</h1>
        <p>Your data dashboard unlocks once your contract is signed and your plan is active.</p>
        <p>Please contact support@landcaller.com if you believe this is an error.</p>
      </body></html>`
    );
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      iss: config.sso.issuer,
      aud: config.sso.audience,
      sub: locationId,
      jti: crypto.randomBytes(16).toString("hex"),
      iat: now,
      exp: now + 300,
      email: row.email,
      ghlLocationId: locationId,
    },
    key
  );

  res.status(200).send(
    `<!doctype html><html><body>
      <form id="sso" method="POST" action="${esc(config.sso.exchangeUrl)}">
        <input type="hidden" name="assertion" value="${esc(jwt)}">
        <input type="hidden" name="returnTo" value="/insights">
      </form>
      <script>document.getElementById("sso").submit();</script>
    </body></html>`
  );
});

export default router;
