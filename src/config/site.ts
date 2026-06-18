import type { SiteConfig, NavLink } from "../models/types.js";

export const site: SiteConfig = {
  title: "Land Caller - Enterprise Cold Calling for Land Investors",
  description:
    "The only enterprise-grade cold calling system purpose-built for land acquisitions. One platform. Unlimited dials. Consistent deal flow.",
  canonical: "https://landcaller.manus.space/",
  faviconUrl: "/assets/images/lc-logo-transparent.png",
  logo: "/assets/images/lc-logo-transparent.png",
  ogImage:
    "https://files.manuscdn.com/webdev_screenshots/2026/06/16/JKd8ZeJfxyUWwLszUtNFM8.png?x-oss-process=image/resize,w_1200/crop,h_630,x_0,y_0",
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
  { label: "Pricing", href: "#packages" },
  { label: "Resources", href: "#faq" },
  { label: "CRM + Data", href: "#features" },
  { label: "Contact", href: "#contact" },
];

export const footerLinks: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "FAQ's", href: "#faq" },
  { label: "CRM + Data", href: "#features" },
  { label: "Become An Affiliate", href: "#affiliate" },
];
