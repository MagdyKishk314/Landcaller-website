# Phase 4 — Cutover runbook for `app.landcaller.com`

The step-by-step script for repointing `app.landcaller.com` from the old
Hostinger host to the VPS platform service. Written so it can be executed
top-to-bottom on cutover day with a verification after every step and a
5-minute rollback at any point.

**Rough duration:** ~1 hour of active work + a monitoring soak afterwards.
**Best window:** an evening or weekend — provisioning webhooks only fire when
someone buys/activates, so a quiet window means near-zero risk of losing an
event mid-switch.

---

## 0. Prerequisites (all must be true before scheduling a date)

| # | Item | How to verify |
|---|------|--------------|
| 1 | Platform deployed & healthy on VPS | `curl -s localhost:3100/healthz` → `"db":true` |
| 2 | Nginx `app.landcaller.com` block installed (IPv4+IPv6) | `curl -s -H "Host: app.landcaller.com" http://localhost/healthz` → healthz JSON |
| 3 | `.env` complete (GHL block, Zoho, Siftr bearer, webhook secret) | visual check; Stripe block stays empty by design |
| 4 | SSO keypair generated, **public key delivered to Siftr** and Siftr confirmed they accept both old+new keys (or will swap on our signal) | Siftr's reply |
| 5 | **GHL workflow inventory** in hand: list of every workflow webhook action calling `app.landcaller.com/...` | screenshots/export from GHL |
| 6 | Old DNS value for `app.landcaller.com` written down (rollback target) | Hostinger DNS panel — note the current record type + value |

Do **not** proceed with any DNS change until 4 and 5 exist.

---

## 1. Pre-flight (on the VPS, minutes before starting)

```bash
pm2 status                                   # both apps online
curl -s localhost:3100/healthz && echo       # {"ok":true,...,"db":true}
sudo nginx -t                                # syntax ok
curl -4 -s icanhazip.com                     # note this VPS IP -> used in step 4
```

## 2. Final database sync

The VPS database is a June snapshot; production has kept writing since. Export
fresh dumps from the old server (hPanel → the old site → Databases →
phpMyAdmin → Export, or SSH `mysqldump`), then transfer **directly** (scp /
SFTP — never through git):

```bash
# on the VPS, after uploading the fresh dumps:
sudo mysql landcaller_ghl < landcaller_ghl_CUTOVER.sql
sudo mysql lcds_db        < lcds_db_CUTOVER.sql
cd /var/www/myapp/platform && npm run migrate      # recreates oauth_tokens etc.
sudo mysql -e "SELECT COUNT(*) AS tenants FROM landcaller_ghl.ghl_sub_accounts;"
pm2 restart landcaller-platform
```

Sanity: tenant count ≥ the 667 from the June import.

## 3. Delete the old server's cron jobs

hPanel → old site → Advanced → Cron Jobs → **delete all 7** (they are the
test-only billing engine; after DNS moves they would curl OUR server every
minute and pollute the soak logs). This does not affect the portal or anything
live.

## 4. Repoint DNS

Hostinger DNS for `landcaller.com`: edit the `app` record → **A record →
the VPS IP from step 1** (same IP the apex uses). TTL 300.

```bash
# from any machine; repeat until it shows the VPS IP (≤5 min):
nslookup app.landcaller.com
```

From this moment external callers reach the new platform over HTTP;
HTTPS callers fail TLS until step 5 — proceed immediately.

## 5. Issue the TLS certificate

```bash
sudo certbot --nginx -d app.landcaller.com
curl -s https://app.landcaller.com/healthz && echo    # {"ok":true,...,"db":true}
```

## 6. Connect GHL OAuth (order matters — only AFTER DNS moved)

GHL rotates refresh tokens on every use, so this must never be done while the
old server still serves traffic. Two options, try A first:

**A. Seed from the old server's current token file.** hPanel File Manager →
old site → `public_html/app/agency_token_response.json` → open, copy
`access_token` and `refresh_token` (fresh copy — NOT the one in the repo
export, that one is stale). Then on the VPS:

```bash
sudo mysql landcaller_ghl -e "INSERT INTO oauth_tokens
  (provider, access_token, refresh_token, expires_at, company_id)
  VALUES ('ghl_agency', '<ACCESS_TOKEN>', '<REFRESH_TOKEN>', NOW(), '7cMPUynEjBEW1WODK0OU')
  ON DUPLICATE KEY UPDATE access_token=VALUES(access_token),
    refresh_token=VALUES(refresh_token), expires_at=VALUES(expires_at);"
```

`expires_at = NOW()` forces an immediate refresh on first use, which validates
the token end-to-end.

**B. Fallback — fresh OAuth connect.** Open
`https://app.landcaller.com/authorize.php` in a browser while logged into the
GHL **agency**, choose the agency, approve. Lands on `/callback.php` which
stores the token.

