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
  keywords:
    "land investor cold calling, land seller leads, cold calling service, land lead generation, vacant land leads, off-market land deals, real estate cold calling, skip tracing, land acquisition, land investing, motivated seller leads, done-for-you cold calling",
  author: "Land Caller",
  publisher: "Land Caller",
  canonical: `${BASE_URL}/`,
  faviconUrl: "/assets/images/lc-logo-transparent.png",
  logo: "/assets/images/lc-logo-transparent.png",
  ogImage: `${BASE_URL}/assets/images/og-image.png`,
  twitterHandle: "@Land_Caller",
  externalLinks: {
    bookACall: "https://calendly.com/landcaller",
    crmLogin: "https://client-portal.landcaller.com",
    facebook: "https://www.facebook.com/landcaller",
    twitter: "https://twitter.com/Land_Caller",
    affiliateSignup:
      "https://landcaller.zohothrive.com/thrive/publicpages/affiliate-registration/landcaller/49c5985f1dc09761f5484e9331f929b6de9e51db8989f4d62bead81b772118e1",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "#" },
  { label: "About", href: "/about" },
  { label: "Data + CRM", href: "/crm" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Affiliates", href: "/affiliate" },
  { label: "Join Us", href: "/join-us" },
];

export const footerLinks: NavLink[] = [
  { label: "Data + CRM", href: "/crm" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Affiliates", href: "/affiliate" },
  { label: "FAQs", href: "#faq" },
];
