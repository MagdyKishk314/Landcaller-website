import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Siftr partner API client. The legacy code hardcoded the bearer token in four
 * files and pointed one flow at staging by accident; here both come from env.
 */

export interface SiftrPurchase {
  orderId: string;
  clientType: "BASIC" | "ENTERPRISE" | "CRMONLY" | "DATA";
  credits: number;
  amountPaidCents: number;
  ghlLocationId: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
  };
  [extra: string]: unknown;
}

export async function postPartnerPurchase(
  purchase: SiftrPurchase
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${config.siftr.apiUrl}/api/partner/purchase`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.siftr.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchase),
  });
  const body = await res.json().catch(() => ({}));
  logger.info("siftr purchase posted", {
    orderId: purchase.orderId,
    clientType: purchase.clientType,
    status: res.status,
  });
  return { ok: res.ok, status: res.status, body };
}
