import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { pricingPage, affiliatePage } from "../models/pages.js";
import {
  crmPage,
  crmIntro,
  crmPerformance,
  crmIntegration,
  crmDataDashboard,
  crmCta,
  crmComingSoon,
} from "../models/crm.js";
import { featureMatrix, featureMatrixDisclaimer, affiliateTiers } from "../models/content.js";
import { enterprisePlan, basicPlan, dataCostsNote } from "../models/pricing.js";

/** "/pricing" - full packages + feature matrix (moved off the home funnel). */
export function renderPricing(_req: Request, res: Response): void {
  res.render("pricing", {
    site,
    navLinks,
    footerLinks,
    page: pricingPage,
    enterprise: enterprisePlan,
    basic: basicPlan,
    dataCostsNote,
    featureMatrix,
    featureMatrixDisclaimer,
    pageTitle: pricingPage.title,
    pageDescription: pricingPage.description,
    canonical: `${site.url}${pricingPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Pricing", path: pricingPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/**
 * "/crm" - the CRM + Data showcase. The Data dashboard is live; the CRM sections
 * carry a "coming soon" button (wired in crm.ejs) while the CRM is being built.
 */
export function renderCrm(_req: Request, res: Response): void {
  res.render("crm", {
    site,
    navLinks,
    footerLinks,
    page: crmPage,
    crmIntro,
    crmPerformance,
    crmIntegration,
    crmDataDashboard,
    crmCta,
    crmComingSoon,
    pageTitle: crmPage.title,
    pageDescription: crmPage.description,
    canonical: `${site.url}${crmPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Data + CRM", path: crmPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/affiliate" - the affiliate program page (three referral tiers). */
export function renderAffiliate(_req: Request, res: Response): void {
  res.render("affiliate", {
    site,
    navLinks,
    footerLinks,
    page: affiliatePage,
    affiliateTiers,
    pageTitle: affiliatePage.title,
    pageDescription: affiliatePage.description,
    canonical: `${site.url}${affiliatePage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Affiliates", path: affiliatePage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}
