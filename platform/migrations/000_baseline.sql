-- Baseline for tables the NODE PORT introduces. Business tables
-- (ghl_sub_accounts, billing_schedules, zoho_transactions, script_* ) come
-- from the production mysqldump import - see migrations/README.md. This file
-- only creates what the legacy system never had.

-- OAuth tokens move out of webroot JSON files into the DB.
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider      VARCHAR(50) NOT NULL UNIQUE,     -- 'ghl_agency'
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    DATETIME NOT NULL,
  company_id    VARCHAR(100) NULL,
  raw           JSON NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Webhook idempotency ledger (the legacy system replayed events blindly).
CREATE TABLE IF NOT EXISTS webhook_events (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  source       VARCHAR(50) NOT NULL,             -- 'stripe_bridge' | 'stripe_enterprise' | 'ghl' | ...
  external_id  VARCHAR(255) NOT NULL,            -- Stripe event id / session id / etc.
  status       ENUM('received','processed','failed','skipped') NOT NULL DEFAULT 'received',
  error        TEXT NULL,
  received_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  UNIQUE KEY uq_source_external (source, external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Applied-migrations bookkeeping (used by src/scripts/migrate.ts).
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
