import { Router, type Request } from "express";
import { logger } from "../logger.js";
import * as tenants from "../repos/tenants.js";

/**
 * JS injectors loaded inside the GHL CRM UI via custom-JS snippets.
 * Browser-facing and therefore public (matches legacy).
 *
 * Implemented: prefill_user.php (window.LC_USER_DATA).
 * accesscheck.php and custom_popup.js.php land with the extraction spec -
 * until then the legacy versions keep serving from the old host (DNS still
 * points there), so nothing is degraded.
 */
const router = Router();

/** Resolve the GHL location id from a query param or the Referer URL (legacy regex). */
function resolveLocation(req: Request, param: string): string {
  const q = req.query[param];
  if (typeof q === "string" && q.trim()) return q.trim();
  const ref = req.headers.referer ?? "";
  const m = /location\/([A-Za-z0-9]+)/.exec(ref);
  return m?.[1] ?? "";
}

router.get("/prefill_user.php", async (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  const locationId = resolveLocation(req, "loc_id");
  let data = { first_name: "", last_name: "", email: "", location_id: locationId };
  if (locationId) {
    try {
      const row = await tenants.findByLocationId(locationId);
      if (row) {
        data = {
          first_name: row.first_name ?? "",
          last_name: row.last_name ?? "",
          email: row.email ?? "",
          location_id: locationId,
        };
      }
    } catch (err) {
      // Fail silently in the browser (legacy behavior) but log server-side.
      logger.warn("prefill_user lookup failed", {
        locationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  res.send(`(function () { window.LC_USER_DATA = ${JSON.stringify(data)}; })();`);
});

export default router;
