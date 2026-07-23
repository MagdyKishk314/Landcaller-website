# Phase 5 — LCDS audit & recommendation (retire, don't port)

Data-driven verdict on the LCDS lead-calling system, from the production
database dump (`u353253270_lcds_db`, exported 2026-07-22) plus the Convoso
dashboard checks recorded in `phase0-audit.md`.

## 1. What the production data says

14 tables; only 4 ever held data:

| Table | Rows | Meaning |
|---|---|---|
| `leads` | 229 | 109 `imported` + 120 `validated` — **no lead ever advanced further** |
| `campaigns` | 2 | configured, never dialed |
| `file_imports` | 9 | all between **2026-03-14 and 2026-03-19** (5 days of use, ever) |
| `users` | 1 | a single admin account |
| `call_results` | **0** | **not one call outcome was ever recorded** |
| `batch_queue`, `dnc_list`, `compliance_logs`, `api_logs`, `system_logs`, `notifications`, `settings`, `imports_log`, `validation_errors` | 0 | pipeline never ran |

The `lead_status` enum has 15 stages (`imported → validated →
sent_to_convoso → calling → … → qualified_lead → sent_to_ghl → converted`).
Production data only ever reached stage 2. Zero leads were sent to the
dialer; zero dispositions came back; zero were handed to GHL.

## 2. Corroborating evidence (independent sources)

- **Convoso**: no postback/adaptor/plugin configured anywhere (phase0-audit
  §6.3) — the return path for call results was never wired.
- **Old-server crontab**: none of the three LCDS crons (`batch-processor`,
  `sync-status`, `refresh-dispositions`) was ever scheduled (phase0-audit
  §6.4) — the outbound pipeline never ran unattended.
- **Code**: the GHL push, Siftr feedback, and DNC ComplianceChecker
  integrations are stubs (migration plan §2.3).
- **Apex URLs**: `landcaller.com/app/lcds/*` has answered 404 since the
  2026-07-21 DNS move, with zero complaints since — nothing and nobody calls
  it.

## 3. Conclusion

LCDS was a 5-day pilot in March 2026 that imported 229 leads, validated 120
of them once (2026-04-15), and never dialed a single call. It is not a
production system in maintenance; it is an unfinished build that was
abandoned. ("Idle since March" undersold it — it was never live at all.)

## 4. Recommendation for Phase 5

**Retire instead of port.** Concretely:

1. **Archive the data** — the `lcds_db` import already on the VPS *is* the
   archive; export `leads` to CSV for the team if they want the 229 records
   in a spreadsheet.
2. **Do not port** `app/lcds/` (~40 PHP files, half-finished integrations,
   unauthenticated webhooks). If lead-calling becomes a business priority
   later, build it fresh inside the platform service — the Convoso account,
   campaign config, and the ported provisioning/Siftr clients give a new
   build a far better starting point than the stub-riddled PHP.
3. **Drop the planned `/app/` Nginx proxy** (phase0-audit §4) — four months
   of 404s prove nothing needs those URLs.
4. **Pending team confirmation**: the standing question "why did LCDS stop in
   March?" becomes "confirm LCDS never launched and isn't about to" — if the
   team confirms, Phase 5 closes as *retired* with zero engineering work.

## 5. Effect on the overall plan

- Phase 5 effort: ~2 weeks (plan §8) → **~0** (archival only).
- The old Hostinger server's remaining purposes shrink to exactly one: the
  zportals client portal (`/client-portal`). Phase 6 (portal retirement) is
  now the only thing between the company and cancelling the old hosting
  entirely.
