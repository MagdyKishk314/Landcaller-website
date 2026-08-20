import type { PricingPlan } from "./types.js";

/**
 * Detailed pricing, sourced from the reference pricing page. Rendered on
 * /pricing (full plans + tiers) and condensed on the home pricing teaser.
 */

export const enterprisePlan: PricingPlan = {
  name: "Enterprise",
  tagline: "For Full-Time Land Professionals",
  whoFor:
    "Enterprise Packages are designed for established land businesses that need consistent seller conversations, customized campaigns, and advanced campaign insights to support multi-channel marketing.",
  note: "Lead fulfillment varies with market saturation, property type, and the quality of your data and skip tracing. Our focus is maximizing performance within those variables - most campaigns generate approximately 45-65 leads per month.",
  features: [
    {
      label: "Custom Script + Dedicated Caller",
      detail:
        "Choose from our script options or bring your own, tailored to your exact strategy. Your dedicated caller becomes an extension of your team - not a generic call center rep. *Land Caller may rotate callers, add support callers, or use additional dialing strategies to optimize performance.",
    },
    {
      label: "Advanced CRM Integration",
      detail:
        "A fully custom Land Caller CRM with deal-flow management, script modifications, campaign KPIs & reporting, automation, and more - or integrate directly into your existing CRM.",
    },
    {
      label: "Call Disposition Report (Multi-Channel Layering)",
      detail:
        "Instantly see every owner who wasn't reached by phone, so you can stack direct mail, SMS, and more.",
    },
    {
      label: "Top 3 Skip-Traced Numbers Dialed",
      detail:
        "Instead of one phone number, we target the top three skip-traced numbers per record - mobile, landline, spouse, and more - to boost your contact rate.",
    },
    {
      label: "Done-For-You Compliance & Call Operations",
      detail:
        "From caller management to compliance oversight and quality control, we handle the heavy lifting. A fully managed system without the risk, stress, or learning curve.",
    },
    {
      label: "Private Team Access via Slack",
      detail:
        "A private Slack channel with direct access to our Operations, QA, and Support teams for real-time communication - best-in-class support.",
    },
    {
      label: "Call Recording Access + Trainer Feedback",
      detail:
        "Review recordings for up to 40 leads per month, and schedule a session with a caller trainer to fine-tune performance.",
    },
  ],
  tiers: [
    { name: "3 Months", term: "12 weeks of calling", price: "$2,850", per: "/ 4 weeks" },
    { name: "6 Months", term: "24 weeks of calling", price: "$2,595", per: "/ 4 weeks", featured: true },
    { name: "Annual", term: "48 weeks of calling", price: "$2,350", per: "/ 4 weeks" },
  ],
  includes: [
    "40hrs/week dial time with professional land cold caller(s)",
    "Dialer software + phone infrastructure",
    "Same-day lead delivery, appointment setting",
    "Land Caller CRM access (or your CRM integration)",
    "Data Dashboard access at volume waterfall discount rates",
    "Full script customization & Call Disposition Report",
    "Dedicated Slack channel for your team",
  ],
  footnotes: [
    "Volume discount: $100 off/month for every additional agent. Each additional Enterprise agent requires 10,000-12,000 records per 4-week campaign cycle.",
  ],
  includesNote: "5% discount on monthly prices if paid up-front.",
  startingAt: { price: "$2,350", per: "/ 4 weeks" },
  signupUrl:
    "https://forms.zohopublic.com/landcaller/form/LandCallerClientOnBoardingForm4/formperma/KfVuMUsYgMP7fTpgoF3P-l-r5kqe3N2DocoeelcQ8OU",
  // Condensed copy for the home pricing teaser card (does not affect /pricing).
  teaserTagline: "Designed for full-time land operators",
  teaserHighlights: [
    "Custom Script + 40hrs/week Dial Time",
    "Advanced CRM Integration + Appointment Setting",
    "Call Disposition Report (Multi-Channel Layering)",
    "Dedicated Slack Channel",
    "Top 3 Skip Traced Numbers Dialed",
  ],
};

export const basicPlan: PricingPlan = {
  name: "Basic",
  tagline: "Start Smart. Grow Fast.",
  featuredBadge: "Most Popular",
  whoFor:
    "Basic Packages are built for solo land investors, newer operators, or anyone who hasn't yet used cold calling as a primary lead source. The ideal starting point for consistent seller conversations - without overcommitting on cost, complexity, or monthly overhead.",
  features: [
    {
      label: "Guaranteed Lead Counts",
      detail:
        "Each Basic tier includes guaranteed lead delivery. If we can't fulfill your order with the initial market criteria, we'll add complimentary data so we can.",
    },
    {
      label: "Done-For-You Compliance & Call Operations",
      detail:
        "From caller management to compliance oversight and quality control, we handle the heavy lifting - no risk, stress, or learning curve.",
    },
    {
      label: "Built for Every Experience Level",
      detail:
        "Smaller, more affordable options for investors with limited time, capital, or deal-flow capacity. Test cold calling without overextending.",
    },
    {
      label: "No Contracts or Long-Term Commitments",
      detail:
        "Basic Packages are flat-fee and commitment-free. You're never locked into a long-term agreement.",
    },
  ],
  tiers: [
    {
      name: "Tier 1",
      term: "~2 Weeks Of Calling",
      price: "$1,100",
      highlights: [
        "5,000 records pulled, skipped, scrubbed & dialed",
        "Guaranteed 20 leads",
        { label: "Land Caller CRM (Basic Access)", badge: "Coming Soon" },
      ],
    },
    {
      name: "Tier 2",
      term: "~3 Weeks Of Calling",
      price: "$1,890",
      featured: true,
      highlights: [
        "8,000 records pulled, skipped, scrubbed & dialed",
        "Guaranteed 35 leads",
        { label: "Land Caller CRM (Basic Access)", badge: "Coming Soon" },
      ],
    },
    {
      name: "Tier 3",
      term: "~4 Weeks Of Calling",
      price: "$2,650",
      highlights: [
        "10,000 records pulled, skipped, scrubbed & dialed",
        "Guaranteed 50 leads",
        { label: "Land Caller CRM (Basic Access)", badge: "Coming Soon" },
      ],
    },
  ],
  fulfillmentNote:
    "Basic Package campaigns are fulfilled based on the guaranteed number of leads. Estimated completion times are estimates and may vary from campaign to campaign.",
  footnotes: [
    "Litigator Protection & DNC scrub included on every tier.",
    "Land Caller CRM full-access upgrades available for expanded automation and multichannel features.",
  ],
  startingAt: { price: "$1,100" },
  signupUrl:
    "https://forms.zohopublic.com/landcaller/form/LandCallerClientOnBoardingForm20/formperma/svpeKCbwVEOI8akLLXd9stYFS8xgg4uHEOXcQRBlU4A",
  // Condensed checkmarks for the home pricing teaser card (does not affect /pricing).
  teaserHighlights: [
    "Guaranteed Lead Counts",
    "Land Caller Data Credits Included",
    "Done-For-You Compliance & Call Operations",
    "Built for Every Experience Level",
    "No Contracts or Long-Term Commitments",
  ],
};

export const dataCostsNote =
  "Billed at volume waterfall discount rates through the Land Caller Data Dashboard. Client must provide enough geographic coverage.";
