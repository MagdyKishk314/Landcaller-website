import crypto from "node:crypto";
import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Zoho Books client - replaces the 4+ inline PHP copies of the
 * contact -> invoice -> payment sequence with one implementation.
 * Token caching is time-correct (the PHP initialized expiry to the string
 * '3600' and therefore refreshed on every call).
 */

type Json = Record<string, unknown>;

export class ZohoApiError extends Error {
  constructor(message: string, public readonly body: unknown) {
    super(message);
  }
}

let cached: { token: string; expiresAtMs: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAtMs - 300_000) return cached.token;
  const params = new URLSearchParams({
    refresh_token: config.zoho.refreshToken,
    client_id: config.zoho.clientId,
    client_secret: config.zoho.clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(`${config.zoho.accountsBase}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = (await res.json()) as Json;
  if (!res.ok || !data.access_token) {
    throw new ZohoApiError("Zoho token refresh failed", data);
  }
  cached = {
    token: String(data.access_token),
    expiresAtMs: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

async function zohoRequest<T = Json>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${config.zoho.apiBase}${path}${sep}organization_id=${config.zoho.organizationId}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Json;
  // Zoho uses code=0 for success inside a 200/201 envelope.
  if (!res.ok || (typeof data.code === "number" && data.code !== 0)) {
    throw new ZohoApiError(`Zoho ${method} ${path} failed`, data);
  }
  return data as T;
}

export async function findContactByEmail(email: string): Promise<string | null> {
  const data = await zohoRequest<{ contacts?: Array<{ contact_id: string }> }>(
    "GET",
    `/contacts?search_text=${encodeURIComponent(email)}`
  );
  return data.contacts?.[0]?.contact_id ?? null;
}

export async function createContact(name: string, email: string): Promise<string> {
  const data = await zohoRequest<{ contact?: { contact_id: string } }>("POST", "/contacts", {
    contact_name: name || email,
    contact_persons: [{ email, is_primary_contact: true }],
  });
  if (!data.contact) throw new ZohoApiError("Zoho contact create returned no contact", data);
  return data.contact.contact_id;
}

export async function findOrCreateContact(name: string, email: string): Promise<string> {
  return (await findContactByEmail(email)) ?? (await createContact(name, email));
}

export async function createInvoice(
  contactId: string,
  amount: number,
  description: string
): Promise<string> {
  const data = await zohoRequest<{ invoice?: { invoice_id: string } }>("POST", "/invoices", {
    customer_id: contactId,
    line_items: [{ name: description.slice(0, 100), rate: amount, quantity: 1 }],
  });
  if (!data.invoice) throw new ZohoApiError("Zoho invoice create returned no invoice", data);
  return data.invoice.invoice_id;
}

export async function recordPayment(
  contactId: string,
  invoiceId: string,
  amount: number,
  referenceNumber: string,
  paymentMode = "stripe"
): Promise<void> {
  await zohoRequest("POST", "/customerpayments", {
    customer_id: contactId,
    payment_mode: paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1),
    amount,
    date: new Date().toISOString().slice(0, 10),
    reference_number: referenceNumber,
    invoices: [{ invoice_id: invoiceId, amount_applied: amount }],
  });
}

/**
 * Port of recordPaymentInZoho(): contact -> invoice -> payment for a single
 * charge. `transactionId` is hashed into a <=49-char reference number exactly
 * like the PHP did (Zoho's reference_number length limit).
 */
export async function recordPaymentFlow(p: {
  email: string;
  name: string;
  amount: number;
  description: string;
  transactionId: string;
  paymentMode?: string;
}): Promise<{ invoiceId: string }> {
  const reference = `pay_${crypto.createHash("md5").update(p.transactionId).digest("hex")}`.slice(0, 49);
  const contactId = await findOrCreateContact(p.name, p.email);
  const invoiceId = await createInvoice(contactId, p.amount, p.description);
  await recordPayment(contactId, invoiceId, p.amount, reference, p.paymentMode ?? "stripe");
  logger.info("zoho payment recorded", { invoiceId, amount: p.amount });
  return { invoiceId };
}
