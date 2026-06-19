import type {
  InfoCard,
  DifferentiatorItem,
  Testimonial,
  ComparisonRow,
  PricingPackage,
  FeatureMatrixRow,
  FaqItem,
  AffiliateTier,
  ContactField,
  PainPoint,
  ProcessStep,
  ResultStat,
  CallSample,
} from "./types.js";

export const hero = {
  eyebrow: "Cold Calling Lead Generation for Land Investors",
  headingLines: ["Warm Land Seller Leads.", "Cold Calling, Done For You."],
  subtext:
    "Land Caller is the only done-for-you cold calling service built exclusively for vacant land investors. We dial off-market owners and deliver warm, qualified seller leads straight to your CRM - so you close more land deals.",
  note:
    "One dedicated caller. Unlimited dials. Consistent off-market deal flow - without building your own call center.",
  image: "/assets/images/crm-dashboard.jpg",
  // Small trust signals rendered beneath the hero CTAs.
  trustBadges: [
    "5.0 rating from land investors",
    "Hundreds of campaigns run",
    "US-based, TCPA compliant",
  ],
  primaryCta: { label: "Book A Call", href: "#book" },
  // Scrolls down to the live call recordings - the "hear it for yourself" moment.
  secondaryCta: { label: "Hear a real lead", href: "#call-samples" },
};

export const problem = {
  eyebrow: "The Hard Truth",
  heading: "Most land lead channels are breaking.",
  intro:
    "You already know off-market deals are won on the phone. But getting consistent seller conversations is brutal - and the old playbook costs more every month for less.",
  painPoints: [
    {
      icon: "phone",
      title: "Building your own call team is a grind",
      body: "Hiring, training, dialer software, scripts, QA, and TCPA compliance - it's a full-time job before you ever talk to a seller.",
    },
    {
      icon: "trending-up",
      title: "Direct mail keeps getting more expensive",
      body: "Rising postage and mailbox saturation are crushing response rates. You pay more per deal while owners ignore another yellow letter.",
    },
    {
      icon: "clock",
      title: "Inconsistent leads kill your pipeline",
      body: "Feast-or-famine deal flow makes it impossible to forecast, hire, or scale. One slow month and everything stalls.",
    },
  ] as PainPoint[],
};

export const howItWorks = {
  eyebrow: "The Plan",
  heading: "Warm leads in your CRM, in four steps",
  subtext: "No call center to build. No guesswork. Here's exactly what happens after you book.",
  steps: [
    {
      number: "01",
      title: "We build your target list",
      body: "Share your buy box and counties. We pull records, skip trace the top phone numbers, and scrub every one for litigators and DNC compliance.",
    },
    {
      number: "02",
      title: "Your dedicated caller dials",
      body: "A full-time, land-trained caller works your campaign 1:1 - never shared across 20 clients - with unlimited dials and no call caps.",
    },
    {
      number: "03",
      title: "Warm seller leads hit your CRM",
      body: "Qualified, off-market leads are delivered the same day with call dispositions and daily KPI reporting, so you always know your numbers.",
    },
    {
      number: "04",
      title: "We optimize, you close",
      body: "We split-test scripts and markets to drive your cost per lead down while you focus on negotiating and closing deals.",
    },
  ] as ProcessStep[],
};

export const resultsStats: ResultStat[] = [
  { value: "55+", label: "Leads per agent / month (Enterprise avg.)" },
  { value: "3x", label: "Higher contact rate vs single-number dialers" },
  { value: "1:1", label: "Dedicated caller per campaign" },
  { value: "60-70%", label: "Cheaper than comparable direct mail" },
];

export const callSamples: CallSample[] = [
  {
    title: "Motivated seller, ready to talk price",
    market: "Texas - 40 acres",
    motivation: "Inherited land, doesn't want the tax burden",
    outcome: "Qualified & booked for a follow-up offer",
    durationLabel: "2:14",
    src: "/assets/audio/sample-warm-lead-1.mp3",
  },
  {
    title: "Owner open to a cash offer",
    market: "Arizona - 10 acres",
    motivation: "Bought years ago, never used it",
    outcome: "Warm lead delivered same day",
    durationLabel: "1:48",
    src: "/assets/audio/sample-warm-lead-2.mp3",
  },
];

