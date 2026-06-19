import { Router } from "express";
import { renderHome } from "../controllers/homeController.js";
import { renderAbout } from "../controllers/aboutController.js";
import { submitContact } from "../controllers/contactController.js";
import {
  renderPricing,
  renderBlog,
  renderBlogPost,
} from "../controllers/pagesController.js";
import { renderSitemap } from "../controllers/seoController.js";

const router = Router();

router.get("/", renderHome);

// Retired service pages - 301 to home to preserve any inbound link equity.
router.get("/land-investor-cold-calling", (_req, res) => res.redirect(301, "/"));
router.get("/cold-calling-vs-direct-mail", (_req, res) => res.redirect(301, "/"));

// Funnel spoke pages
router.get("/pricing", renderPricing);
router.get("/blog", renderBlog);
router.get("/blog/:slug", renderBlogPost);

router.get("/about", renderAbout);
router.get("/about-us", (_req, res) => res.redirect(301, "/about"));

// SEO infrastructure
router.get("/sitemap.xml", renderSitemap);

router.post("/contact", submitContact);

export default router;
