# Landcaller Platform Service

Node/TypeScript port of the legacy PHP application that ran at
`app.landcaller.com` (GHL provisioning, entitlement, billing) — see
[`docs/platform-migration-plan.md`](../docs/platform-migration-plan.md) and
[`docs/phase0-audit.md`](../docs/phase0-audit.md).

**Cutover model:** this service reproduces the legacy URLs exactly (`.php`
paths included). It goes live by repointing `app.landcaller.com` DNS to the
VPS in Phase 4 — no Stripe/GHL/Convoso reconfiguration. Until then unmigrated
paths answer `501 not_migrated` (see `src/routes/legacy.ts`, the migration
checklist in code form).

## Local dev

```bash
cd platform
npm install
cp .env.example .env    # fill what you need; service boots with none of it
npm run dev             # http://localhost:3100/healthz
npm run typecheck
npm test                # builds then runs tests/ against dist/
```

## Layout

```
src/
  config.ts               env-driven config (lazy required() per code path)
  logger.ts               JSON-lines logger with token/PII redaction
  db.ts                   lazy mysql2 pools (GHL + LCDS databases)
  lib/
    ghl.ts                GoHighLevel client (DB-stored OAuth, 401-retry)
    permissionProfiles.ts named permission/scope profiles (single source)
    permissionProfiles.data.ts  verbatim sets extracted from the legacy PHP
    zohoBooks.ts          contact -> invoice -> payment (one implementation)
    siftr.ts              partner purchase POST
    stripeClients.ts      two Stripe accounts + signature verification
  middleware/webhookAuth.ts  shared-secret gate for GHL-fired webhooks
  routes/health.ts        /healthz
  routes/legacy.ts        the full legacy URL inventory (stubs -> real, per phase)
  scripts/migrate.ts      forward-only .sql migration runner
migrations/               port-added tables; business tables come from prod dumps
deploy/                   PM2 ecosystem + Nginx server block
```

## VPS provisioning (one-time, via Hostinger terminal)

```bash
# 1. MariaDB
sudo apt update && sudo apt install -y mariadb-server
sudo mysql_secure_installation

# 2. Databases + app user (use a NEW strong password; put it in platform/.env)
sudo mysql -e "CREATE DATABASE landcaller_ghl CHARACTER SET utf8mb4;
CREATE DATABASE lcds_db CHARACTER SET utf8mb4;
CREATE USER 'landcaller_platform'@'localhost' IDENTIFIED BY '<NEW-PASSWORD>';
GRANT ALL ON landcaller_ghl.* TO 'landcaller_platform'@'localhost';
GRANT ALL ON lcds_db.* TO 'landcaller_platform'@'localhost';
FLUSH PRIVILEGES;"

# 3. Import the production dumps (scp/upload them first; see migrations/README.md)
sudo mysql landcaller_ghl < landcaller_ghl_YYYY-MM-DD.sql

# 4. App
cd /var/www/myapp/platform    # wherever the repo lives on the VPS
npm ci && npm run build
cp .env.example .env && nano .env          # rotated credentials only
npm run migrate
pm2 start deploy/ecosystem.config.cjs && pm2 save

# 5. Nginx (safe pre-cutover; receives no traffic until DNS moves)
sudo cp deploy/nginx-app.landcaller.com.conf /etc/nginx/sites-available/app.landcaller.com
sudo ln -s /etc/nginx/sites-available/app.landcaller.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Do not repoint `app.landcaller.com` DNS until Phase 4.** At cutover:
repoint DNS → `certbot --nginx -d app.landcaller.com` → watch
`pm2 logs landcaller-platform` for `legacy path hit` warnings (each one is a
production caller reaching a not-yet-migrated route — there should be none by
then).

## Security posture vs. the legacy system

- No secrets in code; `.env` only, all values rotated (legacy values are
  considered compromised).
- Stripe webhooks verify signatures (`stripeClients.verifyEvent`); legacy had none.
- GHL-fired webhooks require a shared secret (`webhookAuth`); legacy were open.
- OAuth tokens live in the database, not web-served JSON files.
- Logger redacts tokens/keys by pattern; legacy logged full bodies with PII.
