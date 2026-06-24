import express, { type Application } from "express";
import compression from "compression";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { renderNotFound, renderError } from "./controllers/seoController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

/**
 * Cache-busting asset URL helper. Appends ?v=<short content hash> so a rebuilt
 * CSS/JS file gets a fresh URL (assets are served immutable + long-cache, and
 * the filenames are stable). Hashes are cached in production; recomputed in dev
 * so a client rebuild is picked up without restarting the server.
 */
const assetHashes = new Map<string, string>();
function assetUrl(publicRelPath: string): string {
  let hash = assetHashes.get(publicRelPath);
  if (!hash || !env.isProd) {
    try {
      const full = path.join(projectRoot, "public", publicRelPath.replace(/^\/+/, ""));
      hash = crypto.createHash("sha1").update(fs.readFileSync(full)).digest("hex").slice(0, 8);
    } catch {
      hash = "dev";
    }
    if (env.isProd) assetHashes.set(publicRelPath, hash);
  }
  return `${publicRelPath}?v=${hash}`;
}

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  // Exposed to every template as asset('/assets/...') for cache-busted URLs.
  app.locals.asset = assetUrl;

  // Vercel edge/CDN already compresses responses.
  if (!process.env.VERCEL) {
    app.use(compression());
  }
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Security headers (mirrors vercel.json so the VPS/local get them too).
  const CSP =
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://assets.calendly.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "frame-src https://calendly.com https://assets.calendly.com; " +
    "connect-src 'self' https://calendly.com https://assets.calendly.com; " +
    "base-uri 'self'; form-action 'self'";

  // Only the canonical production host should be indexable. Any other host
  // (Vercel preview, raw VPS IP, staging) gets an explicit noindex so it can
  // never compete with or leak ahead of landcaller.com.
  const PROD_HOSTS = new Set(["landcaller.com", "www.landcaller.com"]);

  app.use((req, res, next) => {
    // Exposed to every template so the navbar can highlight the active page.
    res.locals.currentPath = req.path;

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );
    res.setHeader("Content-Security-Policy", CSP);

    // HSTS - only meaningful over HTTPS. Vercel adds this automatically; on the
    // VPS (behind an HTTPS reverse proxy) req.secure is true via trust proxy.
    if (req.secure) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }

    const host = (req.hostname || "").toLowerCase();
    if (!PROD_HOSTS.has(host)) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }
    next();
  });

  // Static assets (css, js, images) reproduced 1:1 from the source site.
  app.use(
    "/assets",
    express.static(path.join(projectRoot, "public", "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );
  // Favicon and any root-level public files.
  app.use(express.static(path.join(projectRoot, "public")));

  app.use("/", routes);

  // Real 404: render a Not Found page with a 404 status (no soft-redirect).
  app.use(renderNotFound);

  // Final safety net: log unexpected errors and render a 500 page.
  app.use(renderError);

  return app;
}
