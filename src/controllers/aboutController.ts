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
      "Land Caller is the first-ever cold calling lead generation company built for vacant land investors - veteran-founded by a land flipper who pioneered cold calling in an industry dominated by direct mail.",
    canonical: `${site.url}/about`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}
