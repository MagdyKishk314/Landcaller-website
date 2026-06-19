import type { SiteConfig, NavLink } from "../models/types.js";

/**
 * Production base URL. Overridable per-environment via SITE_URL so canonical
 * and Open Graph tags always point at the live domain (never a preview host).
 */
const BASE_URL = (process.env.SITE_URL ?? "https://landcaller.com").replace(/\/+$/, "");

export const site: SiteConfig = {
  name: "Land Caller",
  url: BASE_URL,
  // Primary keyword up front; brand second. Targets the hire-intent buyer.
  title: "Land Lead Generation & Cold Calling for Land Investors | Land Caller",
  description:
    "Done-for-you cold calling built exclusively for vacant land investors. We deliver warm, off-market land seller leads straight to your CRM. Book a call.",
  canonical: `${BASE_URL}/`,
  faviconUrl: "/assets/images/lc-logo-transparent.png",
  logo: "/assets/images/lc-logo-transparent.png",
  ogImage: `${BASE_URL}/assets/images/og-image.png`,
  twitterHandle: "@Land_Caller",
  externalLinks: {
    bookACall: "https://calendly.com/landcaller",
    crmLogin: "https://my.landcaller.com/",
    facebook: "https://www.facebook.com/landcaller",
    twitter: "https://twitter.com/Land_Caller",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "#" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Join Us", href: "/join-us" },
];

export const footerLinks: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "#faq" },
];
