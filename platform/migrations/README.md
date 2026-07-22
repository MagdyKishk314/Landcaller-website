# Migrations

Ordering on a fresh VPS:

1. **Import the production dumps first** (they are the authoritative schema for
   the business tables — do not hand-create those):
   ```bash
   mysql -u root -p -e "CREATE DATABASE landcaller_ghl CHARACTER SET utf8mb4; CREATE DATABASE lcds_db CHARACTER SET utf8mb4;"
   mysql -u root -p landcaller_ghl < landcaller_ghl_YYYY-MM-DD.sql
   mysql -u root -p lcds_db      < lcds_db_YYYY-MM-DD.sql   # Phase 5
   ```
   Dumps contain customer PII — they live on the VPS only, never in git.

2. **Run the port's migrations** (adds `oauth_tokens`, `webhook_events`,
   `schema_migrations`):
   ```bash
   cd platform && npm run migrate
   ```

3. **Seed the GHL agency token** by completing the OAuth connect flow once
   (`/authorize.php` → `/callback.php`) after Phase 2 lands. Do NOT copy the
   legacy `agency_token_response.json` — the client secret it was minted with
   is being rotated, which invalidates the old refresh token anyway.

New migrations: add `NNN_description.sql` files here; the runner applies them
in filename order and records each in `schema_migrations`.
