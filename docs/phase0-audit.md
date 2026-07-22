# Phase 0 Audit — What Was Actually Live

**Date:** 2026-07-22 · companion to `platform-migration-plan.md`
**Method:** forensics on the production export in `Landcaller CRM GHL Plugin/` (log contents + file modification times, which the export preserved; export taken ~2026-07-07), plus live DNS/endpoint probes run today. No dashboards or servers were accessed. PII was not extracted — only counts, dates, and modes.

---

## 1. Flow-by-flow activity (from log mtimes + content)

| Flow | Evidence | Last activity | Verdict at export time |
|---|---|---|---|
| Enterprise Stripe webhook (`enterpriselog.log`, 11 MB) | 4,998 events | **2026-07-02** | Active — but see §2 |
| GHL provisioning (`request_log.txt`, 3.9 MB) | requests spanning 2026-02-18 → 06-24 | **2026-06-24** | **Active** |
| Bridge Stripe webhook + activations (`stripe_webhook.log`, `activeenuser.log`, `webhook.log`) | 59 checkout sessions | **2026-06-23** | Active — but see §2 |
| GHL storefront → Zoho bridge (`ghl_product_purchase.log`) | entries incl. obvious test contacts | **2026-06-23** | Active (mixed test/real — needs team confirm) |
| Contract pause / update (`contract_pause.log`, `update_contract.log`) | — | **2026-06-23** | Active |
| Basic activation (`activate_basic_user.log`) | — | 2026-06-16 | Active |
| Admin hold (`webhooks/*_log.txt`) | — | 2026-05-28 | Occasional |
| Data-only upgrades (`data_only_log.log`) | — | 2026-04-13 | Occasional |
| **LCDS — entire lead system** | last CSV import **and** last `storage/logs/app.log` entry both **2026-03-19** | **2026-03-19** | **Idle for ~4 months** |
| SSO debug, contract status | — | Mar–Apr 2026 | Occasional |

## 2. The Stripe engine never ran in live mode

Three independent confirmations:

1. **Every logged Stripe event is `"livemode": false`** — 4,998 in `enterpriselog.log`, 278 in `webhooks/stripe-webhook.txt`, zero `true` anywhere.
2. **All 59 checkout sessions in the bridge log are `cs_test_…`**; zero `cs_live_…`.
3. **Every `sk_live_` key in the code is commented out** (4 occurrences, all `// …`); every active key is `sk_test_…`. This matches `$testing = true` and "NO SIGNATURE VERIFY FOR TESTING" in the webhook handlers.

**Implication:** real customer revenue does *not* flow through this Stripe code. It most plausibly flows through GHL-native payments on `my.landcaller.com` (the `ghl_product_purchase.php` → Zoho Books bridge is the piece of this codebase that touches it) and/or manual invoicing. The `billing_schedules` engine, dunning crons, and checkout creators are an **unlaunched build**.

**Plan impact:** Phase 3 shrinks from "port a live billing system carefully" to a decision:
- **3a (recommended default):** port only what's provably production: the GHL-purchase→Zoho bridge and the Zoho Books client. Park the rest of the Stripe engine as documented-but-unported until the business decides to launch self-serve billing — at which point building it cleanly in Node beats porting the buggy PHP.
- **3b:** port the full engine anyway to preserve optionality (adds ~1.5–2 weeks for code with zero production track record).

## 3. LCDS is dormant

Last import and last log line are both 2026-03-19. Phase 5 therefore has no urgency-of-continuity constraint — it can be sequenced as "rebuild properly, then relaunch calling with real DNC compliance" rather than a hot migration. Confirm with the team *why* it stopped (paused business process vs. broken system) — that changes whether relaunch is a priority.

## 4. Live infrastructure state (probed today)

- `app.landcaller.com` still resolves to the **old** hosting and the app layer answers (HTTP 200) — Stripe/GHL webhook targets are intact. Do not change this DNS record until Phase 4 cutover.
- The old server still serves LCDS internally (200 via direct probe).
- **Gap found:** LCDS's public URLs live on the apex (`landcaller.com/app/lcds/…`), which now points at the new site → **HTTP 404**. If Convoso's disposition-postback URL is configured with an apex URL, postbacks have failed silently since the DNS move (2026-07-21). LCDS being idle since March makes this low-urgency, but the fix is one Nginx block on the VPS (same pattern as the `/client-portal` proxy):

