import type { Request, Response } from "express";

/**
 * Progressive-enhancement endpoint for the contact form.
 *
 * The source site handles the form entirely on the client (it shows a toast and
 * resets the fields - no data is persisted). To preserve 1:1 behaviour the
 * client script does the same when JavaScript is enabled. This endpoint exists
 * only as a graceful fallback for the no-JS case and intentionally performs no
 * persistence (no database/ORM), matching the original site's behaviour.
 */
export function submitContact(req: Request, res: Response): void {
  const { name, email } = req.body ?? {};
  const message = "Message sent! We'll be in touch shortly.";

  const wantsJson =
    req.xhr ||
    (req.headers.accept ?? "").includes("application/json") ||
    req.is("application/json");

  if (wantsJson) {
    res.json({ success: true, message });
    return;
  }

  // No-JS fallback: re-render the page with a confirmation flag.
  const valid = typeof name === "string" && typeof email === "string" && name && email;
  res.status(valid ? 200 : 400);
  res.redirect("/?sent=1#contact");
}
