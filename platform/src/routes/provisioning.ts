import { Router } from "express";
import { logger } from "../logger.js";
import { ghl } from "../lib/ghl.js";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";
import * as tenants from "../repos/tenants.js";

/**
 * Tenant provisioning webhooks - port of create_location.php / createUser.php.
 * Fired by GHL workflows (now with the shared-secret query param).
 *
 * Legacy bug fixed: a returning email used to INSERT a duplicate registry row
 * with a NULL location_id. Now an existing email reuses its location and only
 * gets a fresh user (the legacy intent: an extra caller seat).
 */
const router = Router();

// Post-create role bump the legacy code did twice to make GHL "stick" the
// admin role; one explicit re-assert has proven sufficient with the current API.
const CREATE_SCOPES = [
  "dashboard/stats.readonly",
  "settings.write",
  "users/team-management.write",
  "users/team-management.readonly",
];

router.post("/create_location.php", requireWebhookSecret, async (req, res) => {
  const b = req.body ?? {};
  const email = String(b.email ?? "").trim();
  const firstName = String(b.first_name ?? "").trim();
  const lastName = String(b.last_name ?? "").trim();
  if (!email || !firstName) {
    res.status(400).json({ status: "error", message: "first_name and email are required" });
    return;
  }

  try {
    const existing = await tenants.findByEmail(email);
    let locationId: string;
    let locationName: string;

    if (existing?.location_id) {
      locationId = existing.location_id;
      locationName = existing.name ?? `${firstName} ${lastName}`.trim();
      logger.info("create_location: reusing existing location for email", { locationId });
    } else {
      const loc = (await ghl.createLocation({
        firstName,
        lastName,
        email,
        phone: b.phone,
        address: b.full_address,
        city: b.city,
        state: b.state,
        country: b.country,
        postalCode: b.postalCode,
      })) as { id?: string; name?: string };
      if (!loc.id) throw new Error("GHL createLocation returned no id");
      locationId = loc.id;
      locationName = loc.name ?? `${firstName} ${lastName}`.trim();
      await tenants.insertTenant({
        name: locationName,
        firstName,
        lastName,
        email,
        phone: b.phone,
        address: b.full_address,
        city: b.city,
        state: b.state,
        country: b.country,
        postalCode: b.postalCode,
        locationId,
      });
    }

    const user = (await ghl.createUser({
      firstName,
      lastName,
      email,
      phone: b.phone,
      locationId,
    })) as { id?: string };
    if (user.id) {
      await tenants.setGhlUser(locationId, user.id);
      await ghl.updateUserById(user.id, { role: "admin", scopes: CREATE_SCOPES });
    }

    res.json({
      status: "success",
      location_id: locationId,
      ghl_user_id: user.id ?? null,
      reused_location: Boolean(existing?.location_id),
    });
  } catch (err) {
    logger.error("create_location failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "provisioning failed" });
  }
});

router.post("/createUser.php", requireWebhookSecret, async (req, res) => {
  const b = req.body ?? {};
  const locationId = String(b.location_id ?? "").trim();
  const email = String(b.email ?? "").trim();
  if (!locationId || !email) {
    res.status(400).json({ status: "error", message: "location_id and email are required" });
    return;
  }

  try {
    const user = (await ghl.createUser({
      firstName: String(b.first_name ?? ""),
      lastName: String(b.last_name ?? ""),
      email,
      phone: b.phone,
      locationId,
    })) as { id?: string };
    if (!user.id) throw new Error("GHL createUser returned no id");

    await ghl.updateUserById(user.id, { scopes: ["dashboard/stats.readonly"] });
    await tenants.setUserAndContact(locationId, user.id, b.contact_id ? String(b.contact_id) : null);

    res.json({ status: "success", ghl_user_id: user.id });
  } catch (err) {
    logger.error("createUser failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ status: "error", message: "user creation failed" });
  }
});

export default router;
