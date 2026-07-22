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

test("unported legacy paths answer 501 not_migrated with phase tags", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/stripe_products/enterprise_webhook.php`, {
      method: "POST",
      body: "{}",
    });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.error, "not_migrated");
    assert.equal(body.phase, "P3");
  });
});

test("activation webhooks reject requests without the shared secret", async () => {
  await withServer(async (base) => {
    for (const path of ["/activate_basic_user.php", "/create_location.php", "/contract_status.php"]) {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "probe@example.com" }),
      });
      assert.equal(res.status, 401, `${path} should 401 without secret`);
      const body = await res.json();
      assert.equal(body.error, "unauthorized");
    }
  });
});

test("authorize.php redirects to the GHL marketplace with a state param", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/authorize.php`, { redirect: "manual" });
    assert.equal(res.status, 302);
    const loc = res.headers.get("location");
    assert.ok(loc?.startsWith("https://marketplace.gohighlevel.com/oauth/chooselocation"));
    assert.ok(loc?.includes("state="));
    assert.ok(res.headers.get("set-cookie")?.includes("lc_oauth_state="));
  });
});

test("lookup and cron endpoints are secret-gated", async () => {
  await withServer(async (base) => {
    for (const path of ["/check_sub_account.php?email=a@b.c", "/leadcountcheck.php"]) {
      const res = await fetch(`${base}${path}`);
      assert.equal(res.status, 401, `${path} should 401 without secret`);
    }
  });
});

test("prefill injector serves JS even without a database", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/prefill_user.php?loc_id=TESTLOC123`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /application\/javascript/);
    const body = await res.text();
    assert.ok(body.includes("window.LC_USER_DATA"));
    assert.ok(body.includes("TESTLOC123"));
  });
});

test("sso-launch reports unconfigured without a key, 400 without locationId", async () => {
  await withServer(async (base) => {
    const res400 = await fetch(`${base}/sso-launch.php`);
    assert.equal(res400.status, 400);
    const res503 = await fetch(`${base}/sso-launch.php?locationId=X1`);
    assert.equal(res503.status, 503);
  });
});

test("accesscheck and custom_popup emit JS with degraded verdicts when DB is down", async () => {
  await withServer(async (base) => {
    const ac = await fetch(`${base}/accesscheck.php?loc=LOCX`);
    assert.equal(ac.status, 200);
    assert.match(ac.headers.get("content-type") ?? "", /application\/javascript/);
    const acBody = await ac.text();
    assert.ok(acBody.includes("const isRestricted = false"));
    assert.ok(acBody.includes("0971a6dc-90aa-4bc8-8404-91c10e745c25"));

    const cp = await fetch(`${base}/custom_popup.js.php`);
    assert.equal(cp.status, 200);
    assert.equal(cp.headers.get("access-control-allow-origin"), "https://app.gohighlevel.com");
    const cpBody = await cp.text();
    assert.ok(cpBody.includes("5VVIXCjh9MkIqpov3Bhx")); // pricing funnel id
    assert.ok(cpBody.includes("Renaming active"));
  });
});

test("async handler DB failures return a JSON 500 instead of hanging", async () => {
  await withServer(async (base) => {
    // No DB configured in tests: this route awaits a query outside any
    // try/catch, so it proves rejected promises reach the error handler.
    const res = await fetch(
      `${base}/script/script-checklist/api/get-script.php?location_id=LOC1`,
      { signal: AbortSignal.timeout(5000) }
    );
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.error, "internal");
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
