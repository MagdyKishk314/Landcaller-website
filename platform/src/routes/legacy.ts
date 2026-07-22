import { Router, type Request, type Response } from "express";
import { logger } from "../logger.js";

/**
 * URL-parity inventory for app.landcaller.com.
 *
 * Every path an external system calls on the legacy PHP host is registered
 * here (exact paths, .php included). Until a route is implemented in its
 * phase, it answers 501 with a stable JSON body - and logs the hit, so during
 * the pre-cutover soak we can see exactly which legacy paths real traffic
 * uses. DNS for app.landcaller.com is NOT repointed until Phase 4, so these
 * stubs never shadow production.
 *
 * Implementation phases (see docs/platform-migration-plan.md):
 *   P2 = provisioning/entitlement · P3 = billing (scope per docs/phase0-audit.md)
 *
 * LCDS lives on the apex domain (landcaller.com/app/lcds/...) and is Phase 5 -
 * its routes are not part of this host's inventory.
 */

interface LegacyRoute {
  method: "GET" | "POST" | "ALL";
  path: string;
  phase: "P2" | "P3";
  note: string;
}

export const legacyRoutes: LegacyRoute[] = [
  // --- OAuth connect (P2) ---
  { method: "GET", path: "/authorize.php", phase: "P2", note: "GHL marketplace OAuth kickoff" },
  { method: "GET", path: "/callback.php", phase: "P2", note: "OAuth code exchange -> oauth_tokens" },

  // --- Provisioning webhooks (P2) ---
  { method: "POST", path: "/create_location.php", phase: "P2", note: "new tenant: location+user+registry row" },
  { method: "POST", path: "/createUser.php", phase: "P2", note: "additional seat under existing location" },
  { method: "ALL", path: "/bulk_create_enterprise_accounts.php", phase: "P2", note: "admin batch provisioning" },

  // --- Activation webhooks (P2) ---
  { method: "POST", path: "/activate_basic_user.php", phase: "P2", note: "BASIC activation + lead top-up" },
  { method: "POST", path: "/activate_enterprise_user.php", phase: "P2", note: "ENTERPRISE activation + Siftr" },
  { method: "POST", path: "/activate_only_crm_user.php", phase: "P2", note: "CRM-only activation" },
  { method: "POST", path: "/data_only_webhook.php", phase: "P2", note: "data-only plan + dashboard reveal" },
  { method: "POST", path: "/contract_status.php", phase: "P2", note: "contract signed -> flags" },
  { method: "POST", path: "/plan_renew_date_update.php", phase: "P2", note: "renewal banner date" },
  { method: "POST", path: "/webhooks/admin_hold_update_permission.php", phase: "P2", note: "admin hold permission strip" },
  { method: "POST", path: "/webhooks/create-contact.php", phase: "P2", note: "contact+opportunity ingestion" },
  { method: "GET", path: "/webhooks/capture-location.php", phase: "P2", note: "dev helper (likely drop)" },

  // --- Lookups / crons / injectors (P2) ---
  { method: "GET", path: "/check_sub_account.php", phase: "P2", note: "email existence probe (now authed)" },
  { method: "GET", path: "/get_location_details.php", phase: "P2", note: "location lookup (now authed)" },
  { method: "GET", path: "/leadcountcheck.php", phase: "P2", note: "cron: live contact-count sync" },
  { method: "GET", path: "/basic_user_leadcheck.php", phase: "P2", note: "cron: basic cap enforcement (un-pinned)" },
  { method: "GET", path: "/sso-launch.php", phase: "P2", note: "RS256 SSO into data.landcaller.com" },
  { method: "GET", path: "/accesscheck.php", phase: "P2", note: "JS injector: banners + cap gating" },
  { method: "GET", path: "/prefill_user.php", phase: "P2", note: "JS injector: window.LC_USER_DATA" },
  { method: "GET", path: "/custom_popup.js.php", phase: "P2", note: "JS injector: plan popups" },

  // --- Script-checklist mini-tool (P2) ---
  { method: "GET", path: "/script/script-checklist/index.php", phase: "P2", note: "checklist SPA shell" },
  { method: "GET", path: "/script/script-checklist/api/get-script.php", phase: "P2", note: "sections+questions" },
  { method: "POST", path: "/script/script-checklist/api/save-selection.php", phase: "P2", note: "per-location toggles" },
  { method: "POST", path: "/script/script-checklist/api/admin.php", phase: "P2", note: "admin CRUD" },

  // --- Billing (P3 - scope per phase0-audit; engine never ran live) ---
  { method: "POST", path: "/stripe-webhook.php", phase: "P3", note: "bridge webhook (checkout.session.completed)" },
  { method: "POST", path: "/stripe_products/enterprise_webhook.php", phase: "P3", note: "invoice lifecycle webhook" },
  { method: "POST", path: "/stripe_products/ghl_product_purchase.php", phase: "P3", note: "GHL storefront -> Zoho (live flow)" },
  { method: "GET", path: "/stripe_products/create-checkout.php", phase: "P3", note: "Basic checkout (Connect split)" },
  { method: "GET", path: "/stripe_products/create-enterprice-checkout.php", phase: "P3", note: "enterprise one-time (legacy spelling)" },
  { method: "GET", path: "/stripe_products/create-enterprice-subscription-checkout.php", phase: "P3", note: "enterprise contract engine" },
  { method: "GET", path: "/stripe_products/create-only-crm-checkout.php", phase: "P3", note: "CRM-only subscription" },
  { method: "POST", path: "/stripe_products/contract_pause.php", phase: "P3", note: "pause/resume (Stripe invoice/subscription ops)" },
  { method: "POST", path: "/stripe_products/contract_pause_resume.php", phase: "P3", note: "timed pause / admin hold" },
  { method: "POST", path: "/stripe_products/late_fees_toggle.php", phase: "P3", note: "late-fee flag (fix inversion)" },
  { method: "POST", path: "/stripe_products/update_contract.php", phase: "P3", note: "reschedule contract" },
  { method: "GET", path: "/stripe_products/payment_history.php", phase: "P3", note: "billing dashboard + card mgmt" },
  { method: "GET", path: "/stripe_products/payment_information.php", phase: "P3", note: "redirect shim (likely drop)" },
];

const router = Router();

for (const r of legacyRoutes) {
  const handler = (req: Request, res: Response) => {
    logger.warn("legacy path hit (not yet migrated)", {
      path: req.path,
      method: req.method,
      phase: r.phase,
    });
    res.status(501).json({
      error: "not_migrated",
      path: r.path,
      phase: r.phase,
      note: r.note,
    });
  };
  if (r.method === "ALL") router.all(r.path, handler);
  else if (r.method === "GET") router.get(r.path, handler);
  else router.post(r.path, handler);
}

export default router;
