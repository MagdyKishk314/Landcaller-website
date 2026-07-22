import { Router } from "express";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";
import { runLeadCountCheck, runBasicCapEnforcement } from "../jobs/leadCount.js";

/**
 * Cron entry points - the legacy system triggered these jobs by URL from
 * crontab; the port keeps that shape (with the shared secret) so the VPS
 * crontab can `curl` them. They can also be invoked from a worker later.
 */
const router = Router();

router.get("/leadcountcheck.php", requireWebhookSecret, async (_req, res) => {
  const summary = await runLeadCountCheck();
  res.json({ status: "success", message: "cron completed", ...summary });
});

router.get("/basic_user_leadcheck.php", requireWebhookSecret, async (_req, res) => {
  const summary = await runBasicCapEnforcement();
  res.json({ status: "success", message: "cron completed", ...summary });
});

export default router;
