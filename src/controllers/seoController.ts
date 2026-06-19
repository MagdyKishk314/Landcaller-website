import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { pricingPage, blogPage } from "../models/pages.js";

/**
 * Canonical, crawlable URLs for the XML sitemap. Individual blog posts are
 * intentionally omitted while they hold placeholder content (they're also
 * marked noindex); add them back once real articles ship.
 */
const ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: pricingPage.path, changefreq: "monthly", priority: "0.8" },
  { path: blogPage.path, changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

/**
 * Build/deploy date, captured once at module load rather than per request, so
 * <lastmod> reflects when the site was last shipped instead of a misleadingly
 * "always today" value. Override with SITE_BUILD_DATE (YYYY-MM-DD) in CI.
 */
const LASTMOD = (process.env.SITE_BUILD_DATE || new Date().toISOString().slice(0, 10));

/** GET /sitemap.xml - generated from the canonical route list. */
export function renderSitemap(_req: Request, res: Response): void {
  const lastmod = LASTMOD;
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${site.url}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
}

/** 404 handler - renders a real Not Found page with a 404 status (no soft redirect). */
export function renderNotFound(_req: Request, res: Response): void {
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
