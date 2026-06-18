import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { about, team } from "../models/about.js";

/** Renders the About page (legacy content reproduced in the new design). */
export function renderAbout(_req: Request, res: Response): void {
  res.render("about", {
    site,
    navLinks,
    footerLinks,
    about,
    team,
    isHome: false,
    year: new Date().getFullYear(),
  });
}
