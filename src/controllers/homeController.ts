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
import { listTestimonials } from "../repositories/testimonialRepository.js";
import type { Testimonial } from "../models/types.js";

/**
 * Builds the home page view model and renders the story-driven funnel.
 * Sections are composed from reusable partials fed by the content model;
 * "teaser" sections (guide, packages) link out to dedicated pages.
 * `faqs` and `testimonials` are passed so the FAQPage/Review JSON-LD emits.
 */
export async function renderHome(_req: Request, res: Response): Promise<void> {
  // Admin-managed testimonials; fall back to the static set on any DB error.
  let testimonialList: Testimonial[];
  try {
    testimonialList = await listTestimonials();
  } catch (err) {
    console.error("[home] failed to load testimonials:", err);
    testimonialList = testimonials;
  }

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
    testimonials: testimonialList,
    // Condensed "us vs everyone else" mini-table; full set lives on /cold-calling-vs-direct-mail.
    comparisonRows: comparisonRows.slice(0, 4),
    enterprise: enterprisePlan,
    basic: basicPlan,
    faqs: faqs.slice(0, 5),
    contactFields,
    // Inline scheduler URL for the booking climax (themed to the dark site).
    calendlyUrl: site.externalLinks.bookACall,
    isHome: true,
    year: new Date().getFullYear(),
  });
}
