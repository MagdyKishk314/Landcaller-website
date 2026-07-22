import { Router } from "express";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";
import * as tenants from "../repos/tenants.js";

/**
 * Lookup endpoints - port of check_sub_account.php / get_location_details.php.
 * Legacy served these with CORS * and no auth (open email/location
 * enumeration); the port requires the shared secret.
 */
const router = Router();

router.get("/check_sub_account.php", requireWebhookSecret, async (req, res) => {
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
  if (!email) {
    res.status(400).json({ status: "error", message: "email is required" });
    return;
  }
  const row = await tenants.findByEmail(email);
  if (row?.location_id) {
    res.json({ exists: true, location_id: row.location_id, ghl_user_id: row.ghl_user_id });
  } else {
    res.json({ exists: false });
  }
});

router.get("/get_location_details.php", requireWebhookSecret, async (req, res) => {
  const locationId = typeof req.query.location_id === "string" ? req.query.location_id.trim() : "";
  if (!locationId) {
    res.status(400).json({ status: "error", message: "location_id is required" });
    return;
  }
  const row = await tenants.findByLocationId(locationId);
  if (!row) {
    res.status(404).json({ status: "error", message: "not found" });
    return;
  }
  res.json({ name: row.name, email: row.email, location_id: row.location_id });
});

export default router;
