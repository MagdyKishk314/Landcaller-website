# Platform Migration Plan — PHP (`Landcaller CRM GHL Plugin`) → Node/TypeScript

**Status:** Draft for review · 2026-07-22
**Sources:** `Landcaller-System-Documentation` (Vols 0–3, 6), `Landcaller-Codebase-Analysis.pdf` (security report), and a full code read of `public_html/app/` + `public_html/app/lcds/`.

---

## 1. What the old system actually is

The export in `Documents/GitHub/Landcaller CRM GHL Plugin/` is the complete old production webroot. It contains **four subsystems**, and they do not all get the same treatment:

| # | Subsystem | Where | Ownership | Verdict |
|---|-----------|-------|-----------|---------|
| 1 | **GHL provisioning / entitlement / SSO** — creates GoHighLevel sub-accounts + users, activates plans after payment, enforces lead caps, SSO into the Siftr data dashboard | `app/*.php` (~30 scripts) | Bespoke — ours | **Port** (Phase 2) |
| 2 | **Stripe billing engine** — checkouts (Basic w/ Siftr revenue split, Enterprise upfront/manual/subscription, CRM-only), the `billing_schedules` cycle/term engine, dunning, late fees, pause/resume, Zoho Books bookkeeping | `app/stripe-webhook.php`, `app/stripe_products/` | Bespoke — ours | **Port + fix** (Phase 3) |
| 3 | **LCDS lead-calling system** — CSV lead import, TCPA scrub-window compliance, Convoso dialer push, disposition sync, reporting dashboard; own MySQL DB | `app/lcds/` | Bespoke — ours | **Port + complete** (Phase 5) |
| 4 | **zportals client portal** ("Landcaller CRM") — the Zoho-backed portal at `landcaller.com/client-portal/` | `wp-content/plugins/zportals` | **Licensed** (Zportals Pro v6.3.2, license checks + domain binding) | **Cannot port.** Keep on old WP (already Nginx-proxied) until clients move to the new CRM, then retire |

Also in the folder, and **not** transferable work: WordPress core + stock plugins (the marketing site this repo already replaced), empty parked dirs (`billing/`, `forms/`, `portal/` contain only Hostinger placeholders), dead/broken scripts (§8), test scaffolding, and hundreds of log files containing PII.

**Key operational fact:** external systems call hardcoded URLs — Stripe webhooks and ~16 GHL workflow webhooks target `app.landcaller.com/*.php`, Convoso posts to `landcaller.com/app/lcds/api/endpoints/convoso-webhook.php`. The `app` DNS record still points at the **old** Hostinger hosting, which is why billing survived the marketing-site migration. This is our cutover lever: build URL-compatible routes in Node, then repoint DNS — **no external system needs reconfiguring.**

---

## 2. Architecture decisions (recommended)

### 2.1 Where the code lives
A **second Express service in this repo** (e.g. `platform/` with its own `src/`, or an npm workspace), running as its own PM2 process on the VPS, served by Nginx at `app.landcaller.com`.

- Keeps money-path code out of the marketing site's process and deploy cycle (a bad blog deploy must never take down Stripe webhooks).
- Same stack conventions as this repo (TS, ESM, Express, EJS for any UI) — one mental model.
- Express happily routes literal legacy paths like `/activate_basic_user.php`, so URL compatibility is trivial.

### 2.2 Database
**Keep MySQL.** Install MariaDB on the VPS, import `mysqldump`s of the two custom DBs (`u353253270_Landcaller_ghl`, `u353253270_lcds_db`), connect via `mysql2`. Reasons: existing production data must survive; concurrent crons + webhooks; LCDS uses a `GENERATED STORED` column (`scrub_expiry_date`) that SQLite doesn't support. The WordPress DB stays with WordPress — we never touch it.

Add what the PHP never had: a checked-in `schema.sql` per DB (captured from production), and a tiny migration runner. Remove runtime DDL (`ensureSchema()` on hot paths).

### 2.3 URL compatibility
Reproduce the exact legacy paths (including `.php`) as Express routes for everything an external system calls: activation webhooks, Stripe webhooks, GHL workflow targets, the JS injectors (`accesscheck.php`, `custom_popup.js.php`, `prefill_user.php`), `sso-launch.php`, checkout creators, and the LCDS webhook/API paths under `/app/lcds/`. Modern aliases can come later behind 301s. This turns cutover into a pure DNS change.

