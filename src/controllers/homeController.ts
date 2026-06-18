import type { Request, Response } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import {
  hero,
  problem,
  guide,
  callSamples,
  howItWorks,
  resultsStats,
  whatSetsApart,
  testimonials,
  comparisonRows,
  faqs,
  contactFields,
} from "../models/content.js";
import { enterprisePlan, basicPlan } from "../models/pricing.js";
import { blogPosts } from "../models/blog.js";

/**
 * Builds the home page view model and renders the story-driven funnel.
 * Sections are composed from reusable partials fed by the content model;
 * "teaser" sections (guide, packages, blog) link out to dedicated pages.
 * `faqs` and `testimonials` are passed so the FAQPage/Review JSON-LD emits.
 */
export function renderHome(_req: Request, res: Response): void {
  res.render("home", {
    site,
    navLinks,
    footerLinks,
    hero,
    problem,
    guide,
    callSamples,
    howItWorks,
    resultsStats,
    whatSetsApart,
    testimonials,
    // Condensed "us vs everyone else" mini-table; full set lives on /cold-calling-vs-direct-mail.
    comparisonRows: comparisonRows.slice(0, 4),
    enterprise: enterprisePlan,
    basic: basicPlan,
    // Latest 3 posts for the blog teaser; full list on /blog.
    blogPosts: blogPosts.slice(0, 3),
    faqs: faqs.slice(0, 5),
    contactFields,
    // Inline scheduler URL for the booking climax (themed to the dark site).
    calendlyUrl: site.externalLinks.bookACall,
    isHome: true,
    year: new Date().getFullYear(),
  });
}
