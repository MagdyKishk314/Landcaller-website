import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { ensureCsrfToken, passwordMatches } from "../middleware/auth.js";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function renderLogin(req: Request, res: Response): void {
  if (req.session?.authed) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", {
    error: env.adminPassword ? null : "ADMIN_PASSWORD is not set on the server.",
    csrf: ensureCsrfToken(req),
  });
}

export function submitLogin(req: Request, res: Response): void {
  const password = String(req.body?.password ?? "");
  if (!passwordMatches(password, env.adminPassword)) {
    res.status(401).render("admin/login", {
      error: "Incorrect password.",
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  if (req.session) {
    req.session.authed = true;
    // Rotate the CSRF token across the privilege boundary.
    req.session.csrf = undefined;
  }
  res.redirect("/admin");
}

export function logout(req: Request, res: Response): void {
  req.session = null;
  res.redirect("/admin/login");
}
