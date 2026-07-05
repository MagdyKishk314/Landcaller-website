/**
 * Dev-only module hook. The project's imports use ".js" extension specifiers
 * (e.g. `import { createApp } from "./app.js"`) that point at ".ts" source, the
 * standard style for NodeNext TypeScript. When Node runs the sources directly
 * via its built-in TypeScript support, its resolver does NOT remap ".js" to the
 * ".ts" file on disk. This hook adds that fallback so `node src/server.ts` works
 * without a bundler/transpiler (previously handled by tsx). No effect in prod,
 * where `npm start` runs the compiled dist/*.js.
 */
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      // Only retry relative ".js" specifiers by pointing at the ".ts" source.
      if (
        (specifier.startsWith("./") || specifier.startsWith("../")) &&
        specifier.endsWith(".js")
      ) {
        return nextResolve(specifier.slice(0, -3) + ".ts", context);
      }
      throw err;
    }
  },
});
