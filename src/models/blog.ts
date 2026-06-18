import type { BlogPost } from "./types.js";

/**
 * Blog content. Placeholder posts until real articles (or a CMS) land - the
 * teaser on the home page and the /blog index both read from this list.
 * Images reuse existing assets as stand-ins; swap per-post when art is ready.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "cold-calling-vs-direct-mail-for-land",
    title: "Cold Calling vs Direct Mail: The Real Cost Per Land Deal",
    excerpt:
      "Postage is up, response rates are down. We break down the true cost per acquisition for both channels - and why more land investors are leading with the phone.",
    date: "2026-05-28",
    readingTime: "6 min read",
    category: "Lead Generation",
    image: "/assets/images/laptop-mockup-square.webp",
  },
  {
    slug: "what-makes-a-warm-land-seller-lead",
    title: "What Actually Makes a Land Seller Lead 'Warm'",
    excerpt:
      "Not every callback is a lead. Here's the qualification framework our callers use to separate motivated sellers from tire-kickers before it hits your CRM.",
    date: "2026-05-12",
    readingTime: "5 min read",
    category: "Acquisitions",
    image: "/assets/images/og-image.png",
  },
  {
    slug: "scaling-land-acquisitions-with-cold-calling",
    title: "How to Scale Land Acquisitions Without Building a Call Center",
    excerpt:
      "Hiring, training, dialers, compliance - the hidden cost of an in-house team. A look at how a done-for-you model lets you scale dials without scaling headaches.",
    date: "2026-04-30",
    readingTime: "7 min read",
    category: "Scaling",
    image: "/assets/images/laptop-mockup-square.webp",
  },
];