**Verify either way** (read-only GHL call; watch the logs in a second SSH
session with `pm2 logs landcaller-platform`):

```bash
LOC=$(sudo mysql -N -e "SELECT location_id FROM landcaller_ghl.ghl_sub_accounts WHERE plan_status='active' AND location_id<>'' LIMIT 1")
curl -s "localhost:3100/accesscheck.php?loc=$LOC" | head -c 200 && echo
```

Success: no `GHL token refresh failed` in the logs.

## 7. Append the shared secret to GHL workflow webhooks

Using the inventory from prerequisite 5: edit each workflow webhook action and
append `?key=<GHL_WEBHOOK_SHARED_SECRET value from .env>` to its URL.
(Only **workflow webhooks** need this. Custom-menu links and injector URLs —
sso-launch, accesscheck, prefill, custom_popup — are browser-facing and stay
unchanged.)

Verification: trigger one harmless workflow (or wait for the first real
event) and confirm a `200` in `pm2 logs` rather than a `401`.

## 8. What deliberately does NOT change

- **Convoso** — confirmed: no postback configured anywhere. Nothing to do.
- **Stripe dashboards** — retired engine; any old webhook endpoint configs can
  stay pointing at the stubs (hits get logged as 501s, which is signal).
- **Old server** — untouched except cron deletion; still serves the WP site,
  `/client-portal` (zportals) and `/app/lcds` via the existing apex proxies.
- **VPS crons for lead counts** — `leadcountcheck.php` / `basic_user_leadcheck.php`
  were never scheduled in legacy production. Do NOT schedule them at cutover;
  turning on cap enforcement for the first time is a product decision — get a
  team sign-off first, then add a crontab entry with the `?key=` secret.

## 9. Soak (the week after)

```bash
pm2 logs landcaller-platform --lines 200 | grep -E "legacy path hit|bad shared secret"
```

- `legacy path hit` = something real calls a route we retired → investigate.
- `bad shared secret` = a workflow URL missed its `?key=` → fix that workflow.
- Expect a burst of noise at first (crawlers, the old server's last requests),
  then silence.

## 10. Rollback (any point, ~5 minutes)

The old server is never modified (crons excepted), so rollback is only DNS:
Hostinger DNS → `app` record → restore the old value noted in prerequisite 6.
Wait out the 300 s TTL. If OAuth was already seeded (step 6), the old server's
token may have been invalidated by our refresh — restore it by opening the
legacy authorize flow once on the old host (`app.landcaller.com/authorize.php`
after DNS is back).

## 11. Post-cutover hardening (first quiet day after the soak)

1. Rotate the MariaDB password (`ALTER USER 'landcaller_platform'@'localhost' IDENTIFIED BY '<new>'` + update `.env` + `pm2 restart`).
2. Rotate the GHL marketplace client secret (GHL developer portal → same app,
   new secret → update `.env`).
3. Ask Siftr to drop the OLD SSO public key and rotate the partner bearer;
   update `SIFTR_BEARER_TOKEN`.
4. Regenerate Zoho credentials (fresh self-client, revoke the legacy one) —
   the legacy set lived in plaintext in the old webroot.
5. Then Phase 5 (LCDS decision) and Phase 6 (portal retirement → cancel the
   old hosting).

---

## Appendix A — Building the GHL workflow inventory (prerequisite 5)

In the GHL **agency** account: Automation → Workflows → open each workflow →
look for **Webhook** actions. Every URL containing `app.landcaller.com` goes
on the list. These are the endpoints the legacy code expects workflows to
call — search for each of these paths so none is missed (several may appear
in more than one workflow):

| # | Endpoint the workflow POSTs to | Fires when |
|---|---|---|
| 1 | `/create_location.php` | new tenant purchased → create sub-account + user |
| 2 | `/createUser.php` | additional seat under an existing location |
| 3 | `/activate_basic_user.php` | Basic plan activation / lead top-up |
| 4 | `/activate_enterprise_user.php` | Enterprise activation |
| 5 | `/activate_only_crm_user.php` | CRM-only activation |
| 6 | `/data_only_webhook.php` | data-only plan activation |
| 7 | `/contract_status.php` | contract signed |
| 8 | `/plan_renew_date_update.php` | renewal date changed |
| 9 | `/webhooks/admin_hold_update_permission.php` | admin hold toggled |
| 10 | `/webhooks/create-contact.php` | contact/opportunity ingestion |
| 11 | `/stripe_products/ghl_product_purchase.php` | storefront purchase → Zoho bookkeeping |

For each URL found: note the workflow name + the exact URL. At cutover step 7,
each gets `?key=<secret>` appended. Any `app.landcaller.com` URL found that is
NOT in this table — flag it before cutover; it may be a caller the port
doesn't cover.
