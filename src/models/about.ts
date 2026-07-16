import type { TeamMember } from "./types.js";

/** About page content, sourced from the legacy site (landcaller.com/about-us). */
export const about = {
  eyebrow: "About Us",
  heading: "About Land Caller",
  lede: "The first-ever cold calling company built for land investors.",
  storyHeading: "Who We Are",
  // Founder story, sourced from the legacy/reference About page. Trusted markup
  // (rendered with <%- %>) so the motto can be emphasized.
  story: [
    "Our story goes back to when our founder, Joe Roberts, a US Marine Corps veteran and land flipper, started searching for a new lead generation method for his growing land flipping business.",
    "His primary lead generation method for years was direct mail, but after seeing market saturation with his campaigns and searching for a way to increase his lead flow, Joe hit upon cold calling - a rarely used method in an industry dominated by mailers. He leveraged the interpersonal soft skills he developed as a trainer and instructor in the US Marine Corps to generate cold-call leads, and saw immediate results in his land business.",
    "Convinced of the untapped potential, Land Caller was launched as the first-ever cold calling company for land investors. Although copycats have sprung up over the years, Land Caller has remained the biggest and best lead generation company for land investors. Our unique industry insights, absolute dedication to quality control, and outstanding customer service continue to set us apart from the competition.",
    'Our motto in business, as it is in life, is <strong class="text-white">"Ad Majorem Dei Gloriam"</strong> - Latin for "To God Be the Glory." Our faith underlies everything we do, including building a business that provides excellent service and outstanding results for our clients, and fair pay and great opportunities for our people.',
  ],
  ctaHeading: "Start Growing Your Land Investing Business Today",
  // Bottom-of-page teaser for the in-development CRM + Data platform.
  comingSoon: {
    heading: "The Land Caller CRM is coming soon.",
    body: "We're evolving beyond the agency model into the Land Caller Ecosystem - bringing lead generation, data, and deal management together in one command center. The CRM is the next piece, and it's launching soon.",
    cta: { label: "Preview CRM + Data", href: "/crm" },
  },
};

export const team: TeamMember[] = [
  {
    name: "Joe Roberts",
    role: "CEO & Co-Founder",
    initials: "JR",
    image: "/assets/images/team/joe-roberts.jpg",
    bio: "Hi there! I'm Joe Roberts. I'm a husband, father, an entrepreneur, a USMC combat veteran and former attack helicopter pilot. I started building my real estate business while on active duty and despite multiple deployments around the world, I built a real estate rental portfolio that eventually allowed me to exit the Marine Corps and pursue my entrepreneurial goals full-time. My wife Colby and I have 6 kids and we live on a small farm in North Carolina. When not talking about real estate I love hiking, hunting, coaching sports, attending Mass, cheering for the Colorado Avalanche and watching The Office.",
  },
  {
    name: "John Lowrey",
    role: "COO & Co-Founder",
    initials: "JL",
    image: "/assets/images/team/john-lowrey.jpg",
    bio: "Hey! I'm John Lowrey. I attended Ave Maria University in Southwest Florida with a scholarship to run cross country where I earned my bachelor's degree in accounting. Since then, I have diversified my skillsets into a number of fields including real estate accounting, home renovation, customer relations and sales.",
  },
  {
    name: "Keniqua Vasquez",
    role: "General Manager",
    initials: "KV",
    image: "/assets/images/team/keniqua-vasquez.png",
    bio: "Greetings from the heart of our operations! I'm Keniqua, Land Caller's General Manager. With 7 years of experience in the world of cold calling, I've honed my skills over the past 5 years in a diverse set of management roles including operations, quality assurance and training. My mission? Transforming every conversation from a call into a valuable connection. I'm passionate about perfecting customer interactions, and when I'm not analyzing calls, I'm immersed in novels, writing, or exploring the great outdoors. To me, a successful call combines professionalism, warmth, and a dash of adventure.",
  },
];
