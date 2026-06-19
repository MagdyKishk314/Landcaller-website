import type { Request, Response, NextFunction } from "express";
import { site, navLinks, footerLinks } from "../config/site.js";
import { pricingPage, blogPage } from "../models/pages.js";
import { featureMatrix, featureMatrixDisclaimer } from "../models/content.js";
import { enterprisePlan, basicPlan, dataCostsNote } from "../models/pricing.js";
import { blogPosts } from "../models/blog.js";

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
    // Posts are placeholder content for now - keep them out of the index until
    // real articles ship (see also the sitemap, which omits post URLs).
    metaRobots: "noindex, follow",
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
