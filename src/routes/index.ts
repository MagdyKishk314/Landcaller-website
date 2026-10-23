import { Router } from "express";
import { renderHome } from "../controllers/homeController.js";
import { renderAbout } from "../controllers/aboutController.js";
import { submitContact } from "../controllers/contactController.js";
import {
  renderPricing,
  renderData,
  renderAffiliate,
} from "../controllers/pagesController.js";
import { renderSitemap } from "../controllers/seoController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import adminRouter from "./admin.js";

const router = Router();

router.get("/", asyncHandler(renderHome));

// Retired service pages - 301 to home to preserve any inbound link equity.
router.get("/land-investor-cold-calling", (_req, res) => res.redirect(301, "/"));
router.get("/cold-calling-vs-direct-mail", (_req, res) => res.redirect(301, "/"));
// The blog was retired - send any indexed /blog URLs home as well.
router.get(["/blog", "/blog/:slug"], (_req, res) => res.redirect(301, "/"));

// Funnel spoke pages
router.get("/pricing", renderPricing);
router.get("/data", renderData);
// Legacy "CRM + Data" slugs - the CRM was dropped; 301 to the Data page.
router.get(["/crm", "/crm-and-data"], (_req, res) => res.redirect(301, "/data"));

router.get("/about", renderAbout);
router.get("/about-us", (_req, res) => res.redirect(301, "/about"));

// Affiliate program. /become-an-affiliate (the legacy slug) 301s to /affiliate.
router.get("/affiliate", renderAffiliate);
router.get("/become-an-affiliate", (_req, res) => res.redirect(301, "/affiliate"));

// Admin (testimonials CMS)
router.use("/admin", adminRouter);

// SEO infrastructure
router.get("/sitemap.xml", renderSitemap);

router.post("/contact", submitContact);

export default router;