### 2.4 Secrets
Everything moves to `.env` on the VPS (git-ignored). **Every credential in the old code is treated as compromised** (they're hardcoded in web-served files; the security report says the same):

- Rotate: GHL marketplace client secret, Stripe secret keys + webhook signing secrets, Zoho (Books + the zportals app) client secrets/refresh tokens, Siftr partner bearer, both MySQL passwords, LCDS `API_KEY`, the WP admin passwords.
- **Regenerate the SSO keypair** (`private.pem` ships in the webroot, plus a copy) and hand the new public key to Siftr for `data.landcaller.com`.
- The plugin folder itself contains live tokens + PII logs — it must never be committed to a repo. Port code by re-writing, not by copying files.

### 2.5 Crons
One additional PM2 process (`platform-worker`) running `node-cron` schedules with per-job locks and per-job logging — replaces ~13 crontab entries. In-repo, visible, deployed atomically with the code it exercises.

### 2.6 Shared foundation modules (built once, used everywhere)
| Module | Replaces | Notes |
|---|---|---|
| `ghlClient` | `HighLevelAPI.php` | Token persisted in DB (not a JSON file in the webroot); auto-refresh; location-token minting; **no request/response body logging** (the PHP logs tokens + PII on every call) |
| `permissionProfiles` | ~80-key permission map + ~70 scopes copy-pasted across ~8 files | Single source of truth: `BASIC`, `ENTERPRISE`, `ONLY_CRM`, `ONLY_DATA`, `ADMIN_HOLD`, `BLOCKED` |
| `stripe` | raw cURL + SDK mix | Official SDK; **`webhooks.constructEvent` signature verification everywhere** (none exists today); the abandoned `app/Siftr Integration/` Node harness already demonstrates this pattern |
| `zohoBooks` | 4+ inline copies of contact→invoice→payment | One client + the `zoho_transactions` idempotency ledger on every path |
| `siftrClient` | hardcoded bearer in 4 files | Prod/staging URL from env |
| `convosoClient` | `ConvosoAPI.php` (805 lines) | Port faithfully — it's the best code in the system; keep the disposition map + state-timezone map as data files |
| `db`, `logger`, `webhookAuth` | — | Logger redacts tokens/PII; webhookAuth adds shared-secret validation to GHL-fired webhooks (all unauthenticated today) |

---

## 3. Phase 0 — Audit & decisions (do this before writing code)

1. **Establish what's actually live.** The code is in a startling half-test state: every Stripe key is `sk_test_…` (live keys only in comments), `stripe-webhook.php` hardcodes `$testing = true` (zeroes credits/amounts reported to Siftr), signature verification is explicitly disabled. Check the Stripe dashboard (live-mode webhook endpoints + keys), the old server's crontab, GHL workflow list, and DB row timestamps to learn which flows carry real traffic. **This determines how much of Phase 3 is even needed.**
2. **Product answers needed** (§9): real Basic-tier lead counts (code says both 5000/8000/10000 *and* 20/35/50), late-fee policy (the flag is inverted in code — which behavior was intended?), LCDS active usage, portal retirement timeline.
3. **Snapshot production data**: `mysqldump` both custom DBs; archive (offline, not in git) the webhook logs — they're the golden test fixtures for the port.

## 4. Phase 1 — Foundation (~2–4 days)

Scaffold `platform/` service; MariaDB up + data imported; shared modules from §2.6; health endpoint; PM2 + Nginx server block for `app.landcaller.com` (serving on the VPS but **not yet in DNS**); `.env` with rotated secrets; smoke tests hitting the legacy-path routes.

## 5. Phase 2 — Provisioning & entitlement (~1–1.5 weeks)

Port with URL parity: OAuth pair (`authorize`/`callback` — add `state`, stop echoing tokens), `create_location`, `createUser`, activations (`basic`/`enterprise`/`only_crm`/`data_only`), `contract_status`, `plan_renew_date_update`, `admin_hold_update_permission`, lookups (`check_sub_account`, `get_location_details` — now authenticated), lead-count crons, SSO (`sso-launch` with the new keypair), the three JS injectors, `create-contact` webhook, script-checklist mini-tool (3 tables + 4 endpoints + 1 page).

Fix deliberately during the port (each is a documented bug): duplicate-row insert for returning emails; `data_only_webhook` nulling `total_contact`; `activate_only_crm_user` dying before success; admin hold being apply-only; the `active_window_time` start-vs-end conflict (pick one semantic); un-pin `basic_user_leadcheck` from its hardcoded test location so server-side cap enforcement actually runs.

## 6. Phase 3 — Billing engine (~1.5–2 weeks, scope pending Phase-0 audit)

> **Executed 2026-07-22 as option 3a** (see `docs/phase0-audit.md`): the audit
> plus dashboard checks (GHL transactions run on GHL-native payments; no
> Convoso postback exists; all 7 old-server crons are test-only billing jobs)
> proved the engine never ran live. Only the GHL-purchase→Zoho bridge was
> ported (`platform/src/routes/billing.ts`, secret-gated). Everything below
> stays a 501 stub that logs hits as a soak-detector; the original scope is
> kept for the record. Outstanding: eyes-on Stripe live-mode dashboard check
> (both accounts) as a pre-cutover confirmation.

Checkout creators (Basic + Connect split, Enterprise upfront/manual/subscription, CRM-only); both Stripe webhooks re-built on verified events with an idempotency table; `billing_schedules` engine as a service (cycle/term math is well documented — 4-week Mon–Fri blocks); pause/resume/hold controls; dunning + reminders + scheduled-invoice crons; Zoho Books via the single client.

Explicitly **drop** (dead today): `auto_renew_on_off.php` (empty stub), `cron_auto_resume.php` (references nonexistent function/table), `check-leads.php` (mysqli on a PDO app), `payment_information.php` render path (unreachable). Fix: `auto_resume.php` one-per-run `die`, inverted `disable_late_fees` check, `blockaccess`-vs-`blocked` comparison in `cronjobunpaid`, `$testing` → env flag.

## 7. Phase 4 — Cutover of `app.landcaller.com` (~2–3 days + monitoring)

1. Replay archived real webhook payloads (sanitized) against the new service in a staging DB; diff resulting DB state against expectations.
2. Announce a short freeze window; final `mysqldump` → import; verify row counts.
3. Repoint DNS `app.landcaller.com` → VPS (record is 300s TTL). All Stripe/GHL/Convoso traffic follows automatically.
4. Watch structured logs + Slack alerts; old server stays untouched as rollback (DNS revert) for ≥2 weeks. Note rollback re-diverges DBs — keep the freeze window short and the cutover during a low-traffic hour.

## 8. Phase 5 — LCDS (~2–3 weeks)

Order: DB import → Convoso client + webhooks + crons (headless parity) → EJS dashboard rebuild (~14 pages, matches this repo's EJS/admin patterns) → then the completion work that was never finished in PHP: **real** GHL contact push (reuse Phase-2 `ghlClient` + the per-campaign `ghl_pipeline_id`/`ghl_stage_id`), real DNC/compliance decision (the `ComplianceChecker` is a stub — for a cold-calling business this is legal exposure, not polish), import dedupe, auth **on** by default (the PHP ships with auth bypassed unless `APP_ENV=production`; seeded admin password is literally "password"), fix `Lead::create`-missing API path and the dead quick-action buttons.

`data.landcaller.com` note: the Siftr dashboard is external — only the SSO exchange needs to keep working (Phase 2).

## 9. Phase 6 — Portal endgame (business-timed)

zportals cannot move. It keeps running on the old WordPress via the existing Nginx proxy at `/client-portal`. When clients are fully on the new CRM (`my.landcaller.com`), replace the proxy with a redirect, cancel the old hosting, and the last dependency on the old server dies. Until then the old WP hosting plan must stay active.

---

## 10. Open questions for the team

1. Which Stripe account/mode is production money actually flowing through today? (Code = test keys + `$testing=true`.)
2. Basic tiers: is the entitlement 5,000/8,000/10,000 leads or 20/35/50?
3. Are late fees meant to be on? (Current code applies them only when the "disable" flag is set.)
4. Is LCDS in active daily use, and by whom? (Determines Phase-5 urgency and whether the UI port can lag the API port.)
5. Portal retirement date — how long must the WP proxy live?
6. Who coordinates with Siftr for the new SSO public key and rotated partner bearer?

## 11. Rough total

~6–8 weeks of focused work for one developer across Phases 1–5, with Phase 3 the most compressible depending on the Phase-0 audit. Phases 2 and 3 are independent enough to parallelize if two people are available.
