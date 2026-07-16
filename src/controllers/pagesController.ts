import type { Request, Response, NextFunction } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { pricingPage, blogPage, joinUsPage, affiliatePage } from "../models/pages.js";
import {
  crmPage,
  crmIntro,
  crmPerformance,
  crmIntegration,
  crmDataDashboard,
  crmCta,
  crmComingSoon,
} from "../models/crm.js";
import { featureMatrix, featureMatrixDisclaimer, affiliateTiers } from "../models/content.js";
import { enterprisePlan, basicPlan, dataCostsNote } from "../models/pricing.js";
import {
  listPublishedPosts,
  getPublishedPostBySlug,
} from "../repositories/postRepository.js";
import type { BlogPost, BlogPostRecord } from "../models/types.js";

/** "/pricing" - full packages + feature matrix (moved off the home funnel). */
export function renderPricing(_req: Request, res: Response): void {
  res.render("pricing", {
    site,
    navLinks,
    footerLinks,
    page: pricingPage,
    enterprise: enterprisePlan,
    basic: basicPlan,
    dataCostsNote,
    featureMatrix,
    featureMatrixDisclaimer,
    pageTitle: pricingPage.title,
    pageDescription: pricingPage.description,
    canonical: `${site.url}${pricingPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Pricing", path: pricingPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/**
 * "/crm" - the CRM + Data showcase. The Data dashboard is live; the CRM sections
 * carry a "coming soon" button (wired in crm.ejs) while the CRM is being built.
 */
export function renderCrm(_req: Request, res: Response): void {
  res.render("crm", {
    site,
    navLinks,
    footerLinks,
    page: crmPage,
    crmIntro,
    crmPerformance,
    crmIntegration,
    crmDataDashboard,
    crmCta,
    crmComingSoon,
    pageTitle: crmPage.title,
    pageDescription: crmPage.description,
    canonical: `${site.url}${crmPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "CRM + Data", path: crmPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/join-us" - placeholder page (content TBD). Noindex until it's built out. */
export function renderJoinUs(_req: Request, res: Response): void {
  res.render("join-us", {
    site,
    navLinks,
    footerLinks,
    page: joinUsPage,
    pageTitle: joinUsPage.title,
    pageDescription: joinUsPage.description,
    canonical: `${site.url}${joinUsPage.path}`,
    metaRobots: "noindex, follow",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Join Us", path: joinUsPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/affiliate" - the affiliate program page (three referral tiers). */
export function renderAffiliate(_req: Request, res: Response): void {
  res.render("affiliate", {
    site,
    navLinks,
    footerLinks,
    page: affiliatePage,
    affiliateTiers,
    pageTitle: affiliatePage.title,
    pageDescription: affiliatePage.description,
    canonical: `${site.url}${affiliatePage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Affiliates", path: affiliatePage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/blog" - blog index, backed by published posts from the database. */
export async function renderBlog(_req: Request, res: Response): Promise<void> {
  let blogPosts: BlogPost[];
  try {
    blogPosts = await listPublishedPosts();
  } catch (err) {
    console.error("[blog] failed to load posts:", err);
    blogPosts = [];
  }
  res.render("blog", {
    site,
    navLinks,
    footerLinks,
    page: blogPage,
    blogPosts,
    pageTitle: blogPage.title,
    pageDescription: blogPage.description,
    canonical: `${site.url}${blogPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: blogPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/**
 * "/blog/:slug" - individual published post. Unknown slugs fall through to the
 * 404 handler via next(). Posts with a real body are indexable; the body-less
 * fallback (no database configured) stays noindex.
 */
export async function renderBlogPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let post: BlogPostRecord | null;
  try {
    post = await getPublishedPostBySlug(req.params.slug);
  } catch (err) {
    console.error("[blog] failed to load post:", err);
    return next();
  }
  if (!post) return next();
  const path = `${blogPage.path}/${post.slug}`;
  res.render("blog-post", {
    site,
    navLinks,
    footerLinks,
    post,
    // Body-less placeholders stay out of the index; real articles are indexable.
    metaRobots: post.bodyHtml ? undefined : "noindex, follow",
    pageTitle: `${post.title} | Land Caller`,
    pageDescription: post.excerpt,
    canonical: `${site.url}${path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: blogPage.path },
      { name: post.title, path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}
