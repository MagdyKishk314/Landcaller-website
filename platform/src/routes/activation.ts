import { Router } from "express";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { ghl } from "../lib/ghl.js";
import { postPartnerPurchase } from "../lib/siftr.js";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";
import * as tenants from "../repos/tenants.js";

/**
 * Plan-activation webhooks - port of activate_basic_user.php,
 * activate_enterprise_user.php, activate_only_crm_user.php,
 * data_only_webhook.php, contract_status.php, plan_renew_date_update.php.
 *
 * Deliberate fixes vs legacy (each was a documented bug):
 * - only_crm no longer dies before its success response, and reports
 *   clientType CRMONLY to Siftr (legacy hardcoded ENTERPRISE).
 * - data-only no longer wipes total_contact to NULL.
 * - Siftr customer names are real names (legacy sent the email in both).
 * All endpoints require the webhook shared secret (legacy: none).
 */
const router = Router();

router.use(
  [
    "/activate_basic_user.php",
    "/activate_enterprise_user.php",
    "/activate_only_crm_user.php",
    "/data_only_webhook.php",
    "/contract_status.php",
    "/plan_renew_date_update.php",
    "/webhooks/admin_hold_update_permission.php",
  ],
  requireWebhookSecret
);

/** Non-fatal Siftr notify shared by the activation flows. */
async function notifySiftr(
  row: tenants.TenantRow,
  clientType: "BASIC" | "ENTERPRISE" | "CRMONLY" | "DATA",
  extras: { orderId?: string; credits?: number; amountPaidCents?: number } = {}
): Promise<{ ok: boolean; status?: number }> {
  try {
    const r = await postPartnerPurchase({
      orderId: extras.orderId ?? `LC-${Date.now()}`,
      clientType,
      credits: extras.credits ?? 0,
      amountPaidCents: extras.amountPaidCents ?? 0,
      ghlLocationId: row.location_id ?? "",
      customer: {
        email: row.email,
        firstName: row.first_name ?? "",
        lastName: row.last_name ?? "",
      },
    });
    return { ok: r.ok, status: r.status };
  } catch (err) {
    logger.warn("siftr notify failed (non-fatal)", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false };
  }
}

router.post("/activate_basic_user.php", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const totalLeads = Number(req.body?.totalLeads ?? 0);
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (!row?.ghl_user_id) {
    res.status(404).json({ status: "error", message: "No account found for that email" });
    return;
  }
  try {
    await ghl.applyProfile(row.ghl_user_id, "BASIC");
    const updated = await tenants.activateBasic(email, Number.isFinite(totalLeads) ? totalLeads : 0);
    res.json({ status: "success", updated_rows: updated });
  } catch (err) {
    logger.error("activate_basic failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "activation failed" });
  }
});

router.post("/activate_enterprise_user.php", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const paymentStatus = req.body?.payment_status === "paid" ? "paid" : "unpaid";
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (!row?.ghl_user_id) {
    res.status(404).json({ status: "error", message: "No account found for that email" });
    return;
  }
  try {
    // Flip payment_status on the customer's contact in the master location
    // (non-fatal; requires GHL_MASTER_LOCATION_ID + a stored contact_id).
    if (paymentStatus === "paid" && row.contact_id && config.ghl.masterLocationId) {
      try {
        await ghl.setContactCustomFieldByName(
          config.ghl.masterLocationId,
          row.contact_id,
          "payment_status",
          "paid"
        );
      } catch (err) {
        logger.warn("master-contact payment_status update failed (non-fatal)", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    await ghl.applyProfile(row.ghl_user_id, "ENTERPRISE");
    const updated = await tenants.activateEnterprise(row.ghl_user_id, paymentStatus);
    const siftr = await notifySiftr(row, "ENTERPRISE");
    res.json({ status: "success", updated_rows: updated, siftr });
  } catch (err) {
    logger.error("activate_enterprise failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "activation failed" });
  }
});

router.post("/activate_only_crm_user.php", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (!row?.ghl_user_id) {
    res.status(404).json({ status: "error", message: "No account found for that email" });
    return;
  }
  try {
    await ghl.applyProfile(row.ghl_user_id, "ONLY_CRM");
    const updated = await tenants.activateOnlyCrm(row.ghl_user_id);
    const siftr = await notifySiftr(row, "CRMONLY");
    res.json({ status: "success", updated_rows: updated, siftr });
  } catch (err) {
    logger.error("activate_only_crm failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "activation failed" });
  }
});

router.post("/data_only_webhook.php", async (req, res) => {
  const b = req.body ?? {};
  const email = String(b.customData?.email ?? b.email ?? "").trim();
  const rawLeads = b.customData?.totalLeads ?? b.totalLeads;
  const totalLeads = rawLeads === undefined || rawLeads === null ? null : Number(rawLeads);
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (!row?.ghl_user_id) {
    res.status(404).json({ status: "error", message: "No account found for that email" });
    return;
  }
  try {
    await ghl.applyProfile(row.ghl_user_id, "ONLY_DATA");
    const updated = await tenants.activateDataOnly(
      row.ghl_user_id,
      totalLeads !== null && Number.isFinite(totalLeads) ? totalLeads : null
    );
    const siftr = await notifySiftr(row, "DATA", { orderId: b.orderId });
    res.json({
      status: "success",
      updated_rows: updated,
      siftr,
      dashboard_url: "https://data.landcaller.com/",
    });
  } catch (err) {
    logger.error("data_only activation failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "activation failed" });
  }
});

/**
 * Admin hold - strips marketing/social/etc. permissions while keeping core
 * CRM (the ADMIN_HOLD profile). As in legacy, this only APPLIES a hold;
 * lifting one means re-running the matching activation webhook.
 */
router.post("/webhooks/admin_hold_update_permission.php", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (!row?.ghl_user_id) {
    res.status(404).json({ status: "error", message: "No account found for that email" });
    return;
  }
  try {
    await ghl.applyProfile(row.ghl_user_id, "ADMIN_HOLD");
    res.json({ status: "success" });
  } catch (err) {
    logger.error("admin hold failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "hold failed" });
  }
});

router.post("/contract_status.php", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const status = String(req.body?.status ?? "").trim();
  if (!email || !status) {
    res.status(400).json({ status: "error", message: "email and status are required" });
    return;
  }
  const updated = await tenants.setContractSigned(email, status);
  if (updated === 0) {
    res.status(404).json({ status: "error", message: "User not found" });
    return;
  }
  res.json({ status: "success", message: "Contract status updated successfully" });
});

router.post("/plan_renew_date_update.php", async (req, res) => {
  const locationId = String(req.body?.location_id ?? "").trim();
  const renewDate = String(req.body?.plan_auto_renew_date ?? "").trim();
  if (!locationId || !renewDate) {
    res.status(400).json({ success: false, message: "location_id and plan_auto_renew_date are required" });
    return;
  }
  const updated = await tenants.setRenewDate(locationId, renewDate);
  res.json({ success: true, updated_rows: updated });
});

export default router;
