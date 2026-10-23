import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { pricingPage, affiliatePage } from "../models/pages.js";
import {
  dataPage,
  dataDashboard,
  dataDelivery,
  dataPerformance,
  dataCta,
} from "../models/data.js";
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

/** "/data" - the Data Dashboard showcase (Smart Estimates, lead delivery, QA). */
export function renderData(_req: Request, res: Response): void {
  res.render("data", {
    site,
    navLinks,
    footerLinks,
    page: dataPage,
    dataDashboard,
    dataDelivery,
    dataPerformance,
    dataCta,
    pageTitle: dataPage.title,
    pageDescription: dataPage.description,
    canonical: `${site.url}${dataPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Data", path: dataPage.path },
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
