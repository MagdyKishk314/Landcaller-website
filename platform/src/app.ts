import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { logger } from "./logger.js";
import { withAsyncErrors } from "./lib/asyncPatch.js";
import healthRouter from "./routes/health.js";
import oauthRouter from "./routes/oauth.js";
import provisioningRouter from "./routes/provisioning.js";
import activationRouter from "./routes/activation.js";
import lookupsRouter from "./routes/lookups.js";
import cronsRouter from "./routes/crons.js";
import ssoRouter from "./routes/sso.js";
import injectorsRouter from "./routes/injectors.js";
import accesscheckRouter from "./routes/accesscheck.js";
import customPopupRouter from "./routes/customPopup.js";
import contactWebhookRouter from "./routes/contactWebhook.js";
import scriptChecklistRouter from "./routes/scriptChecklist.js";
import billingRouter from "./routes/billing.js";
import legacyRouter from "./routes/legacy.js";

/**
 * The platform service behind app.landcaller.com (Nginx -> PM2 -> here).
 * Serves the URL-compatible port of the legacy PHP endpoints.
 */
export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Stripe webhook routes need the RAW body for signature verification -
  // register raw parsing for them BEFORE the JSON parser.
  app.use(
    ["/stripe-webhook.php", "/stripe_products/enterprise_webhook.php"],
    express.raw({ type: "*/*", limit: "1mb" })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Robots-Tag", "noindex, nofollow"); // API host - never index
    next();
  });

  // Implemented legacy-path routers mount BEFORE the stub inventory; Express
  // first-match wins, so anything not yet ported still answers 501 below.
  // withAsyncErrors routes rejected promises into the JSON error handler.
  const routers = [
    healthRouter,
    oauthRouter,
    provisioningRouter,
    activationRouter,
    lookupsRouter,
    cronsRouter,
    ssoRouter,
    injectorsRouter,
    accesscheckRouter,
    customPopupRouter,
    contactWebhookRouter,
    scriptChecklistRouter,
    billingRouter,
    legacyRouter,
  ];
  for (const r of routers) app.use(withAsyncErrors(r));

  app.use((req, res) => {
    logger.warn("unknown path", { path: req.path, method: req.method });
    res.status(404).json({ error: "not_found" });
  });

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("unhandled error", { path: req.path, error: err.message, stack: err.stack });
    res.status(500).json({ error: "internal" });
  });

  return app;
}
