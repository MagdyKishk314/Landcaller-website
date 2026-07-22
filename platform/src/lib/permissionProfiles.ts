import profilesData from "./permissionProfiles.data.js";

/**
 * Single source of truth for GHL user permission/scope sets. The legacy PHP
 * duplicated these ~80-key maps across ~8 files; every entitlement change
 * meant editing all of them. Here each plan state is one named profile.
 *
 * The data file is extracted verbatim from the legacy code (including GHL's
 * exact key spellings) - see permissionProfiles.data.ts for provenance notes.
 */

export type ProfileName =
  | "DEFAULT_CREATE" // applied at user creation
  | "BASIC"          // basic (lead-cap) plan activation
  | "ENTERPRISE"     // full enterprise activation
  | "ONLY_CRM"       // CRM-only plan
  | "ONLY_DATA"      // data-only plan (assignedDataOnly)
  | "ADMIN_HOLD"     // admin hold - marketing/social/etc stripped
  | "CAP_BLOCKED"    // basic cap reached - contact creation revoked
  | "ACCESS_GIVE"    // accessManagement('giveaccess')
  | "ACCESS_BLOCK";  // accessManagement('blockaccess') - view-only

import type { ProfileData } from "./permissionProfiles.data.js";
export type Profile = ProfileData;

const profiles = profilesData.profiles;

export function getProfile(name: ProfileName): Profile {
  const p = profiles[name];
  if (!p || Object.keys(p.permissions).length === 0) {
    throw new Error(`Permission profile ${name} is empty - extraction incomplete`);
  }
  return p;
}

/** GHL's scope allow-list (from admin_hold_update_permission.php) - scopes not
 *  in this list are rejected by the GHL users API. */
export const scopeAllowList: string[] = profilesData.scopeAllowList;

export function filterScopes(scopes: string[]): string[] {
  if (scopeAllowList.length === 0) return scopes;
  const allowed = new Set(scopeAllowList);
  return scopes.filter((s) => allowed.has(s));
}
