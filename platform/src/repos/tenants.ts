import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getGhlPool } from "../db.js";

/**
 * Repository for `ghl_sub_accounts` - the tenant registry (one row per
 * provisioned GHL location; a customer may own several rows sharing an email).
 * Column names preserve the legacy schema exactly, including the capitalized
 * `Package` column and the misspelled `is_enteprise_contract_ending`.
 */

export interface TenantRow extends RowDataPacket {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  location_id: string | null;
  ghl_user_id: string | null;
  contact_id: string | null;
  plan_status: string | null;
  Package: string | null;
  payment_status: string | null;
  contract_status: string | null;
  total_contact: string | null;
  enterprise_access: string | null;
}

export async function findByEmail(email: string): Promise<TenantRow | null> {
  const [rows] = await getGhlPool().query<TenantRow[]>(
    "SELECT * FROM ghl_sub_accounts WHERE email = ? ORDER BY id ASC LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findByLocationId(locationId: string): Promise<TenantRow | null> {
  const [rows] = await getGhlPool().query<TenantRow[]>(
    "SELECT * FROM ghl_sub_accounts WHERE location_id = ? LIMIT 1",
    [locationId]
  );
  return rows[0] ?? null;
}

export interface NewTenant {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  locationId: string;
}

/** Insert a freshly provisioned tenant as Inactive (activation comes later). */
export async function insertTenant(t: NewTenant): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `INSERT INTO ghl_sub_accounts
       (name, first_name, last_name, email, phone, address, city, state, country, postalCode,
        location_id, plan_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Inactive', NOW())`,
    [
      t.name, t.firstName, t.lastName, t.email, t.phone ?? null, t.address ?? null,
      t.city ?? null, t.state ?? null, t.country ?? null, t.postalCode ?? null, t.locationId,
    ]
  );
  return res.insertId;
}

export async function setGhlUser(locationId: string, ghlUserId: string): Promise<void> {
  await getGhlPool().query(
    "UPDATE ghl_sub_accounts SET ghl_user_id = ? WHERE location_id = ?",
    [ghlUserId, locationId]
  );
}

export async function setUserAndContact(
  locationId: string,
  ghlUserId: string,
  contactId: string | null
): Promise<void> {
  await getGhlPool().query(
    "UPDATE ghl_sub_accounts SET ghl_user_id = ?, contact_id = ? WHERE location_id = ?",
    [ghlUserId, contactId, locationId]
  );
}

/** BASIC activation: top up the lead cap and reset the plan flags (legacy math kept). */
export async function activateBasic(email: string, totalLeads: number): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `UPDATE ghl_sub_accounts SET
       total_contact = COALESCE(NULLIF(total_contact, 'unlimited'), 0) + ?,
       \`Package\` = 'BASIC',
       is_all_leads_delivered = 'false',
       is_enteprise_contract_ending = 'false',
       plan_auto_renew_date = '',
       plan_status = 'active'
     WHERE email = ?`,
    [totalLeads, email]
  );
  return res.affectedRows;
}

export async function activateEnterprise(
  ghlUserId: string,
  paymentStatus: "paid" | "unpaid"
): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `UPDATE ghl_sub_accounts SET
       plan_status = 'active', \`Package\` = 'ENTERPRISE',
       payment_status = ?, contract_status = 'signed'
     WHERE ghl_user_id = ?`,
    [paymentStatus, ghlUserId]
  );
  return res.affectedRows;
}

export async function activateOnlyCrm(ghlUserId: string): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    "UPDATE ghl_sub_accounts SET plan_status = 'active', `Package` = 'only_crm' WHERE ghl_user_id = ?",
    [ghlUserId]
  );
  return res.affectedRows;
}

/**
 * Data-only activation. Legacy bug fixed: it always added a NULL lead count,
 * which wiped total_contact to NULL. Here the cap changes only when a numeric
 * totalLeads is actually provided.
 */
export async function activateDataOnly(
  ghlUserId: string,
  totalLeads: number | null
): Promise<number> {
  if (totalLeads !== null) {
    const [res] = await getGhlPool().query<ResultSetHeader>(
      `UPDATE ghl_sub_accounts SET
         plan_status = 'active', \`Package\` = 'only_data',
         total_contact = COALESCE(NULLIF(total_contact, 'unlimited'), 0) + ?,
         updated_at = NOW()
       WHERE ghl_user_id = ?`,
      [totalLeads, ghlUserId]
    );
    return res.affectedRows;
  }
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `UPDATE ghl_sub_accounts SET
       plan_status = 'active', \`Package\` = 'only_data', updated_at = NOW()
     WHERE ghl_user_id = ?`,
    [ghlUserId]
  );
  return res.affectedRows;
}

/** Contract-signed webhook (parity: forces active + giveaccess regardless of status value). */
export async function setContractSigned(email: string, status: string): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `UPDATE ghl_sub_accounts SET
       contract_status = ?, plan_status = 'active',
       contract_sign_date = NOW(), enterprise_access = 'giveaccess'
     WHERE email = ?`,
    [status, email]
  );
  return res.affectedRows;
}

export async function setRenewDate(locationId: string, renewDate: string): Promise<number> {
  const [res] = await getGhlPool().query<ResultSetHeader>(
    `UPDATE ghl_sub_accounts SET
       is_enteprise_contract_ending = 'true', plan_auto_renew_date = ?, updated_at = NOW()
     WHERE location_id = ?`,
    [renewDate, locationId]
  );
  return res.affectedRows;
}
