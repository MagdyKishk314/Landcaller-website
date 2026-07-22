import Stripe from "stripe";
import { config } from "../config.js";

/**
 * Two Stripe accounts, as in the legacy system:
 * - "Land Caller" (LC): enterprise plans, CRM-only subscriptions.
 * - "Land Caller LLC" (LLC): Basic lead packages with the Siftr Connect split.
 * Keys are lazy so the service boots without them until billing routes exist.
 *
 * Unlike the PHP, every webhook MUST verify signatures via verifyEvent().
 */

let lc: Stripe | null = null;
let llc: Stripe | null = null;

export function stripeLc(): Stripe {
  if (!lc) lc = new Stripe(config.stripe.secretKeyLc);
  return lc;
}

export function stripeLlc(): Stripe {
  if (!llc) llc = new Stripe(config.stripe.secretKeyLlc);
  return llc;
}

/**
 * Verify and parse a webhook payload. `rawBody` must be the exact raw bytes
 * (mount express.raw() on webhook routes - JSON parsing breaks signatures).
 */
export function verifyEvent(
  account: "lc" | "llc",
  rawBody: Buffer,
  signatureHeader: string,
  webhookSecret: string
): Stripe.Event {
  const client = account === "lc" ? stripeLc() : stripeLlc();
  return client.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
}