/** Condensed "the guide" teaser shown on the home funnel; links to /about. */
export const guide = {
  eyebrow: "Who We Are",
  heading: "Built by land investors, for land investors.",
  body: [
    "Land Caller was founded by a land investor who got tired of saturated direct mail and built a cold calling operation that actually worked - then turned it into a done-for-you service for investors like you.",
    "Because we invest in land ourselves, our callers speak your prospects' language, build rapport fast, and qualify the leads that actually become deals.",
  ],
  highlights: [
    { icon: "shield-check" as const, label: "Veteran-founded, US-based team" },
    { icon: "target" as const, label: "The first cold call team built only for land" },
  ],
  cta: { label: "Read our story", href: "/about" },
};

export const whoWeAre: InfoCard[] = [
  {
    icon: "target",
    title: "Our Mission",
    body: "Deliver a relentless flow of off-market seller leads through expert cold-calling operations - so you close more deals, faster.",
  },
  {
    icon: "eye",
    title: "Our Vision",
    body: "Become the undisputed #1 cold-calling partner for every land investor in North America. No exceptions.",
  },
  {
    icon: "phone",
    title: "Ready to Scale?",
    body: "Join hundreds of investors already crushing it with Land Caller.",
    highlighted: true,
    cta: { label: "Book Now", href: "https://calendly.com/landcaller" },
  },
];

export const whatSetsApart = {
  heading: "What Sets Land Caller Apart?",
  ecosystemTitle: "The Land Caller Ecosystem",
  ecosystemBody:
    'We killed the "agency" model. Land Caller now delivers a fully unified acquisition platform - data, dialing, and deal management in one command center. Custom campaigns. Zero guesswork. Maximum deal flow.',
  items: [
    {
      number: "01",
      title: "The First & Only",
      body: "We pioneered cold-calling lead gen exclusively for vacant land investors. Nobody else has our depth of niche expertise.",
    },
    {
      number: "02",
      title: "Obsessively Data-Driven",
      body: "Daily KPI reporting. Relentless split-testing. Every campaign is optimized until it prints leads.",
    },
    {
      number: "03",
      title: "Scale Without Limits",
      body: "From 1 caller to 20 - we grow with you. No caps on dials, no caps on ambition.",
    },
    {
      number: "04",
      title: "Battle-Tested Callers",
      body: "Zero rookies. Every caller has real estate cold-calling experience and understands exactly what land investors need to hear.",
    },
    {
      number: "05",
      title: "Land-Niche Dominance",
      body: "We don't just dial - we dominate. Our specialists speak your prospects' language, build instant rapport, and deliver vetted, high-quality opportunities.",
    },
    {
      number: "06",
      title: "Unlimited Firepower",
      body: "No call limits. No dial caps. We run campaigns, not call quotas. Better KPIs, deeper customization, more leads. Period.",
    },
  ] as DifferentiatorItem[],
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Land Caller is an amazing service and an even better company. Unparalleled customer service and amazing results. Land Caller goes above and beyond in every way. I highly recommend Land Caller and I feel grateful to have found them!",
    name: "Cooper L.",
    company: "Ad Astra Land Co",
    rating: 5,
  },
  {
    quote:
      "We are pursuing land investing as a side hustle and don't have a ton of time to dedicate to lead gen. So glad that we incorporated Land Caller into our strategy! We picked the location and criteria for our land, and Land Caller delivered leads every week. We had three properties under contract within a month and a half. You can't go wrong with Land Caller.",
    name: "Dave L.",
    company: "Homeland Properties",
    rating: 5,
  },
  {
    quote:
      "Land Caller is a perfect turnkey solution for any land investor looking to add this marketing channel to their acquisitions strategy. Just send them your list and get ready for leads! Don't waste a ton of time and money trying to build your own cold calling system, just use Land Caller.",
    name: "Ray S.",
    company: "All Acres Land Company",
    rating: 5,
  },
  {
    quote:
      "The team at Land Caller completely set me up for success from the very first callback. They're true professionals who care about what they're doing, and they make my life easy.",
    name: "Rene C.",
    company: "Wandering Tree Capital",
    rating: 5,
  },
  {
    quote:
      "Land Caller has far exceeded our expectations and has become our number one source for lead generation.",
    name: "James S.",
    company: "TD Land Co",
    rating: 5,
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    feature: "Built by land investors?",
    landCaller: "100%. We invest in land ourselves.",
    everyoneElse: "No - generic call centers",
  },
  {
    feature: "Phone numbers dialed per lead?",
    landCaller: "Top 3 skip-traced hits (mobile, landline, spouse)",
    everyoneElse: "Only 1 number - missed opportunities everywhere",
  },
  {
    feature: "Caller-to-client ratio?",
    landCaller: "1:1 dedicated caller per campaign",
    everyoneElse: "5-20 clients stacked on one caller",
  },
  {
    feature: "Script customization?",
    landCaller: "Fully custom - built around YOUR strategy",
    everyoneElse: "Cookie-cutter or zero customization",
  },
  {
    feature: "Lead delivery?",
    landCaller: "Land Caller CRM or your CRM of choice",
    everyoneElse: "Emailed spreadsheets",
  },
  {
    feature: "Skip tracing quality?",
    landCaller: "Credit Bureau - top-tier accuracy",
    everyoneElse: "Cheapest available data",
  },
  {
    feature: "Litigator scrubbing?",
    landCaller: "Every number, every time",
    everyoneElse: "Nope - you're at risk",
  },
  {
    feature: "Dial limits?",
    landCaller: "None. Unlimited.",
    everyoneElse: "Capped and restricted",
  },
];

