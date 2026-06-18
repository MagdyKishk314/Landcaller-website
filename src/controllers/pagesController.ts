import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { servicePage, comparisonPage } from "../models/pages.js";

/**
 * "/land-investor-cold-calling" - high-intent service landing page.
 * Note: testimonials/faqs are intentionally NOT passed here so the schema
 * partial only emits Review/FAQPage markup on pages where that content is
 * visibly rendered (the home page), per Google's structured-data guidelines.
 */
export function renderService(_req: Request, res: Response): void {
  res.render("service", {
    site,
    navLinks,
    footerLinks,
    page: servicePage,
    pageTitle: servicePage.title,
    pageDescription: servicePage.description,
    canonical: `${site.url}${servicePage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Land Investor Cold Calling", path: servicePage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/cold-calling-vs-direct-mail" - comparison landing page. */
export function renderComparison(_req: Request, res: Response): void {
  res.render("comparison-page", {
    site,
    navLinks,
    footerLinks,
    page: comparisonPage,
    pageTitle: comparisonPage.title,
    pageDescription: comparisonPage.description,
    canonical: `${site.url}${comparisonPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cold Calling vs Direct Mail", path: comparisonPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}
