import mysql, { type Pool } from "mysql2/promise";
import { config } from "./config.js";

/**
 * Lazy connection pools for the two platform databases. Pools are created on
 * first use so the service (health endpoint, legacy stubs) boots without a
 * database during early phases.
 */

let ghlPool: Pool | null = null;
let lcdsPool: Pool | null = null;

function createPool(database: string): Pool {
  if (!config.db.user) {
    throw new Error("Database not configured (set DB_USER/DB_PASSWORD in .env)");
  }
  return mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4_general_ci",
    // Legacy tables use DATE/DATETIME with string semantics throughout the
    // ported logic; keep them as strings to avoid TZ drift in cycle math.
    dateStrings: true,
  });
}

/** Pool for the provisioning/billing DB (legacy u353253270_Landcaller_ghl). */
export function getGhlPool(): Pool {
  if (!ghlPool) ghlPool = createPool(config.db.nameGhl);
  return ghlPool;
}

/** Pool for the LCDS lead-system DB (legacy u353253270_lcds_db). Phase 5. */
export function getLcdsPool(): Pool {
  if (!lcdsPool) lcdsPool = createPool(config.db.nameLcds);
  return lcdsPool;
}

/** Health probe: true if the GHL DB answers SELECT 1. Never throws. */
export async function dbHealthy(): Promise<boolean> {
  try {
    await getGhlPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
