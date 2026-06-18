import type { Request, Response, NextFunction } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { servicePage, comparisonPage, pricingPage, blogPage } from "../models/pages.js";
import { featureMatrix, featureMatrixDisclaimer } from "../models/content.js";
import { enterprisePlan, basicPlan, dataCostsNote } from "../models/pricing.js";
import { blogPosts } from "../models/blog.js";

/**
 * "/land-investor-cold-calling" - high-intent service landing page.
 * Note: testimonials/faqs are intentionally NOT passed here so the schema
 * partial only emits Review/FAQPage markup on pages where that content is
 * visibly rendered (the home page), per Google's structured-data guidelines.
 */
export function renderService(_req: Request, res: Response): void {
  res.render("service", {
    site,
    navLinks,
    footerLinks,
    page: servicePage,
    pageTitle: servicePage.title,
    pageDescription: servicePage.description,
    canonical: `${site.url}${servicePage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Land Investor Cold Calling", path: servicePage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

/** "/cold-calling-vs-direct-mail" - comparison landing page. */
export function renderComparison(_req: Request, res: Response): void {
  res.render("comparison-page", {
    site,
    navLinks,
    footerLinks,
    page: comparisonPage,
    pageTitle: comparisonPage.title,
    pageDescription: comparisonPage.description,
    canonical: `${site.url}${comparisonPage.path}`,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cold Calling vs Direct Mail", path: comparisonPage.path },
    ],
    isHome: false,
    year: new Date().getFullYear(),
  });
}

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

/** "/blog" - blog index (placeholder posts until real content lands). */
export function renderBlog(_req: Request, res: Response): void {
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
 * "/blog/:slug" - individual post. The article body is a placeholder until
 * real content lands; unknown slugs fall through to the 404 handler via next().
 */
export function renderBlogPost(req: Request, res: Response, next: NextFunction): void {
  const post = blogPosts.find((p) => p.slug === req.params.slug);
  if (!post) return next();
  const path = `${blogPage.path}/${post.slug}`;
  res.render("blog-post", {
    site,
    navLinks,
    footerLinks,
    post,
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
