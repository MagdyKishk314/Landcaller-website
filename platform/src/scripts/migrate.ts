import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getGhlPool } from "../db.js";

/**
 * Minimal forward-only migration runner: applies migrations/*.sql in filename
 * order against the GHL database, recording each in schema_migrations.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "..", "..", "migrations");

async function main(): Promise<void> {
  const pool = getGhlPool();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Bootstrap: baseline creates schema_migrations itself, so run it un-tracked
  // if the table doesn't exist yet.
  const [tables] = await pool.query("SHOW TABLES LIKE 'schema_migrations'");
  const hasTracking = (tables as unknown[]).length > 0;

  const applied = new Set<string>();
  if (hasTracking) {
    const [rows] = await pool.query("SELECT filename FROM schema_migrations");
    for (const r of rows as Array<{ filename: string }>) applied.add(r.filename);
  }

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`applying ${file}...`);
    for (const statement of sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
      await pool.query(statement);
    }
    await pool.query("INSERT IGNORE INTO schema_migrations (filename) VALUES (?)", [file]);
  }
  console.log("migrations up to date");
  process.exit(0);
}

main().catch((err) => {
  console.error("migration failed:", err.message);
  process.exit(1);
});
