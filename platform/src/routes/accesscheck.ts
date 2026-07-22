import { Router, type Request } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { getGhlPool } from "../db.js";
import { ghl } from "../lib/ghl.js";
import { logger } from "../logger.js";
import { renderAccesscheckJs, type AccesscheckVerdicts } from "../injectors/accesscheckJs.js";

/**
 * accesscheck.php - the main in-CRM gatekeeper. Computes plan/cap/billing
 * verdicts server-side and emits the enforcement JS.
 * active_window_time semantics: window START (+30 days = expiry) - the single
 * semantic the port standardized on.
 * Failure policy: any DB/API error degrades to default (permissive) verdicts -
 * this script must never break the CRM UI.
 */
const router = Router();

interface AccountRow extends RowDataPacket {
  total_contact: string | null;
  active_window_time: string | null;
  plan_status: string | null;
  Package: string | null;
}
interface ChargeRow extends RowDataPacket {
  due_date: string;
  amount: string;
}
interface PauseRow extends RowDataPacket {
  campaign_status: string;
  pause_weeks: number | null;
}

function resolveLocation(req: Request): string {
  let loc = typeof req.query.loc === "string" ? req.query.loc.trim() : "";
  const ref = req.headers.referer ?? "";
  const m = /location\/([^/]+)/.exec(ref);
  if (m?.[1]) loc = m[1]; // Referer wins (legacy behavior)
  return loc;
}

const EMPTY_DATE = "0000-00-00 00:00:00";
const DAY_MS = 86_400_000;

router.get("/accesscheck.php", async (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  const locId = resolveLocation(req);
  const verdicts: AccesscheckVerdicts = {
    isRestricted: false,
    showDataDashboard: false,
    dataOnlyUpgrade: false,
    daysLeft: null,
    locId,
    upcomingCharge: null,
    adminBlock: null,
  };

  if (locId) {
    try {
      const pool = getGhlPool();
      const [rows] = await pool.query<AccountRow[]>(
        "SELECT total_contact, active_window_time, plan_status, `Package` FROM ghl_sub_accounts WHERE location_id = ?",
        [locId]
      );
      const acc = rows[0];
      if (acc) {
        verdicts.showDataDashboard = (acc.plan_status ?? "").toLowerCase() === "active";
        verdicts.dataOnlyUpgrade = (acc.Package ?? "").toLowerCase() === "only_data";

        const capRaw = acc.total_contact;
        const hasWindow = Boolean(acc.active_window_time) && acc.active_window_time !== EMPTY_DATE;

        if (capRaw === null || capRaw.toLowerCase() === "unlimited") {
          if (hasWindow) {
            await pool.query("UPDATE ghl_sub_accounts SET active_window_time = NULL WHERE location_id = ?", [locId]);
          }
        } else {
          const cap = Number(capRaw);
          const live = (await ghl.getContactCount(locId)) ?? 0;
          if (live >= cap) {
            await pool.query("UPDATE ghl_sub_accounts SET is_all_leads_delivered = 'true' WHERE location_id = ?", [locId]);
            if ((acc.Package ?? "").toLowerCase() === "basic") {
              let windowStart: Date;
              if (!hasWindow) {
                windowStart = new Date();
                await pool.query("UPDATE ghl_sub_accounts SET active_window_time = ? WHERE location_id = ?", [
                  windowStart.toISOString().slice(0, 19).replace("T", " "),
                  locId,
                ]);
              } else {
                windowStart = new Date((acc.active_window_time as string).replace(" ", "T"));
              }
              const expire = windowStart.getTime() + 30 * DAY_MS;
              const now = Date.now();
              if (now > expire) {
                verdicts.isRestricted = true;
                verdicts.daysLeft = 0;
              } else {
                verdicts.daysLeft = Math.ceil((expire - now) / DAY_MS);
              }
            }
          } else if (hasWindow) {
            await pool.query("UPDATE ghl_sub_accounts SET active_window_time = NULL WHERE location_id = ?", [locId]);
          }
        }

        const [charges] = await pool.query<ChargeRow[]>(
          `SELECT due_date, amount FROM billing_schedules
           WHERE location_id = ? AND pre_charge_reminder_sent = 1 AND paid = 0
             AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
           LIMIT 1`,
          [locId]
        );
        if (charges[0]) verdicts.upcomingCharge = { due_date: charges[0].due_date, amount: charges[0].amount };

        const [pauses] = await pool.query<PauseRow[]>(
          "SELECT campaign_status, pause_weeks FROM billing_schedules WHERE location_id = ? AND campaign_status = 'paused' LIMIT 1",
          [locId]
        );
        if (pauses[0]) {
          verdicts.adminBlock = { campaign_status: pauses[0].campaign_status, pause_weeks: pauses[0].pause_weeks };
        }
      }
    } catch (err) {
      logger.warn("accesscheck degraded to defaults", {
        locId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  res.send(renderAccesscheckJs(verdicts));
});

export default router;
