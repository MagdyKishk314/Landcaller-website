import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import "../config/env.js"; // ensure .env is loaded before we read SQLITE_PATH
import { starterPosts } from "./starterPosts.js";

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

    const tableExisted = handle
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'")
      .get();
    handle.exec(SCHEMA);
    if (!tableExisted) seed(handle); // fresh database -> starter content

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
  if (forceSeed) seed(handle);
  const row = handle.prepare("SELECT count(*) AS c FROM posts").get() as { c: number };
  return { path: resolveDbPath(), count: row.c };
}
