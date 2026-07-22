import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { config } from "../config.js";
import { getGhlPool } from "../db.js";

/**
 * Call-script checklist API - port of script/script-checklist/api/*.
 * Tables (script_sections, script_questions, location_selected_questions)
 * arrive with the production dump. "Absence of a selection row = selected"
 * (COALESCE default 1) is preserved.
 *
 * Auth model preserved from legacy: admin = the master location id. These
 * endpoints are called from the SPA inside the GHL iframe, so they stay
 * cookie-less/public with the location-derived role (documented limitation).
 */
const router = Router();
const base = "/script/script-checklist/api";

function isAdmin(locationId: string): boolean {
  return Boolean(config.ghl.masterLocationId) && locationId === config.ghl.masterLocationId;
}

interface SectionRow extends RowDataPacket {
  id: number;
  title: string;
  order_index: number;
  more_info: string | null;
}
interface QuestionRow extends RowDataPacket {
  id: number;
  section_id: number;
  question_text: string;
  why_we_ask: string | null;
  why_it_works: string | null;
  order_index: number;
  is_selected: number;
}

router.get(`${base}/get-script.php`, async (req, res) => {
  const locationId = typeof req.query.location_id === "string" ? req.query.location_id.trim() : "";
  if (!locationId) {
    res.status(400).json({ error: "location_id is required" });
    return;
  }
  const pool = getGhlPool();
  const [sections] = await pool.query<SectionRow[]>(
    "SELECT id, title, order_index, more_info FROM script_sections ORDER BY order_index, id"
  );
  const [questions] = await pool.query<QuestionRow[]>(
    `SELECT q.id, q.section_id, q.question_text, q.why_we_ask, q.why_it_works, q.order_index,
            COALESCE(lsq.is_selected, 1) AS is_selected
       FROM script_questions q
       LEFT JOIN location_selected_questions lsq
         ON lsq.question_id = q.id AND lsq.location_id = ?
      ORDER BY q.order_index, q.id`,
    [locationId]
  );
  res.json({
    is_admin: isAdmin(locationId),
    sections: sections.map((s) => ({
      ...s,
      questions: questions.filter((q) => q.section_id === s.id),
    })),
  });
});

router.post(`${base}/save-selection.php`, async (req, res) => {
  const locationId = String(req.body?.location_id ?? "").trim();
  const selections = Array.isArray(req.body?.selections) ? req.body.selections : [];
  if (!locationId || selections.length === 0) {
    res.status(400).json({ error: "location_id and selections are required" });
    return;
  }
  const pool = getGhlPool();
  const [valid] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM script_questions WHERE id IN (?)",
    [selections.map((s: { question_id: number }) => Number(s.question_id))]
  );
  const validIds = new Set(valid.map((r) => Number(r.id)));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const s of selections as Array<{ question_id: number; is_selected: number | boolean }>) {
      const qid = Number(s.question_id);
      if (!validIds.has(qid)) continue;
      await conn.query(
        `INSERT INTO location_selected_questions (location_id, question_id, is_selected, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE is_selected = VALUES(is_selected), updated_at = NOW()`,
        [locationId, qid, s.is_selected ? 1 : 0]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  res.json({ success: true });
});

router.post(`${base}/admin.php`, async (req, res) => {
  const locationId = String(req.body?.location_id ?? "").trim();
  if (!isAdmin(locationId)) {
    res.status(403).json({ error: "admin only" });
    return;
  }
  const action = String(req.body?.action ?? req.query.action ?? "");
  const pool = getGhlPool();

  switch (action) {
    case "add_section": {
      const [r] = await pool.query<ResultSetHeader>(
        "INSERT INTO script_sections (title, order_index, more_info, created_at) VALUES (?, ?, ?, NOW())",
        [String(req.body.title ?? ""), Number(req.body.order_index ?? 0), req.body.more_info ?? null]
      );
      res.json({ success: true, id: r.insertId });
      return;
    }
    case "edit_section": {
      await pool.query(
        "UPDATE script_sections SET title = ?, order_index = ?, more_info = ? WHERE id = ?",
        [String(req.body.title ?? ""), Number(req.body.order_index ?? 0), req.body.more_info ?? null, Number(req.body.id)]
      );
      res.json({ success: true });
      return;
    }
    case "add_question": {
      const [r] = await pool.query<ResultSetHeader>(
        `INSERT INTO script_questions (section_id, question_text, why_we_ask, why_it_works, order_index, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          Number(req.body.section_id),
          String(req.body.question_text ?? ""),
          req.body.why_we_ask ?? null,
          req.body.why_it_works ?? null,
          Number(req.body.order_index ?? 0),
        ]
      );
      res.json({ success: true, id: r.insertId });
      return;
    }
    case "edit_question": {
      await pool.query(
        `UPDATE script_questions SET question_text = ?, why_we_ask = ?, why_it_works = ?, order_index = ? WHERE id = ?`,
        [
          String(req.body.question_text ?? ""),
          req.body.why_we_ask ?? null,
          req.body.why_it_works ?? null,
          Number(req.body.order_index ?? 0),
          Number(req.body.id),
        ]
      );
      res.json({ success: true });
      return;
    }
    case "delete_question": {
      // FK ON DELETE CASCADE cleans location_selected_questions.
      await pool.query("DELETE FROM script_questions WHERE id = ?", [Number(req.body.id)]);
      res.json({ success: true });
      return;
    }
    default:
      res.status(400).json({ error: `unknown action ${action}` });
  }
});

export default router;
