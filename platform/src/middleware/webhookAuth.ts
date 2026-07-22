import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Shared-secret gate for GHL-workflow-fired webhooks. The legacy endpoints
 * were fully unauthenticated; the port requires `?key=<secret>` (or the
 * `x-lc-webhook-secret` header) on every such route. GHL workflow webhook
 * URLs get the query param appended when they're repointed at cutover.
 */
export function requireWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  const provided =
    (typeof req.query.key === "string" ? req.query.key : "") ||
    (req.header("x-lc-webhook-secret") ?? "");
  const expected = config.ghl.webhookSharedSecret;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);

  if (!ok) {
    logger.warn("webhook rejected: bad shared secret", { path: req.path, ip: req.ip });
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
