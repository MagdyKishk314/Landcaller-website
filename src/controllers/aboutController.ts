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
    pageTitle: "About Land Caller | Land Investor Cold Calling Company",
    pageDescription:
      "Meet the team behind Land Caller, the first and only cold calling lead generation company built exclusively for vacant land investors. Veteran-founded and land-focused.",
    canonical: `${site.url}/about`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}
