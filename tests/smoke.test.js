// Smoke tests for the Land Caller replica.
// Run after `npm run build` (imports the compiled app from dist/).
import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../dist/app.js";

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test("home route renders the full landing page", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    // Every major funnel section is present, in story order.
    for (const needle of [
      "Warm Land Seller Leads.", // hero
      "The Hard Truth", // problem
      "Built by land investors", // guide teaser
      "Stop imagining a warm lead", // call samples
      "Warm leads in your CRM", // how it works
      "We proved that we can do it.", // testimonials slider
      "Why Land Caller Wins", // why us
      "Choose your weapon", // pricing teaser
      "From the Blog", // blog teaser
      "Let's build your deal flow.", // booking climax (FAQ presence asserted via answer text below)
    ]) {
      assert.ok(html.includes(needle), `missing section: ${needle}`);
    }
    // FAQ answer is server-rendered (not just the question).
    assert.ok(html.includes("reliable, consistent pipeline of off-market seller leads"));
    // Call-sample audio players are rendered and reference the sample files.
    assert.ok(html.includes("data-audio-player"), "missing audio players");
    assert.ok(html.includes("sample-warm-lead-1.mp3"), "missing audio source");
    assert.equal((html.match(/data-audio-player/g) || []).length, 2, "expected 2 audio players");
    // Inline Calendly booking embed is present.
    assert.ok(html.includes('id="calendly-embed"'), "missing Calendly embed");
    assert.ok(html.includes("data-calendly"), "missing Calendly hook");
    // Exactly one H1 on the home page.
    assert.equal((html.match(/<h1/g) || []).length, 1, "home should have exactly one <h1>");
  } finally {
    server.close();
  }
});

test("pricing and blog pages render with one H1 each", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    for (const [path, needle] of [
      ["/pricing", "Land Caller Service Pricing"],
      ["/blog", "Insights on Cold Calling &amp; Land Acquisition"],
    ]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(res.status, 200, `page failed: ${path}`);
      const html = await res.text();
      assert.ok(html.includes(needle), `missing H1 content on ${path}`);
      assert.equal((html.match(/<h1/g) || []).length, 1, `${path} should have exactly one <h1>`);
    }
    // Pricing renders both plans, real prices, and the feature matrix.
    const pricing = await (await fetch(`http://127.0.0.1:${port}/pricing`)).text();
    for (const n of ["Land Caller Enterprise Package", "Land Caller Basic Package", "$2,850", "$1,100", "Key Features Comparison"]) {
      assert.ok(pricing.includes(n), `pricing missing: ${n}`);
    }
  } finally {
    server.close();
  }
});

test("blog post renders for a known slug and 404s for an unknown one", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const ok = await fetch(`http://127.0.0.1:${port}/blog/what-makes-a-warm-land-seller-lead`);
    assert.equal(ok.status, 200);
    assert.ok((await ok.text()).includes("What Actually Makes a Land Seller Lead"));
    const missing = await fetch(`http://127.0.0.1:${port}/blog/not-a-real-post`, { redirect: "manual" });
    assert.equal(missing.status, 404);
  } finally {
    server.close();
  }
});

test("about route renders the new-design about page", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/about`);
    assert.equal(res.status, 200);
    const html = await res.text();
    for (const needle of [
      "About Land Caller",
      "Who We Are",
      "Joe Roberts",
      "first-ever cold-calling company",
      "Ad Majorem Dei Gloriam",
      "Start Growing Your Land Investing Business Today",
    ]) {
      assert.ok(html.includes(needle), `missing: ${needle}`);
    }
  } finally {
    server.close();
  }
});

test("/about-us redirects to /about", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/about-us`, { redirect: "manual" });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "/about");
  } finally {
    server.close();
  }
});

test("contact endpoint returns JSON success without persistence", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/contact`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ name: "Jane", email: "jane@example.com" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.message, /Message sent/);
  } finally {
    server.close();
  }
});

test("SEO landing pages render with one H1 each", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    for (const [path, needle] of [
      ["/pricing", "Land Caller Service Pricing"],
      ["/blog", "Insights on Cold Calling"],
    ]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(res.status, 200, `page failed: ${path}`);
      const html = await res.text();
      assert.ok(html.includes(needle), `missing H1 on ${path}`);
      assert.equal((html.match(/<h1/g) || []).length, 1, `${path} should have exactly one <h1>`);
    }
  } finally {
    server.close();
  }
});

test("structured data (JSON-LD) is emitted with FAQPage on home", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const html = await (await fetch(`http://127.0.0.1:${port}/`)).text();
    const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    assert.ok(m, "no JSON-LD block found");
    const data = JSON.parse(m[1]);
    const types = data["@graph"].map((g) => g["@type"]);
    for (const t of ["Organization", "WebSite", "Service", "FAQPage"]) {
      assert.ok(types.includes(t), `schema missing ${t}`);
    }
  } finally {
    server.close();
  }
});

test("sitemap.xml lists canonical URLs", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
    assert.equal(res.status, 200);
    const xml = await res.text();
    assert.match(res.headers.get("content-type") || "", /xml/);
    assert.ok(xml.includes("/about"), "sitemap missing /about");
    assert.ok(xml.includes("/pricing"), "sitemap missing /pricing");
    assert.ok(xml.includes("<loc>https://landcaller.com/blog</loc>"), "sitemap missing /blog");
    // Placeholder blog posts must stay out of the sitemap until real content ships.
    assert.ok(!xml.includes("/blog/"), "sitemap should not list individual blog posts yet");
  } finally {
    server.close();
  }
});

test("security headers are present on every response", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.ok((res.headers.get("content-security-policy") || "").includes("default-src 'self'"));
  } finally {
    server.close();
  }
});

test("non-production host gets X-Robots-Tag noindex", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    // 127.0.0.1 is not the canonical production host -> must be noindexed.
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.match(res.headers.get("x-robots-tag") || "", /noindex/);
  } finally {
    server.close();
  }
});

test("placeholder blog posts are marked noindex", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/blog/cold-calling-vs-direct-mail-for-land`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<meta name="robots" content="noindex/);
  } finally {
    server.close();
  }
});

test("unknown route returns a real 404 (no soft redirect)", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/this-page-does-not-exist`, { redirect: "manual" });
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});

test("static assets are served", async () => {
  const app = createApp();
  const server = await listen(app);
  const { port } = server.address();
  try {
    for (const path of [
      "/assets/css/index.css",
      "/assets/js/main.js",
      "/assets/images/lc-logo-transparent.png",
    ]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(res.status, 200, `asset failed: ${path}`);
    }
  } finally {
    server.close();
  }
});
