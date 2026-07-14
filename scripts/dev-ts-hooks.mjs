/**
 * Async module-customization hooks, loaded in a worker thread by
 * `module.register()` (see dev-ts-resolve.mjs). Exports the `resolve` hook that
 * remaps ".js" specifiers onto their ".ts" source — see dev-ts-resolve.mjs for
 * the rationale. Uses the async loader API (stable since Node 20) rather than
 * the synchronous `registerHooks` (Node 22.15+), so dev works on older 22.x.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
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
}
