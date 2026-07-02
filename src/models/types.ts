/**
 * Shared domain types for the Land Caller view models.
 * Icons are referenced by name and resolved to inline SVG markup in
 * `src/views/partials/_icons.ejs` so the View layer owns presentation.
 */

export type IconName =
  | "target"
  | "eye"
  | "phone"
  | "arrow-right"
  | "arrow-up-right"
  | "quote"
  | "star"
  | "check"
  | "x"
  | "minus"
  | "crown"
  | "zap"
  | "chevron-down"
  | "users"
  | "award"
  | "menu"
  | "play"
  | "pause"
  | "volume-2"
  | "book-open"
  | "calendar-check"
  | "clock"
  | "map-pin"
  | "shield-check"
  | "trending-up";

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  /** Brand / organization name (used in metadata and schema). */
  name: string;
  /** Absolute production base URL, no trailing slash (e.g. https://landcaller.com). */
  url: string;
  title: string;
  description: string;
  /** Comma-separated default meta keywords (per-page override via `metaKeywords`). */
  keywords: string;
  /** Default content author for the meta author tag. */
  author: string;
  /** Default content publisher for the meta publisher tag. */
  publisher: string;
  canonical: string;
  faviconUrl: string;
  logo: string;
  ogImage: string;
  /** Twitter/X handle including the leading @. */
  twitterHandle: string;
  externalLinks: {
    bookACall: string;
    crmLogin: string;
    facebook: string;
    twitter: string;
    affiliateSignup: string;
  };
}

export interface InfoCard {
  icon: IconName;
  title: string;
  body: string;
  highlighted?: boolean;
  cta?: { label: string; href: string };
}

export interface DifferentiatorItem {
  number: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  company: string;
  rating: number;
}

/** A testimonial as stored in / read back from the database (admin-managed). */
export interface TestimonialRecord extends Testimonial {
  id: number;
  published: boolean;
  sortOrder: number;
}

/** The write payload for creating/updating a testimonial from the admin form. */
export interface TestimonialInput {
  quote: string;
  name: string;
  company: string;
  rating: number;
  published: boolean;
  sortOrder: number;
}

export interface ComparisonRow {
  feature: string;
  landCaller: string;
  everyoneElse: string;
}

export interface PackageFeature {
  label: string;
  detail: string;
}

export interface PackageHighlight {
  label: string;
}

export interface PricingPackage {
  name: string;
  icon: IconName;
  tagline: string;
  /** Lead-in paragraphs may contain inline <strong> emphasis (trusted markup). */
  blurbs: string[];
  features: PackageFeature[];
  highlightTitle: string;
  highlights: PackageHighlight[];
  mostPopular?: boolean;
  /** Optional CTA buttons rendered under the card (Basic package only). */
  ctas?: { label: string; href: string; primary: boolean }[];
}

/** A single price tier within a pricing plan. */
export interface PriceTier {
  /** e.g. "3 Months" (Enterprise) or "Tier 1" (Basic). */
  name: string;
  /** e.g. "12 weeks of calling" / "~2 weeks of calling". */
  term: string;
  /** Display price, e.g. "$2,850". */
  price: string;
  /** Billing suffix for recurring plans, e.g. "/ 4 weeks". Omitted = flat fee. */
  per?: string;
  /** Per-tier bullets (Basic tiers: records, guaranteed leads, CRM access). */
  highlights?: string[];
  /** Visually emphasize this tier as the recommended option. */
  featured?: boolean;
}

/** A full pricing plan (Enterprise or Basic) rendered on /pricing. */
export interface PricingPlan {
  name: string;
  tagline: string;
  /** "Who is it for?" lead-in. */
  whoFor: string;
  /** Optional lead-fulfillment note shown under the intro. */
  note?: string;
  features: PackageFeature[];
  tiers: PriceTier[];
  /** "All [plan] packages include" bullets. */
  includes?: string[];
  /** Small print under the tiers (discounts, disclaimers). */
  footnotes?: string[];
  /** Lowest price, surfaced on the home pricing teaser. */
  startingAt?: { price: string; per?: string };
  /** Overrides {@link tagline} on the condensed home pricing teaser card only. */
  teaserTagline?: string;
  /** Overrides the home teaser's checkmark labels (defaults to the first 4 feature labels). */
  teaserHighlights?: string[];
  /** Optional highlighted line shown centered above the "All [plan] Packages Include" box. */
  includesNote?: string;
  /** Badge text on the featured tier (defaults to "Best Value"). */
  featuredBadge?: string;
}

export interface FeatureMatrixRow {
  feature: string;
  enterprise: boolean;
  /** true => included (check), false => not included (minus) */
  basic: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface AffiliateTier {
  tier: string;
  icon: IconName;
  name: string;
  tagline: string;
  perks: string[];
  featured?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  image: string;
  bio: string;
}

export interface ContactField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel";
  required: boolean;
  half: boolean;
}

/** A single pain point in the "problem / stakes" section. */
export interface PainPoint {
  icon: IconName;
  title: string;
  body: string;
}

/** A numbered step in the home "How It Works" plan timeline. */
export interface ProcessStep {
  number: string;
  title: string;
  points: string[];
}

/** A single hard-number stat in the results band. */
export interface ResultStat {
  value: string;
  label: string;
}

/**
 * A real call recording surfaced as social proof. `src` points at an audio
 * file under /public/assets/audio (placeholder until the real recording lands).
 */
export interface CallSample {
  title: string;
  market: string;
  motivation: string;
  outcome: string;
  durationLabel: string;
  src: string;
}

/** A blog post teaser / index entry. */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  image: string;
}

/**
 * A full blog post as stored in the database, including the article body.
 * `body` is the raw Markdown source (edited in the admin); `bodyHtml` is the
 * sanitized HTML rendered for the public post page.
 */
export interface BlogPostRecord extends BlogPost {
  id: number;
  body: string;
  bodyHtml: string;
  published: boolean;
}

/** Form payload accepted by the admin create/update endpoints. */
export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  published: boolean;
  /** Display date as YYYY-MM-DD, or null to leave unset. */
  publishedAt: string | null;
}
