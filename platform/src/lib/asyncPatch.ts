import type { Router } from "express";

/**
 * Express 4 does not forward rejected promises from async handlers to the
 * error middleware - an uncaught rejection leaves the request hanging.
 * This patch wraps every route-level handler on a router so a rejection
 * calls next(err) and lands in the JSON error handler.
 * (Express 5 does this natively; drop the patch on upgrade.)
 */
export function withAsyncErrors(router: Router): Router {
  interface Layer {
    route?: { stack: Array<{ handle: (...args: unknown[]) => unknown }> };
  }
  const stack = (router as unknown as { stack: Layer[] }).stack;
  for (const layer of stack) {
    if (!layer.route) continue;
    for (const l of layer.route.stack) {
      const orig = l.handle;
      l.handle = (...args: unknown[]) => {
        const next = args[2] as (err?: unknown) => void;
        const out = orig(...args);
        if (out && typeof (out as Promise<unknown>).catch === "function") {
          (out as Promise<unknown>).catch(next);
        }
        return out;
      };
    }
  }
  return router;
}
