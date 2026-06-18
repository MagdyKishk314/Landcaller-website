import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import {
  hero,
  whoWeAre,
  whatSetsApart,
  testimonials,
  comparisonRows,
  packages,
  packagesDisclaimer,
  featureMatrix,
  featureMatrixDisclaimer,
  faqs,
  affiliateTiers,
  contactFields,
} from "../models/content.js";

/**
 * Builds the home page view model and renders the single-page layout.
 * The source site is a one-page app; every section is composed from
 * reusable partials fed by the content model.
 */
export function renderHome(_req: Request, res: Response): void {
  res.render("home", {
    site,
    navLinks,
    footerLinks,
    hero,
    whoWeAre,
    whatSetsApart,
    testimonials,
    comparisonRows,
    packages,
    packagesDisclaimer,
    featureMatrix,
    featureMatrixDisclaimer,
    faqs,
    affiliateTiers,
    contactFields,
    isHome: true,
    year: new Date().getFullYear(),
  });
}
