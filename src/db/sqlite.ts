import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import "../config/env.js"; // ensure .env is loaded before we read SQLITE_PATH
import { starterPosts } from "./starterPosts.js";
import { testimonials as starterTestimonials } from "../models/content.js";

/**
 * SQLite storage via Node's built-in `node:sqlite` - no third-party database or
 * driver. The file lives on disk (persistent on a VPS/long-running host). On
 * serverless (Vercel) the disk is ephemeral, so we default to /tmp and re-seed
 * a fresh database on each cold start - fine for a read-only demo.
 *
 * If SQLite can't be opened (e.g. an older runtime without node:sqlite, or a
 * read-only path), getDb() returns null and the app falls back to the static
 * seed in src/models/blog.ts so the public site still renders.
 */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS posts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    excerpt      TEXT NOT NULL DEFAULT '',
    body         TEXT NOT NULL DEFAULT '',
    category     TEXT NOT NULL DEFAULT 'General',
    image        TEXT NOT NULL DEFAULT '/assets/images/laptop-mockup-square.webp',
    published    INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at);

  CREATE TABLE IF NOT EXISTS testimonials (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    quote      TEXT NOT NULL,
    name       TEXT NOT NULL,
    company    TEXT NOT NULL DEFAULT '',
    rating     INTEGER NOT NULL DEFAULT 5,
    published  INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS testimonials_order_idx ON testimonials (published, sort_order);
`;

let db: DatabaseSync | null = null;
let attempted = false;

/** Disable the database entirely (used by the test suite). */
export function isDbEnabled(): boolean {
  return process.env.BLOG_DB !== "off";
}

export function resolveDbPath(): string {
  if (process.env.SQLITE_PATH) return process.env.SQLITE_PATH;
  if (process.env.VERCEL) return "/tmp/blog.db";
  return path.resolve(process.cwd(), "data", "blog.db");
}

/** Insert the starter posts, ignoring any whose slug already exists. */
function seed(handle: DatabaseSync): void {
  const stmt = handle.prepare(
    `INSERT OR IGNORE INTO posts (slug, title, excerpt, body, category, image, published, published_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
  );
  for (const p of starterPosts) {
    stmt.run(p.slug, p.title, p.excerpt, p.body, p.category, p.image, p.date);
  }
}

/** Insert the starter testimonials (the static set that ships with the site). */
function seedTestimonials(handle: DatabaseSync): void {
  const stmt = handle.prepare(
    `INSERT INTO testimonials (quote, name, company, rating, published, sort_order)
     VALUES (?, ?, ?, ?, 1, ?)`
  );
  starterTestimonials.forEach((t, i) => {
    stmt.run(t.quote, t.name, t.company, t.rating, i);
  });
}

/** True if a table already exists in the open database. */
function tableExists(handle: DatabaseSync, name: string): boolean {
  return (
    handle
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(name) !== undefined
  );
}

/**
 * Open (once) and return the SQLite handle, or null if the database is disabled
 * or can't be opened. A brand-new database is seeded with the starter posts; an
 * existing one is left untouched.
 */
export function getDb(): DatabaseSync | null {
  if (!isDbEnabled()) return null;
  if (attempted) return db;
  attempted = true;
  try {
    const file = resolveDbPath();
    if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
    const handle = new DatabaseSync(file);
    handle.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

    // Check each table *before* applying the schema so we only seed the ones
    // that didn't already exist - this lets an older database (posts only) gain
    // a freshly-seeded testimonials table without touching its posts.
    const postsExisted = tableExists(handle, "posts");
    const testimonialsExisted = tableExists(handle, "testimonials");
    handle.exec(SCHEMA);
    if (!postsExisted) seed(handle); // fresh database -> starter content
    if (!testimonialsExisted) seedTestimonials(handle);

    db = handle;
    return db;
  } catch (err) {
    console.error("[db] SQLite unavailable, falling back to static seed:", err);
    db = null;
    return null;
  }
}

/**
 * Ensure the schema exists and optionally force-(re)seed the starter posts.
 * Used by the `db:init` / `db:seed` setup scripts.
 */
export function setupDatabase(forceSeed = false): { path: string; count: number } {
  const handle = getDb();
  if (!handle) {
    throw new Error(
      "SQLite is disabled (BLOG_DB=off) or could not be opened. Check SQLITE_PATH / permissions."
    );
  }
  if (forceSeed) {
    seed(handle);
    // Testimonials have no natural unique key, so only seed when empty to avoid
    // duplicating the starter set on repeated `db:seed` runs.
    const existing = handle
      .prepare("SELECT count(*) AS c FROM testimonials")
      .get() as { c: number };
    if (existing.c === 0) seedTestimonials(handle);
  }
  const row = handle.prepare("SELECT count(*) AS c FROM posts").get() as { c: number };
  return { path: resolveDbPath(), count: row.c };
}
