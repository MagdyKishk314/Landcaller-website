import type { Testimonial, TestimonialRecord, TestimonialInput } from "../models/types.js";
import { testimonials as seedTestimonials } from "../models/content.js";
import { getDb } from "../db/sqlite.js";

/** Raw row shape as returned from the `testimonials` table. */
interface TestimonialRow {
  id: number;
  quote: string;
  name: string;
  company: string;
  rating: number;
  published: number; // SQLite stores booleans as 0/1
  sort_order: number;
}

function mapRow(row: TestimonialRow): TestimonialRecord {
  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    company: row.company ?? "",
    rating: row.rating || 5,
    published: !!row.published,
    sortOrder: row.sort_order ?? 0,
  };
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error(
      "The database is unavailable. Check SQLITE_PATH / file permissions (or BLOG_DB=off)."
    );
  }
  return db;
}

const ORDER = "ORDER BY sort_order ASC, id ASC";

// ---------------------------------------------------------------------------
// Public read (degrades gracefully to the static seed when the DB is disabled)
// ---------------------------------------------------------------------------

/**
 * Visible testimonials for the public site, in display order. Falls back to the
 * static set shipped in the content model when the database is disabled, so the
 * marketing site (and the no-DB test suite) always renders.
 */
export async function listTestimonials(): Promise<Testimonial[]> {
  const db = getDb();
  if (!db) return seedTestimonials;
  const rows = db
    .prepare(`SELECT * FROM testimonials WHERE published = 1 ${ORDER}`)
    .all() as unknown as TestimonialRow[];
  return rows.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin reads / writes (require an available database)
// ---------------------------------------------------------------------------

/** Every testimonial (hidden ones included), in display order - for the admin. */
export async function listAllTestimonials(): Promise<TestimonialRecord[]> {
  const db = requireDb();
  const rows = db
    .prepare(`SELECT * FROM testimonials ${ORDER}`)
    .all() as unknown as TestimonialRow[];
  return rows.map(mapRow);
}

export async function getTestimonialById(id: number): Promise<TestimonialRecord | null> {
  const db = requireDb();
  const row = db
    .prepare("SELECT * FROM testimonials WHERE id = ? LIMIT 1")
    .get(id) as unknown as TestimonialRow | undefined;
  return row ? mapRow(row) : null;
}

export async function createTestimonial(input: TestimonialInput): Promise<TestimonialRecord> {
  const db = requireDb();
  const result = db
    .prepare(
      `INSERT INTO testimonials (quote, name, company, rating, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.quote,
      input.name,
      input.company,
      input.rating,
      input.published ? 1 : 0,
      input.sortOrder
    );
  const created = await getTestimonialById(Number(result.lastInsertRowid));
  if (!created) throw new Error("Failed to read back the created testimonial.");
  return created;
}

export async function updateTestimonial(
  id: number,
  input: TestimonialInput
): Promise<TestimonialRecord | null> {
  const db = requireDb();
  const result = db
    .prepare(
      `UPDATE testimonials SET
         quote = ?, name = ?, company = ?, rating = ?, published = ?, sort_order = ?,
         updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(
      input.quote,
      input.name,
      input.company,
      input.rating,
      input.published ? 1 : 0,
      input.sortOrder,
      id
    );
  if (result.changes === 0) return null;
  return getTestimonialById(id);
}

export async function deleteTestimonial(id: number): Promise<void> {
  const db = requireDb();
  db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);
}
