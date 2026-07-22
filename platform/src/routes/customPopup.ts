import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { config } from "../config.js";
import { getGhlPool } from "../db.js";
import { logger } from "../logger.js";
import { renderCustomPopupJs } from "../injectors/customPopupJs.js";

/**
 * custom_popup.js.php + its data endpoint. The script embeds only the
 * location-id list; per-location fields come from /custom_popup_data.php
 * (the legacy embedded every tenant's name/email for all visitors).
 */
const router = Router();

// Second hardcoded special location the legacy skipped alongside the master.
const SPECIAL_SKIP_ID = "SZhHK0p76LKulqidPqOf";

const EMPTY_DATE = "0000-00-00 00:00:00";

interface IdRow extends RowDataPacket {
  location_id: string;
}
interface DataRow extends RowDataPacket {
  plan_status: string | null;
  active_window_time: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  Package: string | null;
  is_all_leads_delivered: string | null;
  is_enteprise_contract_ending: string | null;
  plan_auto_renew_date: string | null;
  contract_status: string | null;
}

router.get("/custom_popup.js.php", async (_req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "https://app.gohighlevel.com");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

  let ids: string[] = [];
  try {
    const [rows] = await getGhlPool().query<IdRow[]>(
      "SELECT location_id FROM ghl_sub_accounts WHERE location_id IS NOT NULL AND location_id <> ''"
    );
    ids = rows.map((r) => r.location_id);
  } catch (err) {
    logger.warn("custom_popup id list degraded to empty", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  res.send(
    renderCustomPopupJs({
      allLocationIds: ids,
      masterLocationIds: [config.ghl.masterLocationId, SPECIAL_SKIP_ID].filter(Boolean),
      dataUrl: "/custom_popup_data.php",
    })
  );
});

router.get("/custom_popup_data.php", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://app.gohighlevel.com");
  res.setHeader("Cache-Control", "no-store");
  const loc = typeof req.query.loc === "string" ? req.query.loc.trim() : "";
  if (!loc) {
    res.status(400).json({});
    return;
  }
  const [rows] = await getGhlPool().query<DataRow[]>(
    `SELECT plan_status, active_window_time, first_name, last_name, email, \`Package\`,
            is_all_leads_delivered, is_enteprise_contract_ending, plan_auto_renew_date, contract_status
       FROM ghl_sub_accounts WHERE location_id = ? LIMIT 1`,
    [loc]
  );
  const r = rows[0];
  if (!r) {
    res.status(404).json({});
    return;
  }
  const hasWindow = Boolean(r.active_window_time) && r.active_window_time !== EMPTY_DATE;
  const windowExpired = hasWindow
    ? Date.now() > new Date((r.active_window_time as string).replace(" ", "T")).getTime() + 30 * 86_400_000
    : false;
  res.json({
    plan_status: (r.plan_status ?? "").trim().toLowerCase(),
    window_expired: windowExpired,
    first_name: r.first_name ?? "",
    last_name: r.last_name ?? "",
    email: r.email ?? "",
    package: r.Package ?? "",
    is_all_leads_delivered: r.is_all_leads_delivered,
    is_enteprise_contract_ending: r.is_enteprise_contract_ending,
    plan_auto_renew_date: r.plan_auto_renew_date ?? "",
    contract_status: (r.contract_status ?? "").toLowerCase(),
  });
});

export default router;