export const packages: PricingPackage[] = [
  {
    name: "Enterprise",
    icon: "crown",
    tagline: "For serious operators ready to dominate",
    mostPopular: true,
    blurbs: [
      'Built for <strong data-loc="enterprise" class="text-white">full-time land businesses</strong> with a VA or team in place.',
      'Avg. <strong data-loc="enterprise" class="text-[#E8523A]">55+ leads/agent/month</strong>. Advanced customization, dedicated support, zero compromises.',
    ],
    features: [
      {
        label: "Custom Script + Dedicated Caller",
        detail:
          "Your script. Your strategy. Your dedicated caller becomes an extension of your team, not a generic call center rep.",
      },
      {
        label: "Full CRM Integration",
        detail:
          "Custom Land Caller CRM with deal flow management, campaign KPIs, automation, and reporting. Or plug directly into your existing CRM.",
      },
      {
        label: "Call Disposition Reports",
        detail:
          "See every owner not reached by phone. Instantly layer direct mail, SMS, or ringless voicemail for maximum coverage.",
      },
      {
        label: "Top 3 Numbers Dialed",
        detail:
          "We hit mobile, landline, and spouse numbers, tripling your contact rate versus single-number competitors.",
      },
      {
        label: "Done-For-You Operations",
        detail:
          "Compliance, caller management, QA. All handled. You get a managed system without the learning curve.",
      },
      {
        label: "Private Slack Channel",
        detail:
          "Direct line to your team. Real-time updates, fast answers, and full transparency on every campaign.",
      },
      {
        label: "Call Recordings + Trainer Access",
        detail:
          "Review real calls and tap into trainer expertise to keep your campaign sharp and converting.",
      },
    ],
    highlightTitle: "The Enterprise Advantage:",
    highlights: [
      { label: "Higher contact rates" },
      { label: "Better conversion quality" },
      { label: "Every dollar maximized" },
      { label: "Zero dialing management" },
    ],
  },
  {
    name: "Basic",
    icon: "zap",
    tagline: "Start generating leads without overcommitting",
    blurbs: [
      'Perfect for <strong data-loc="basic" class="text-white">solo investors or newer operators</strong> testing cold calling.',
      "Consistent seller conversations without the cost or complexity of building it yourself.",
    ],
    features: [
      {
        label: "Guaranteed Lead Counts",
        detail:
          "Every Basic tier includes guaranteed lead delivery. If initial criteria falls short, we add complimentary data to fulfill your order.",
      },
      {
        label: "Zero Contracts",
        detail: "Flat-fee. No lock-ins. No long-term agreements. Cancel anytime.",
      },
      {
        label: "Built for Every Level",
        detail:
          "Smaller, affordable options for investors with limited time or capital. Test cold calling without overextending.",
      },
      {
        label: "Done-For-You Operations",
        detail:
          "Compliance, caller management, QA. All handled. You get a managed system without the learning curve.",
      },
    ],
    highlightTitle: "Why Investors Love Basic:",
    highlights: [
      { label: "Reliable warm seller leads" },
      { label: "In your target markets" },
      { label: "Lower cost per lead" },
      { label: "Zero commitments" },
    ],
    ctas: [
      { label: "CRM + Data", href: "#features", primary: true },
      { label: "View Pricing", href: "#features", primary: false },
    ],
  },
];

export const packagesDisclaimer =
  "*Auto-renewal unless cancelled in writing. **7-day notice required before contract end. ***Pre-cancellation payments non-refundable; services continue until end of paid period.";

