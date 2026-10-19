/**
 * Content models for the funnel spoke pages (Pricing, Affiliate, CRM).
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
    "Whether you're chasing your first deal or actively scaling your land business, there's a Land Caller package designed to help you build an acquisition engine that grows with your land business.",
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

// The /crm route is temporarily served as a "coming soon" page. The full CRM +
// Data page is preserved (views/crm.ejs + models/crm.ts) and can be switched
// back on in pagesController (see renderCrm).
export const crmComingSoonPage = {
  title: "Land Caller CRM + Data - Coming Soon",
  description:
    "The Land Caller CRM + Data platform is coming soon. Book a call to learn more, or check back shortly.",
  path: "/crm",
  eyebrow: "Coming Soon",
  h1: "Land Caller CRM + Data.",
  lede: "We're putting the finishing touches on our unified CRM + Data platform. It's coming soon - book a call to get the details, or check back shortly.",
};
