import type { RowDataPacket } from "mysql2/promise";
import { getGhlPool } from "../db.js";
import { ghl } from "../lib/ghl.js";
import { logger } from "../logger.js";

/**
 * Lead-count reconciliation jobs - port of leadcountcheck.php and
 * basic_user_leadcheck.php.
 *
 * Deliberate changes vs legacy:
 * - active_window_time now has ONE semantic: the window START (the legacy cron
 *   stored an end date while the accesscheck page stored a start - the two
 *   writers disagreed). The reader computes expiry as start + 30 days.
 * - Cap enforcement runs for ALL basic accounts (legacy was pinned to a single
 *   hardcoded test location, disabling it in production).
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CountRow extends RowDataPacket {
  location_id: string;
  total_contact: string | null;
  active_window_time: string | null;
}

export interface JobSummary {
  processed: number;
  updated: number;
  errors: number;
}

/** Refresh contact_count / contact_limit_reach / active_window_time for every tenant. */
export async function runLeadCountCheck(): Promise<JobSummary> {
  const pool = getGhlPool();
  const [rows] = await pool.query<CountRow[]>(
    "SELECT location_id, total_contact, active_window_time FROM ghl_sub_accounts WHERE location_id IS NOT NULL AND location_id <> ''"
  );
  const summary: JobSummary = { processed: 0, updated: 0, errors: 0 };

  for (const row of rows) {
    summary.processed++;
    try {
      const live = await ghl.getContactCount(row.location_id);
      if (live === null) continue;

      const cap = row.total_contact;
      const unlimited = cap === null || cap === "" || cap === "unlimited" || Number(cap) === 0;
      const reached = !unlimited && live >= Number(cap);

      // Window start: set once when the cap is first reached, cleared when back under.
      const windowExpr = reached
        ? "COALESCE(active_window_time, NOW())"
        : "NULL";

      await pool.query(
        `UPDATE ghl_sub_accounts
           SET contact_count = ?, contact_limit_reach = ?, active_window_time = ${windowExpr}
         WHERE location_id = ?`,
        [live, reached ? "Yes" : "No", row.location_id]
      );
      summary.updated++;
    } catch (err) {
      summary.errors++;
      logger.warn("leadcountcheck row failed", {
        locationId: row.location_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await sleep(200);
  }
  logger.info("leadcountcheck complete", { ...summary });
  return summary;
}

interface BasicRow extends RowDataPacket {
  location_id: string;
  ghl_user_id: string | null;
  total_contact: string | null;
}

/** Revoke contact creation for BASIC accounts at/over their cap. */
export async function runBasicCapEnforcement(): Promise<JobSummary> {
  const pool = getGhlPool();
  const [rows] = await pool.query<BasicRow[]>(
    `SELECT location_id, ghl_user_id, total_contact FROM ghl_sub_accounts
     WHERE \`Package\` = 'BASIC' AND plan_status = 'active'
       AND total_contact REGEXP '^[0-9]+$' AND contact_creation_access = 1`
  );
  const summary: JobSummary = { processed: 0, updated: 0, errors: 0 };

  for (const row of rows) {
    summary.processed++;
    try {
      if (!row.ghl_user_id) continue;
      const live = await ghl.getContactCount(row.location_id);
      if (live === null || live === 0) continue;
      if (live < Number(row.total_contact)) continue;

      await ghl.applyProfile(row.ghl_user_id, "CAP_BLOCKED");
      await pool.query(
        "UPDATE ghl_sub_accounts SET contact_creation_access = 0, plan_status = 'suspended' WHERE location_id = ?",
        [row.location_id]
      );
      summary.updated++;
      logger.info("basic cap enforced", { locationId: row.location_id, live, cap: row.total_contact });
    } catch (err) {
      summary.errors++;
      logger.warn("basic cap enforcement row failed", {
        locationId: row.location_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await sleep(200);
  }
  logger.info("basic cap enforcement complete", { ...summary });
  return summary;
}
