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
    // Every major section is present.
    for (const needle of [
      "Warm Land Seller Leads.",
      "Who We Are",
      "What Sets Land Caller Apart?",
      "Don't Take Our Word For It",
      "Why Land Caller Wins",
      "Acquisition Packages",
      "Key Features Comparison",
      "Got Questions?",
      "Earn While You Refer",
      "Let's Talk",
    ]) {
      assert.ok(html.includes(needle), `missing section: ${needle}`);
    }
    // FAQ answer is server-rendered (not just the question).
    assert.ok(html.includes("reliable, consistent pipeline of off-market seller leads"));
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
      "Our Story",
      "Our Team",
      "Joe Roberts",
      "John Lowrey",
      "Keniqua Vasquez",
      "Ad Majorem Dei Gloriam",
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
      ["/land-investor-cold-calling", "Done-For-You Cold Calling Lead Generation for Land Investors"],
      ["/cold-calling-vs-direct-mail", "Cold Calling vs Direct Mail for Land Investors"],
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
    assert.ok(xml.includes("/land-investor-cold-calling"));
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
