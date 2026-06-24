import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

/** Gate a route behind a valid admin session. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.authed) {
    next();
    return;
  }
  res.redirect("/admin/login");
}

/** Constant-time password comparison (avoids timing leaks). */
export function passwordMatches(provided: string, expected: string): boolean {
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Lazily mint a per-session CSRF token and return it for form embedding. */
export function ensureCsrfToken(req: Request): string {
  if (!req.session) throw new Error("Session is not initialized");
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(24).toString("hex");
  }
  return req.session.csrf as string;
}

/** Reject POSTs whose `_csrf` field doesn't match the session token. */
export function verifyCsrf(req: Request, res: Response, next: NextFunction): void {
  const token = req.body?._csrf as string | undefined;
  const expected = req.session?.csrf as string | undefined;
  if (token && expected && token === expected) {
    next();
    return;
  }
  res.status(403).send("Invalid or expired form token. Go back, reload the page, and try again.");
}
