/**
 * Content model for the Data Dashboard page (/data). Copy is adapted from the
 * legacy marketing site; the design is rebuilt to match the Land Caller system.
 * The page showcases the self-service Land Caller Data Dashboard (Smart
 * Estimates, transparent wholesale data pricing) and how verified leads reach
 * the client.
 */

export interface NamedPoint {
  title: string;
  detail: string;
}

export const dataPage = {
  title: "Land Caller Data Dashboard | Smart Estimates for Land Investors",
  description:
    "Pull, skip trace, and scrub land records from the Land Caller Data Dashboard. Smart Estimates predict your final list size with 90-95% accuracy, with transparent wholesale data pricing built for land investors.",
  path: "/data",
  eyebrow: "Data Dashboard",
  h1: "Stop buying blind.",
  // Same dashboard screenshot used in the home page hero.
  image: "/assets/images/crm-dashboard.png",
  lede:
    "Pull, skip trace, and scrub your records in one place - and know your exact list size and cost before you spend a dime.",
};

export const dataDashboard = {
  eyebrow: "Smart Estimates",
  heading: "Know your list before you buy it.",
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

export const dataDelivery = {
  eyebrow: "Lead Delivery",
  heading: "Every lead, delivered the same day.",
  body:
    "Every lead flows from the caller through our QA process and straight to you - with property data and call notes attached, ready to work or export.",
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
      title: "Delivered to you",
      detail:
        "Same-day delivery with dispositions and notes - into your existing CRM if you have one.",
    },
  ],
};

export const dataPerformance = {
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
      title: "Daily KPI Reporting",
      detail:
        "Call dispositions and campaign KPIs reported daily, so you always know where your campaign stands.",
    },
    {
      title: "Context Attached",
      detail: "Property data and lead notes included with every delivery.",
    },
  ] as NamedPoint[],
};

export const dataCta = {
  heading: "Start growing your land investing business today.",
  body: "See how Land Caller can dial-in your deal flow.",
};