```nginx
    # Legacy LCDS app - still lives on the old Hostinger server
    location ^~ /app/ {
        proxy_pass https://82.180.172.113;
        proxy_set_header Host landcaller.com;
        proxy_ssl_name landcaller.com;
        proxy_ssl_server_name on;
    }
```

The new site serves nothing under `/app/`, so this collides with nothing.

## 5. Answers to the plan's open questions (so far)

| # | Question | Status |
|---|---|---|
| 1 | Which Stripe mode is production? | **Answered empirically: none — the engine is test-only.** Remaining: confirm in the Stripe dashboard that no live webhook endpoints/keys exist outside this code, and confirm where real payments actually happen (GHL payments? manual?). |
| 2 | Basic tier: 5k/8k/10k vs 20/35/50 leads | Still needs a product answer |
| 3 | Late fees intended on/off | Still needs a product answer (moot if 3a chosen) |
| 4 | Is LCDS in active use? | **Answered: idle since 2026-03-19.** Remaining: why? |
| 5 | Portal retirement date | Still needs a business answer |
| 6 | Siftr coordination for key rotation | Still needs an owner |

## 6. Remaining checklist (needs your dashboards / access)

1. **Stripe dashboard** (both accounts — "Land Caller" and "Land Caller LLC"): Developers → API keys (any live keys in use?) and → Webhooks (any live-mode endpoints?). Screenshot both.
2. **GHL agency**: ~~confirm how customer payments are collected~~ **Answered 2026-07-22:** GHL Payments → Transactions in the Land Caller LLC master account shows ~320 transactions, provider **Stripe** (connected account), source "Enterprise Onboarding Survey", $250 charges through Jun 2026. Recent rows are mostly test contacts — whether the charges are live-mode money is settled by checklist item 1. Still needed: export/screenshot the workflow list that references `app.landcaller.com` URLs (the plan's cutover inventory).
3. **Convoso dashboard**: ~~find the configured postback/webhook URL~~ **Answered 2026-07-22: no postback configured anywhere** — campaign Dispositions (Standard + Quick), Apps → Adaptors, and Apps → Plugins are all empty of URLs. The old system received call results only via the hourly `sync-status` polling cron; nothing on Convoso's side points at any Landcaller URL, so nothing broke at the DNS move and nothing needs reconfiguring at cutover.
4. **Old-server crontab**: ~~screenshot~~ **Answered 2026-07-22** (hPanel → landcaller.com → Advanced → Cron Jobs). 7 jobs, every one a `curl -s https://app.landcaller.com/...`:
   - `* * * * *` (every minute): `stripe_products/send_scheduled_invoices.php`, `stripe_products/invoice_remainder_cron.php`, `stripe_products/pre_charge_reminder.php`, `cronjobunpaid.php`, `stripe_products/auto_resume.php`, `stripe_products/cron_auto_renew_terms.php`
   - `0 0 * * *` (daily midnight): `stripe_products/payment_reminders.php`
   - **Notable absences** (unless the list scrolls past 7 rows — unconfirmed): `leadcountcheck.php` (lead-count/cap enforcement apparently never cron-driven in production) and all three LCDS crons (`batch-processor`, `sync-status`, `refresh-dispositions` — so even the hourly Convoso polling backstop was never scheduled; combined with the no-postback finding, Convoso results ingestion appears to have been manual/never-live).
   - 6 of 7 jobs belong to the Stripe billing engine, which §2 shows is test-only — they run every minute against test data.
5. **Database snapshots** (hPanel → Databases → phpMyAdmin, or SSH):
   ```bash
   mysqldump -u <user> -p u353253270_Landcaller_ghl > landcaller_ghl_2026-07-22.sql
   mysqldump -u <user> -p u353253270_lcds_db      > lcds_db_2026-07-22.sql
   ```
   Store outside any git repo (they contain customer PII).
6. **Team confirms**: why LCDS stopped in March; where real revenue flows; Basic-tier entitlement; portal retirement timeline.

---

*Once items 1–2 confirm the no-live-Stripe finding, the plan's Phase 3 should be re-scoped to option 3a and the total estimate drops by roughly 1.5–2 weeks.*
