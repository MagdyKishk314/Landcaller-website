/**
 * Dev-only module hook. The project's imports use ".js" extension specifiers
 * (e.g. `import { createApp } from "./app.js"`) that point at ".ts" source, the
 * standard style for NodeNext TypeScript. When Node runs the sources directly
 * via its built-in TypeScript support, its resolver does NOT remap ".js" to the
 * ".ts" file on disk. This hook adds that fallback so `node src/server.ts` works
 * without a bundler/transpiler (previously handled by tsx). No effect in prod,
 * where `npm start` runs the compiled dist/*.js.
 *
 * Registers the resolve hook via the async `module.register()` API (stable since
 * Node 20) rather than the synchronous `registerHooks` (only Node 22.15+), so
 * `npm run dev` works on older Node 22.x releases too.
 */
import { register } from "node:module";

register("./dev-ts-hooks.mjs", import.meta.url);
