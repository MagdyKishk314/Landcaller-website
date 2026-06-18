import { Router } from "express";
import { renderHome } from "../controllers/homeController.js";
import { renderAbout } from "../controllers/aboutController.js";
import { submitContact } from "../controllers/contactController.js";

const router = Router();

router.get("/", renderHome);
router.get("/about", renderAbout);
router.get("/about-us", (_req, res) => res.redirect(301, "/about"));
router.post("/contact", submitContact);

export default router;