export const featureMatrix: FeatureMatrixRow[] = [
  { feature: "Dedicated Caller", enterprise: true, basic: false },
  { feature: "Calling the First 3 Skip Traced Phone #'s", enterprise: true, basic: false },
  { feature: "Full Script Customization", enterprise: true, basic: false },
  { feature: "Personalized Slack Channel for Support", enterprise: true, basic: false },
  { feature: "Bring Your Own Records", enterprise: true, basic: true },
  { feature: "Customized Caller Training", enterprise: true, basic: false },
  { feature: "Personal CRM Integration", enterprise: true, basic: false },
  { feature: "Call Disposition Reports", enterprise: true, basic: false },
  { feature: "Call Recording Requests", enterprise: true, basic: false },
  { feature: "Land Caller CRM Access", enterprise: true, basic: true },
  { feature: "Land Caller Data Dashboard", enterprise: true, basic: true },
  { feature: "Callers Trained on Vacant Land", enterprise: true, basic: true },
  { feature: "Litigator Scrubbing Protection", enterprise: true, basic: true },
  { feature: "On-Site Callers", enterprise: true, basic: true },
  { feature: "Script Built by Land Professionals", enterprise: true, basic: true },
  { feature: "No-Scam Phone #'s", enterprise: true, basic: true },
  { feature: "State and Federal Legal Compliance", enterprise: true, basic: true },
  { feature: "Quality Assurance Teams", enterprise: true, basic: true },
];

export const featureMatrixDisclaimer =
  "*Automatic Renewal: Contracts will automatically renew unless we receive written notice of cancellation. **Notice Period: To avoid renewal, please notify us at least 7 days before your contract ends. ***Refunds: Payments made prior to cancellation are non-refundable, but services will continue until the end of the paid period.";

export const faqs: FaqItem[] = [
  {
    question: "Who is Land Caller built for?",
    answer:
      "Land investors who want a reliable, consistent pipeline of off-market seller leads through cold calling. Whether you're a solo operator just getting started or a scaled business looking to add fuel, we have packages for every level.",
  },
  {
    question: "Do I still need direct mail or SMS?",
    answer:
      "Cold calling doesn't replace your other channels - it supercharges them. Our Call Disposition Reports show you exactly which owners weren't reached by phone, so you can strategically layer direct mail, SMS, or ringless voicemail for maximum coverage.",
  },
  {
    question: "How does cold calling compare to direct mail on cost?",
    answer:
      "Cold calling is typically more cost-effective per lead. With direct mail, you're paying for printing, postage, and list costs with low response rates. With cold calling, you're paying for direct conversations with motivated sellers - higher conversion, lower cost per acquisition.",
  },
  {
    question: "How many leads can one caller generate per month?",
    answer:
      "Enterprise clients average 55 leads per agent monthly. The exact number depends on answer rates, conversation length, and campaign complexity - but our system is built to maximize every dial.",
  },
  {
    question: "How do you get more owners to pick up?",
    answer:
      "We dial the top 3 skip-traced phone numbers per record (mobile, landline, spouse), use litigator-scrubbed caller IDs, and employ strategic calling windows. This multi-number approach crushes single-number competitors on contact rates.",
  },
];

export const affiliateTiers: AffiliateTier[] = [
  {
    tier: "Tier 1",
    icon: "users",
    name: "Base Affiliates",
    tagline: "Earn extra income with zero effort",
    perks: [
      "Simple referral links",
      "Real-time affiliate dashboard",
      "Competitive payouts per signup",
    ],
  },
  {
    tier: "Tier 2",
    icon: "award",
    name: "Coaching Affiliates",
    tagline: "Built for coaches & mentors in the land space",
    perks: [
      "Priority referral links",
      "Real-time affiliate dashboard",
      "Higher payouts per signup",
    ],
  },
  {
    tier: "Tier 3",
    icon: "star",
    name: "VIP Affiliates",
    tagline: "For influencers & organizations with reach",
    featured: true,
    perks: [
      "Premium referral links",
      "Real-time affiliate dashboard",
      "Highest payouts in the program",
      "Custom partnership opportunities",
      "Dedicated affiliate account manager",
    ],
  },
];

export const contactFields: ContactField[] = [
  { name: "name", label: "Name", placeholder: "Your name", type: "text", required: true, half: true },
  { name: "email", label: "Email", placeholder: "you@company.com", type: "email", required: true, half: true },
  { name: "phone", label: "Phone", placeholder: "(555) 000-0000", type: "tel", required: false, half: true },
  { name: "address", label: "Address", placeholder: "City, State", type: "text", required: false, half: true },
];
