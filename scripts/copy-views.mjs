import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const from = path.join(root, "src", "views");
const to = path.join(root, "dist", "views");

await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });
console.log(`Copied views -> ${path.relative(root, to)}`);
