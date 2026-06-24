/**
 * Starter articles inserted when a brand-new database is created (and by the
 * `db:seed` script). Real, editable content so the blog isn't empty on launch.
 * Edit or delete these from the /admin dashboard once the site is live.
 */
export interface StarterPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  /** Display / publish date as YYYY-MM-DD. */
  date: string;
  /** Markdown body. */
  body: string;
}

export const starterPosts: StarterPost[] = [
  {
    slug: "cold-calling-vs-direct-mail-for-land",
    title: "Cold Calling vs Direct Mail: The Real Cost Per Land Deal",
    excerpt:
      "Postage is up, response rates are down. We break down the true cost per acquisition for both channels - and why more land investors are leading with the phone.",
    category: "Lead Generation",
    image: "/assets/images/laptop-mockup-square.webp",
    date: "2026-05-28",
    body: `Direct mail built the land business. For years, a yellow letter or a stack of postcards was all it took to fill a pipeline. But the math has shifted, and a lot of investors are quietly bleeding margin without realizing it.

## The hidden cost of a mail-first pipeline

When you price out direct mail, the postage is only the visible number. The real cost per deal stacks up across every layer of the funnel:

- **Postage and printing** keep climbing year over year.
- **Response rates** on cold lists have compressed as more investors mail the same counties.
- **Time-to-contact** is measured in weeks, not minutes - a motivated seller has already talked to three competitors by the time your letter lands.

Add it up and the cost *per signed contract* is often far higher than the cost *per piece* suggests.

## Where the phone wins

Cold calling flips the timeline. Instead of waiting for a seller to act, you start the conversation:

1. You reach owners who would never respond to mail.
2. You qualify motivation live, on the first touch.
3. You book the next step while the interest is hot.

The trade-off is that calling is operationally heavier - dialers, data, trained callers, and compliance. That's exactly the part most investors underestimate.

## The honest answer: it's not either/or

The best pipelines we see don't abandon mail - they **lead with the phone** and use mail to stay top-of-mind on the no-answers. Calling compresses the time to a warm conversation; mail keeps you in front of the slow-burn sellers.

> The question isn't "which channel is cheaper per touch?" It's "which channel gets a motivated owner on the phone first?"

If you want to see what a phone-led pipeline looks like for your specific markets, [book a call](/#book) and we'll walk you through the numbers.`,
  },
  {
    slug: "what-makes-a-warm-land-seller-lead",
    title: "What Actually Makes a Land Seller Lead 'Warm'",
    excerpt:
      "Not every callback is a lead. Here's the qualification framework our callers use to separate motivated sellers from tire-kickers before it hits your CRM.",
    category: "Acquisitions",
    image: "/assets/images/og-image.png",
    date: "2026-05-12",
    body: `"We got 40 leads this week" means nothing if 35 of them go nowhere. A lead is only worth the time it saves you, and that depends entirely on how it was qualified before it reached your desk.

## A callback is not a lead

Plenty of owners will pick up, chat, and even say "sure, make me an offer" - and never sell. If your definition of a lead is "someone who answered," you're going to spend your week chasing ghosts.

A genuinely **warm** land seller lead clears four bars:

1. **Ownership confirmed** - they actually own the parcel, free of surprises.
2. **Motivation** - there's a real reason to sell now (taxes, inheritance, moved away, done holding).
3. **Price openness** - they'll engage in a realistic conversation about value.
4. **Timeline** - they want to move in a window that matches how you operate.

## Why qualification belongs *before* the CRM

When unqualified leads pour into your pipeline, two things happen: your acquisition time gets eaten by dead ends, and your follow-up cadence gets diluted across noise. Front-loading qualification means every record your team touches already has a pulse.

## The framework our callers use

Our callers treat the first conversation as a filter, not a pitch. They confirm ownership, surface the *why* behind a possible sale, and gently test price expectations - all before a lead is ever marked warm. Tire-kickers get filtered out; motivated owners get fast-tracked.

> The goal is simple: when a lead hits your CRM, the only question left is "what's my offer?"

Want that filter running on your markets? [Book a call](/#book) and we'll show you the script.`,
  },
  {
    slug: "scaling-land-acquisitions-with-cold-calling",
    title: "How to Scale Land Acquisitions Without Building a Call Center",
    excerpt:
      "Hiring, training, dialers, compliance - the hidden cost of an in-house team. A look at how a done-for-you model lets you scale dials without scaling headaches.",
    category: "Scaling",
    image: "/assets/images/laptop-mockup-square.webp",
    date: "2026-04-30",
    body: `Every land investor hits the same ceiling: there are only so many hours in the day to dial. The instinct is to hire callers and build a team. It works - but the cost is bigger than the salaries.

## What an in-house calling team really costs

Standing up your own calling operation means owning all of it:

- **Recruiting and turnover** - calling is high-churn work, so you're always hiring.
- **Training** - a new caller takes weeks to get good at land conversations specifically.
- **Tooling** - dialers, phone numbers, list management, and recording.
- **Compliance** - litigator scrubbing, DNC handling, and consent rules you can't afford to get wrong.
- **Management** - someone has to coach, QA, and keep the dials consistent every single day.

None of that produces a deal directly. It's all overhead you carry just to *get* to the conversations.

## The done-for-you alternative

A done-for-you model lets you scale the one thing that matters - **conversations with motivated owners** - without scaling the headaches around it:

1. Land-trained callers who already know the script.
2. Scrubbed data and the dialer stack handled for you.
3. Consistent dial volume that doesn't dip when someone quits.
4. Qualified leads delivered straight into your CRM.

## Scale the output, not the org chart

The point isn't that in-house teams never work - plenty do. It's that most investors want *more deals*, not *more employees, software contracts, and compliance risk*. Outsourcing the calling engine lets you turn volume up or down without re-architecting your business every time.

> Scale the dials. Skip the call center.

If you're bumping against your own capacity, [book a call](/#book) and we'll map out what scaling could look like for you.`,
  },
];
