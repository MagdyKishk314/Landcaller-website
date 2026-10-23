import type { Request, Response, NextFunction } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { env } from "../config/env.js";
import { pricingPage } from "../models/pages.js";
import { dataPage } from "../models/data.js";

/** Canonical, crawlable URLs for the XML sitemap. */
const ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: dataPage.path, changefreq: "monthly", priority: "0.8" },
  { path: pricingPage.path, changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

/**
 * Build/deploy date, captured once at module load rather than per request, so
 * <lastmod> reflects when the site was last shipped instead of a misleadingly
 * "always today" value. Override with SITE_BUILD_DATE (YYYY-MM-DD) in CI.
 */
const LASTMOD = (process.env.SITE_BUILD_DATE || new Date().toISOString().slice(0, 10));

/** GET /sitemap.xml - the canonical routes above. */
export function renderSitemap(_req: Request, res: Response): void {
  const lastmod = LASTMOD;
  const urls = ROUTES
    .map(
      (r) =>
        `  <url>\n    <loc>${site.url}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
}

/**
 * Unknown route handler. Pages this site doesn't serve may still exist on the
 * legacy server, so GET/HEAD requests are redirected there with the same path
 * and query string (302, so nothing is cached if the page is later added here).
 * Everything else - other methods, no fallback configured, or a request that
 * is already on the fallback host (would loop) - gets a real 404 page.
 */
export function renderNotFound(req: Request, res: Response): void {
  const origin = env.fallbackOrigin;
  if (origin && (req.method === "GET" || req.method === "HEAD")) {
    let fallbackHost = "";
    try {
      fallbackHost = new URL(origin).hostname.toLowerCase();
    } catch {
      /* malformed FALLBACK_ORIGIN - fall through to the 404 page */
    }
    const here = (req.hostname || "").toLowerCase();
    if (fallbackHost && here !== fallbackHost) {
      res.redirect(302, `${origin}${req.originalUrl}`);
      return;
    }
  }
  res.status(404).render("404", {
    site,
    navLinks,
    footerLinks,
    pageTitle: "Page Not Found (404) | Land Caller",
    pageDescription:
      "The page you're looking for doesn't exist. Explore Land Caller's cold calling lead generation service for land investors instead.",
    canonical: `${site.url}/`,
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** Final error handler - logs the error and renders a 500 page. */
export function renderError(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[error]", err);
  if (res.headersSent) return;
  res.status(500).render("404", {
    site,
    navLinks,
    footerLinks,
    pageTitle: "Something went wrong | Land Caller",
    pageDescription:
      "Something went wrong on our end. Please try again, or head back to the Land Caller home page.",
    canonical: `${site.url}/`,
    isHome: false,
    year: new Date().getFullYear(),
  });
}
