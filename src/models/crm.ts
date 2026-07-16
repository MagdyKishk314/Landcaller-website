/**
 * Content model for the CRM + Data page (/crm). Copy is adapted from the legacy
 * marketing site; the design is rebuilt to match the Land Caller system. The
 * page showcases the Land Caller CRM (the acquisition command center) and the
 * self-service Data dashboard, with transparent wholesale data pricing.
 */
import type { IconName } from "./types.js";

export interface CrmFeature {
  icon: IconName;
  title: string;
  detail: string;
}

export interface NamedPoint {
  title: string;
  detail: string;
}

export const crmPage = {
  title: "Land Caller CRM + Data | Your Acquisition Command Center",
  description:
    "The Land Caller CRM unifies your data, dialing, and deal management in one command center - real-time KPIs, in-app scripts, AI automations, and transparent wholesale data pricing built for land investors.",
  path: "/crm",
  eyebrow: "Land Caller CRM + Data",
  h1: "Stop buying leads. Start building a pipeline.",
  // Same dashboard screenshot used in the home page hero.
  image: "/assets/images/crm-dashboard.jpg",
  lede:
    "Land Caller is retiring the “Agency” model and delivering the Land Caller Ecosystem - unifying your data, dialing, and deal management under one command center.",
};

export const crmIntro = {
  eyebrow: "Land Caller CRM",
  heading: "Your acquisition command center.",
  body:
    "A fully integrated platform combining world-class cold calling with self-service data and a pre-built CRM. We’re replacing the under-powered Land Caller Client Portal with an extremely powerful, pre-built, and fully customizable Land Caller CRM experience - designed specifically for land investors, with real gains in control, integration, and performance.",
  featuresIntro: "With the new Land Caller CRM, you’ll be able to:",
  features: [
    {
      icon: "trending-up",
      title: "Real-time KPIs",
      detail:
        "View campaign performance and KPIs in real time - no more emails flooding your inbox.",
    },
    {
      icon: "book-open",
      title: "Edit scripts in-app",
      detail:
        "Modify scripts directly inside your campaigns - no more back-and-forth in Slack or email.",
    },
    {
      icon: "users",
      title: "One source of truth",
      detail: "Store and manage all your leads and records in one place.",
    },
    {
      icon: "target",
      title: "Track every deal",
      detail: "Track deal flow from first call to close.",
    },
    {
      icon: "zap",
      title: "AI-powered automation",
      detail: "Build AI-powered automations, workflows, and follow-ups.",
    },
    {
      icon: "phone",
      title: "Multi-channel outreach",
      detail:
        "Launch SMS and direct mail alongside calling - fully integrated and managed from one system.",
    },
  ] as CrmFeature[],
  closing:
    "This CRM becomes the control center of your acquisition engine - delivering real-time visibility, faster execution, and hands-on control across every stage of your workflow.",
};

export const crmPerformance = {
  eyebrow: "Quality, Managed",
  heading: "Undeniable performance.",
  body:
    "We don’t just hire agents; we manage them. We police the calls, track the KPIs, and fire underperformers so you don’t have to.",
  points: [
    {
      title: "Quality Assurance Teams",
      detail:
        "Every call is monitored by our internal QA staff to ensure compliance and quality.",
    },
    { title: "Weekly Calibrations", detail: "We fix issues fast." },
    { title: "Zero Management", detail: "You get results, not headaches." },
    {
      title: "Verified Delivery",
      detail:
        "Leads go from the agent to our in-depth QA process to be double-qualified, then delivered directly to you.",
    },
    {
      title: "Land Caller CRM",
      detail:
        "All plans include access to our pre-built CRM to manage leads, dispositions, and follow-ups.",
    },
    {
      title: "Context Attached",
      detail: "Property data and lead notes included with every delivery.",
    },
  ] as NamedPoint[],
};

export const crmIntegration = {
  eyebrow: "Full Integration",
  heading: "Every lead, instantly in your CRM.",
  body:
    "We’ve retired the old download-only portal. Every lead now flows straight into your interactive Land Caller CRM - ready for immediate action or export.",
  flow: [
    {
      icon: "phone",
      title: "Live conversation",
      detail:
        "A land-trained caller works your market and books the motivated seller.",
    },
    {
      icon: "shield-check",
      title: "QA double-qualified",
      detail: "Our team verifies every lead before it ever reaches you.",
    },
    {
      icon: "zap",
      title: "Instantly in your CRM",
      detail:
        "Pushed straight into your Land Caller CRM - ready to action or export.",
    },
  ],
};

export const crmDataDashboard = {
  eyebrow: "Land Caller Data Dashboard",
  heading: "Stop buying blind.",
  body:
    "Our exclusive Smart Estimates engine predicts your final list size with 90-95% accuracy - transparency you simply can’t get anywhere else.",
  stat: { value: "90-95%", label: "Smart Estimate accuracy on final list size" },
  points: [
    {
      title: "Precision Budgeting",
      detail:
        "Eliminate the guesswork. Know your exact costs and scrubbed counts before you spend a dime.",
    },
    {
      title: "Zero Wasted Time",
      detail:
        "No more list-management headaches or back-and-forth on mismatched expectations.",
    },
    {
      title: "Rapid Verification",
      detail:
        "Lists are completed, verified by our team, and uploaded to the dialer immediately.",
    },
    {
      title: "Universal Access",
      detail:
        "Available to everyone. You don’t need a managed campaign to use our premium data.",
    },
  ] as NamedPoint[],
};

export const crmCta = {
  heading: "Start growing your land investing business today.",
  body: "See how Land Caller can dial-in your deal flow.",
};

/** Bottom-of-page announcement that the CRM platform is still being built. */
export const crmComingSoon = {
  heading: "The Land Caller CRM is coming soon.",
  body: "We're evolving beyond the agency model into the Land Caller Ecosystem - bringing lead generation, data, and deal management together in one command center. The CRM is the next piece, and it's launching soon.",
};
