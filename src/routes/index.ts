import { Router } from "express";
import { renderHome } from "../controllers/homeController.js";
import { renderAbout } from "../controllers/aboutController.js";
import { submitContact } from "../controllers/contactController.js";
import {
  renderPricing,
  renderCrm,
  renderBlog,
  renderBlogPost,
} from "../controllers/pagesController.js";
import { renderSitemap } from "../controllers/seoController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import adminRouter from "./admin.js";

const router = Router();

router.get("/", asyncHandler(renderHome));

// Retired service pages - 301 to home to preserve any inbound link equity.
router.get("/land-investor-cold-calling", (_req, res) => res.redirect(301, "/"));
router.get("/cold-calling-vs-direct-mail", (_req, res) => res.redirect(301, "/"));

// Funnel spoke pages
router.get("/pricing", renderPricing);
router.get("/crm", renderCrm);
// Legacy CRM URL preserved as a 301 to the canonical /crm.
router.get("/crm-and-data", (_req, res) => res.redirect(301, "/crm"));
router.get("/blog", asyncHandler(renderBlog));
router.get("/blog/:slug", asyncHandler(renderBlogPost));

router.get("/about", renderAbout);
router.get("/about-us", (_req, res) => res.redirect(301, "/about"));

// Blog admin / CMS
router.use("/admin", adminRouter);

// SEO infrastructure
router.get("/sitemap.xml", asyncHandler(renderSitemap));

router.post("/contact", submitContact);

export default router;
