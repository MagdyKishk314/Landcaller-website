import { Router } from "express";
import { logger } from "../logger.js";
import { ghl, GhlApiError } from "../lib/ghl.js";
import { requireWebhookSecret } from "../middleware/webhookAuth.js";

/**
 * Inbound lead ingestion - port of webhooks/create-contact.php.
 * Creates/updates a contact and an opportunity (with dynamic custom fields)
 * inside a location, using a location token.
 *
 * Preserved legacy behaviors: custom fields are auto-created when missing
 * (type inferred from name/value), the opportunity lands in the pipeline
 * literally named "Sales Pipeline", and duplicates turn into updates.
 */
const router = Router();

type Field = { key: string; value: unknown };
type CustomFieldDef = { id: string; name?: string; fieldKey?: string };

function inferFieldType(key: string, value: unknown): "TEXT" | "DATE" | "NUMERICAL" | "MONETORY" {
  const k = key.toLowerCase();
  if (k.includes("date")) return "DATE";
  if (k.includes("price") || k.includes("amount") || k.includes("value") || k.includes("cost"))
    return "MONETORY"; // GHL's actual (misspelled) type name
  if (typeof value === "number" || (typeof value === "string" && /^\d+(\.\d+)?$/.test(value)))
    return "NUMERICAL";
  return "TEXT";
}

/** Resolve custom-field defs by name, creating any that don't exist. */
async function resolveFields(
  locationId: string,
  token: string,
  model: "contact" | "opportunity",
  fields: Field[]
): Promise<Array<{ id: string; value: unknown }>> {
  if (fields.length === 0) return [];
  const list = await ghl.request<{ customFields?: CustomFieldDef[] }>(
    "GET",
    `/locations/${locationId}/customFields?model=${model}`,
    undefined,
    { token }
  );
  const byName = new Map<string, CustomFieldDef>();
  for (const f of list.customFields ?? []) {
    if (f.name) byName.set(f.name.toLowerCase(), f);
  }

  const out: Array<{ id: string; value: unknown }> = [];
  for (const f of fields) {
    if (!f.key) continue;
    let def = byName.get(f.key.toLowerCase());
    if (!def) {
      const created = await ghl.request<{ customField?: CustomFieldDef }>(
        "POST",
        `/locations/${locationId}/customFields`,
        { name: f.key, dataType: inferFieldType(f.key, f.value), model },
        { token }
      );
      def = created.customField;
      if (def?.name) byName.set(def.name.toLowerCase(), def);
    }
    if (def?.id) out.push({ id: def.id, value: f.value });
  }
  return out;
}

router.post("/webhooks/create-contact.php", requireWebhookSecret, async (req, res) => {
  const b = req.body ?? {};
  const locationId = String(b.locationId ?? "").trim();
  const firstName = String(b.firstName ?? "").trim();
  const lastName = String(b.lastName ?? "").trim();
  const email = String(b.email ?? "").trim();
  const opportunityName = String(b.opportunityName ?? "").trim();
  if (!locationId || !firstName || !lastName || !email || !opportunityName) {
    res.status(400).json({
      success: false,
      message: "locationId, firstName, lastName, email, opportunityName are required",
    });
    return;
  }

  try {
    const token = await ghl.getLocationToken(locationId);
    if (!token) throw new Error("could not mint location token");

    // --- Contact: create, or update on duplicate ---
    let contactId: string;
    try {
      const created = await ghl.request<{ contact?: { id: string } }>(
        "POST",
        "/contacts/",
        { locationId, firstName, lastName, email, phone: b.phone },
        { token }
      );
      if (!created.contact?.id) throw new Error("contact create returned no id");
      contactId = created.contact.id;
    } catch (err) {
      const dupId =
        err instanceof GhlApiError
          ? (err.body as { meta?: { contactId?: string } })?.meta?.contactId
          : undefined;
      if (!dupId) throw err;
      contactId = dupId;
      await ghl.request(
        "PUT",
        `/contacts/${contactId}`,
        { firstName, lastName, phone: b.phone },
        { token }
      );
    }

    // --- Contact custom fields ---
    const contactFields = Array.isArray(b.contactCustomFields) ? (b.contactCustomFields as Field[]) : [];
    const resolvedContactFields = await resolveFields(locationId, token, "contact", contactFields);
    if (resolvedContactFields.length > 0) {
      await ghl.request("PUT", `/contacts/${contactId}`, { customFields: resolvedContactFields }, { token });
    }

    // --- Pipeline: literally named "Sales Pipeline" (legacy dependency) ---
    const pipelines = await ghl.request<{ pipelines?: Array<{ id: string; name: string }> }>(
      "GET",
      `/opportunities/pipelines/?locationId=${encodeURIComponent(locationId)}`,
      undefined,
      { token }
    );
    const pipeline = pipelines.pipelines?.find((p) => p.name === "Sales Pipeline");
    if (!pipeline) {
      res.status(200).json({
        success: true,
        contactId,
        opportunityId: null,
        warning: 'no pipeline named "Sales Pipeline" in this location',
      });
      return;
    }

    // --- Opportunity: create, or update on duplicate ---
    let opportunityId: string | null = null;
    try {
      const opp = await ghl.request<{ opportunity?: { id: string } }>(
        "POST",
        "/opportunities/",
        { locationId, pipelineId: pipeline.id, name: opportunityName, contactId, status: "open" },
        { token }
      );
      opportunityId = opp.opportunity?.id ?? null;
    } catch (err) {
      if (!(err instanceof GhlApiError)) throw err;
      const search = await ghl.request<{ opportunities?: Array<{ id: string }> }>(
        "GET",
        `/opportunities/search?location_id=${encodeURIComponent(locationId)}&contact_id=${encodeURIComponent(contactId)}`,
        undefined,
        { token }
      );
      opportunityId = search.opportunities?.[0]?.id ?? null;
      if (opportunityId) {
        await ghl.request("PUT", `/opportunities/${opportunityId}`, { name: opportunityName }, { token });
      }
    }

    // --- Opportunity custom fields ---
    const oppFields = Array.isArray(b.opportunityCustomFields ?? b.customFields)
      ? ((b.opportunityCustomFields ?? b.customFields) as Field[])
      : [];
    if (opportunityId && oppFields.length > 0) {
      const resolved = await resolveFields(locationId, token, "opportunity", oppFields);
      if (resolved.length > 0) {
        await ghl.request("PUT", `/opportunities/${opportunityId}`, { customFields: resolved }, { token });
      }
    }

    res.json({ success: true, contactId, opportunityId });
  } catch (err) {
    logger.error("create-contact webhook failed", {
      locationId,
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({ success: false, message: "ingestion failed" });
  }
});

export default router;
