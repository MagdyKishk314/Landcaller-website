/**
 * Content models for the funnel spoke pages (Pricing + Blog).
 * Copy targets commercial "hire a land cold calling service" search
 * intent, national US.
 */

export const pricingPage = {
  title:
    "Land Caller Pricing | Cold Calling for Land Investors",
  description:
    "Compare Land Caller's land cold calling packages - Enterprise dedicated callers or guaranteed-lead Basic plans, with full CRM integration and unlimited dials.",
  path: "/pricing",
  eyebrow: "Pricing & Packages",
  h1: "Land Caller Service Pricing",
  lede:
    "Transparent, flat-fee packages for land cold calling. Go all-in with a dedicated full-time caller on Enterprise, or start lean with a guaranteed-lead Basic package. Every plan includes land-trained callers, litigator-scrubbed data, and done-for-you operations.",
};

// Placeholder spoke. The page exists (so the "Join Us" nav link resolves instead
// of 404ing) but the real content is still to come - keep it noindex until built.
export const joinUsPage = {
  title: "Join Us | Land Caller",
  description:
    "Careers and partnership opportunities at Land Caller - cold calling lead generation built for vacant land investors. More details coming soon.",
  path: "/join-us",
  eyebrow: "Join Us",
  h1: "Join the Land Caller team.",
  lede: "We're putting this page together. Check back soon for open roles and ways to work with us.",
};

export const blogPage = {
  title: "The Land Caller Blog | Cold Calling & Land Acquisition Insights",
  description:
    "Strategies, breakdowns, and playbooks on cold calling, lead generation, and scaling land acquisitions - from the team that dials off-market owners every day.",
  path: "/blog",
  eyebrow: "The Land Caller Blog",
  h1: "Insights on Cold Calling & Land Acquisition",
  lede:
    "Playbooks and breakdowns from the team that calls land owners every day - so you can generate more off-market deals.",
};
