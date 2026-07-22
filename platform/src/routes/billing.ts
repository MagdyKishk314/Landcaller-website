import { Router } from "express";
import { logger } from "../logger.js";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";
import * as zoho from "../lib/zohoBooks.js";

/**
 * Phase 3, option 3a (see docs/phase0-audit.md): the ONE live billing flow.
 *
 * Port of stripe_products/ghl_product_purchase.php - a GHL workflow fires
 * this webhook after a storefront purchase (GHL-native payments; provider
 * Stripe under the hood) and we book it in Zoho: contact -> invoice ->
 * payment. No local DB writes, same as legacy.
 *
 * The rest of the legacy billing engine (checkout creators, both Stripe
 * webhooks, billing_schedules cycle engine, dunning crons) is deliberately
 * NOT ported: Phase 0 proved it never ran in live mode. Those paths stay as
 * 501 stubs in routes/legacy.ts, which log any hit during the pre-cutover
 * soak - if real traffic ever shows up there, we revisit.
 *
 * Changes vs legacy: shared-secret auth added (GHL workflow URL gets ?key=
 * appended at cutover), and no debug log file of raw payloads in the webroot.
 */
const router = Router();

router.post("/stripe_products/ghl_product_purchase.php", requireWebhookSecret, async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;

  // Legacy required id (GHL contact ID), email, total_price - same contract.
  const contactId = typeof b.id === "string" || typeof b.id === "number" ? String(b.id) : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!contactId || !email || b.total_price === undefined || b.total_price === null) {
    res.status(400).type("text/plain").send("Invalid payload: missing id (contact ID), email, or total_price");
    return;
  }

  const amount = Number.parseFloat(String(b.total_price));
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).type("text/plain").send("Invalid amount");
    return;
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const gateway = typeof b.payment_gateway === "string" && b.payment_gateway ? b.payment_gateway : "stripe";
  const discountCode = typeof b.discount_code === "string" ? b.discount_code : "";

  // Legacy reference: ghl_<contactId>_<unix seconds>. Well under Zoho's
  // 49-char reference_number limit for real GHL contact ids.
  const transactionId = `ghl_${contactId}_${Math.floor(Date.now() / 1000)}`;

  try {
    const zohoContactId = await zoho.findOrCreateContact(name, email, phone);
    const invoiceId = await zoho.createInvoice(zohoContactId, amount, `GHL Product Purchase - ${transactionId}`, {
      lineDescription: `Product purchased via ${gateway}${discountCode ? ` (Discount: ${discountCode})` : ""}`,
      referenceNumber: transactionId,
      notes: `GHL Contact ID: ${contactId}\nCustomer: ${name}\nEmail: ${email}\nPayment Gateway: ${gateway}`,
    });
    await zoho.recordPayment(zohoContactId, invoiceId, amount, transactionId, gateway, {
      description: `Payment for GHL product purchase ${transactionId}`,
    });
    logger.info("ghl purchase booked in zoho", { transactionId, invoiceId, amount });
    res.type("text/plain").send("OK - Payment recorded in Zoho Books");
  } catch (err) {
    logger.error("ghl purchase zoho bridge failed", {
      transactionId,
      error: err instanceof Error ? err.message : String(err),
      body: err instanceof zoho.ZohoApiError ? err.body : undefined,
    });
    res.status(500).type("text/plain").send("Zoho integration failed");
  }
});

export default router;
