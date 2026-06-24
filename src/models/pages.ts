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

// Affiliate program page. Copy adapted from the legacy marketing site; the three
// program tiers are rendered from `affiliateTiers` (models/content.ts).
export const affiliatePage = {
  title: "Become An Affiliate | Land Caller",
  description:
    "Join Land Caller's Partner Program. Three affiliate tiers for individuals, coaches, and organizations - easy referral links, a real-time dashboard, and competitive payouts.",
  path: "/affiliate",
  eyebrow: "Partner Program",
  h1: "Become An Affiliate",
  lede:
    "Welcome to Land Caller's Partner Program! We offer three affiliate tiers designed to suit your unique needs and maximize your earnings potential.",
  sub: "Whether you're an individual looking to earn extra income or a company aiming to expand your business, we have an affiliate tier for you.",
  tiersHeading: "Three tiers. Your choice.",
  stepsHeading: "How to get started",
  steps: [
    "Select the affiliate tier that best suits your needs.",
    "Sign up through our secure online application.",
    "Start referring customers and earning payouts.",
  ],
  stepsNote: "All affiliates get access to a personalized affiliate dashboard.",
  eligibility:
    "To qualify for affiliate commissions, the referral must enroll in one of our Enterprise Packages. Basic plans do not qualify for payouts.",
  ctaHeading: "Partner with Land Caller today!",
  ctaBody:
    "Start growing your land investing business today with Land Caller's lead generation services. It'll be the best business decision you've ever made.",
  ctaLabel: "Sign Up Now",
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
