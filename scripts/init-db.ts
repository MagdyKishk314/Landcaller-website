/**
 * Database setup for the blog CMS (SQLite via Node's built-in node:sqlite).
 *
 *   npm run db:init    # create the SQLite file + schema (seeds if brand-new)
 *   npm run db:seed    # same, and force-insert the starter articles
 *
 * The database path is SQLITE_PATH, or ./data/blog.db locally (/tmp/blog.db on
 * Vercel). Safe to re-run: the schema is IF-NOT-EXISTS and seeding is idempotent
 * (INSERT OR IGNORE on the unique slug).
 */
import { setupDatabase } from "../src/db/sqlite.js";

const forceSeed = process.argv.includes("--seed");
const { path, count } = setupDatabase(forceSeed);

console.log(`✓ SQLite ready at ${path}`);
console.log(`✓ ${count} post${count === 1 ? "" : "s"} in the database`);
console.log("Done.");
