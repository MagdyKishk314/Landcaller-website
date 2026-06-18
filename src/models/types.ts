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
  | "menu";

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
