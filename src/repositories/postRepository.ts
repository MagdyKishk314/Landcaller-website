import type { BlogPost, BlogPostRecord, PostInput } from "../models/types.js";
import { blogPosts as seedPosts } from "../models/blog.js";
import { getDb } from "../db/sqlite.js";
import { renderMarkdown, readingTime } from "../lib/markdown.js";

/** Raw row shape as returned from the `posts` table. */
interface PostRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  published: number; // SQLite stores booleans as 0/1
  published_at: string | null;
  created_at: string;
}

const DEFAULT_IMAGE = "/assets/images/laptop-mockup-square.webp";

/** Format a Date as YYYY-MM-DD using its *local* calendar parts. */
function localISODate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function toISODate(value: string | null | undefined, fallback: string): string {
  // Dates are stored as 'YYYY-MM-DD' (published_at) or a datetime string
  // (created_at). Pass a plain date through as-is; format anything else from
  // local parts so the calendar day never shifts across timezones.
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  const d = new Date(value || fallback);
  return Number.isNaN(d.getTime()) ? localISODate(new Date()) : localISODate(d);
}

function mapRow(row: PostRow): BlogPostRecord {
  const body = row.body ?? "";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body,
    bodyHtml: renderMarkdown(body),
    category: row.category || "General",
    image: row.image || DEFAULT_IMAGE,
    date: toISODate(row.published_at, row.created_at),
    readingTime: readingTime(body),
    published: !!row.published,
  };
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error(
      "The blog database is unavailable. Check SQLITE_PATH / file permissions (or BLOG_DB=off)."
    );
  }
  return db;
}

const ORDER = "ORDER BY (published_at IS NULL), published_at DESC, created_at DESC";

// ---------------------------------------------------------------------------
// Public reads (degrade gracefully to the static seed when the DB is disabled)
// ---------------------------------------------------------------------------

/** Published posts, newest first. Falls back to the static seed without a DB. */
export async function listPublishedPosts(limit?: number): Promise<BlogPost[]> {
  const db = getDb();
  if (!db) {
    return typeof limit === "number" ? seedPosts.slice(0, limit) : seedPosts;
  }
  const sql = `SELECT * FROM posts WHERE published = 1 ${ORDER}${
    typeof limit === "number" ? " LIMIT ?" : ""
  }`;
  const rows = (
    typeof limit === "number" ? db.prepare(sql).all(limit) : db.prepare(sql).all()
  ) as unknown as PostRow[];
  return rows.map(mapRow);
}

/**
 * A single published post by slug. Without a DB, falls back to the static seed
 * (body-less, so the post page shows its "coming soon" placeholder).
 */
export async function getPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null> {
  const db = getDb();
  if (!db) {
    const seed = seedPosts.find((p) => p.slug === slug);
    return seed ? { ...seed, id: 0, body: "", bodyHtml: "", published: true } : null;
  }
  const row = db
    .prepare("SELECT * FROM posts WHERE slug = ? AND published = 1 LIMIT 1")
    .get(slug) as unknown as PostRow | undefined;
  return row ? mapRow(row) : null;
}

/**
 * Published posts for the sitemap. Returns nothing when the DB is disabled -
 * body-less seed placeholders are noindex and must never leak into the sitemap.
 */
export async function listPublishedPostsForSitemap(): Promise<BlogPost[]> {
  if (!getDb()) return [];
  return listPublishedPosts();
}

// ---------------------------------------------------------------------------
// Admin reads / writes (require an available database)
// ---------------------------------------------------------------------------

/** Every post (drafts included), newest first - for the admin dashboard. */
export async function listAllPosts(): Promise<BlogPostRecord[]> {
  const db = requireDb();
  const rows = db.prepare(`SELECT * FROM posts ${ORDER}`).all() as unknown as PostRow[];
  return rows.map(mapRow);
}

export async function getPostById(id: number): Promise<BlogPostRecord | null> {
  const db = requireDb();
  const row = db.prepare("SELECT * FROM posts WHERE id = ? LIMIT 1").get(id) as unknown as
    | PostRow
    | undefined;
  return row ? mapRow(row) : null;
}

export async function createPost(input: PostInput): Promise<BlogPostRecord> {
  const db = requireDb();
  const result = db
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, body, category, image, published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.slug,
      input.title,
      input.excerpt,
      input.body,
      input.category,
      input.image,
      input.published ? 1 : 0,
      input.publishedAt
    );
  const created = await getPostById(Number(result.lastInsertRowid));
  if (!created) throw new Error("Failed to read back the created post.");
  return created;
}

export async function updatePost(id: number, input: PostInput): Promise<BlogPostRecord | null> {
  const db = requireDb();
  const result = db
    .prepare(
      `UPDATE posts SET
         slug = ?, title = ?, excerpt = ?, body = ?, category = ?, image = ?,
         published = ?, published_at = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(
      input.slug,
      input.title,
      input.excerpt,
      input.body,
      input.category,
      input.image,
      input.published ? 1 : 0,
      input.publishedAt,
      id
    );
  if (result.changes === 0) return null;
  return getPostById(id);
}

export async function deletePost(id: number): Promise<void> {
  const db = requireDb();
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/** True if another post already owns this slug (optionally excluding one id). */
export async function slugExists(slug: string, exceptId?: number): Promise<boolean> {
  const db = requireDb();
  const row =
    typeof exceptId === "number"
      ? db.prepare("SELECT 1 FROM posts WHERE slug = ? AND id <> ? LIMIT 1").get(slug, exceptId)
      : db.prepare("SELECT 1 FROM posts WHERE slug = ? LIMIT 1").get(slug);
  return row !== undefined;
}
