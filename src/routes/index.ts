import { Router } from "express";
import { renderHome } from "../controllers/homeController.js";
import { renderAbout } from "../controllers/aboutController.js";
import { submitContact } from "../controllers/contactController.js";
import { renderService, renderComparison } from "../controllers/pagesController.js";
import { renderSitemap } from "../controllers/seoController.js";

const router = Router();

router.get("/", renderHome);

// High-intent SEO landing pages
router.get("/land-investor-cold-calling", renderService);
router.get("/cold-calling-vs-direct-mail", renderComparison);

router.get("/about", renderAbout);
router.get("/about-us", (_req, res) => res.redirect(301, "/about"));

// SEO infrastructure
router.get("/sitemap.xml", renderSitemap);

router.post("/contact", submitContact);

export default router;
