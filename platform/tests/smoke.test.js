import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../dist/app.js";

/** Boot the built app on an ephemeral port and probe it over real HTTP. */
async function withServer(fn) {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

test("healthz responds ok (db false without config)", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/healthz`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "landcaller-platform");
    assert.equal(typeof body.db, "boolean");
  });
});

test("legacy paths answer 501 not_migrated with phase tags", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/activate_basic_user.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "probe@example.com" }),
    });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.error, "not_migrated");
    assert.equal(body.phase, "P2");

    const res2 = await fetch(`${base}/stripe_products/enterprise_webhook.php`, {
      method: "POST",
      body: "{}",
    });
    assert.equal(res2.status, 501);
    const body2 = await res2.json();
    assert.equal(body2.phase, "P3");
  });
});

test("unknown paths 404 as JSON", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/definitely-not-a-route`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, "not_found");
  });
});
