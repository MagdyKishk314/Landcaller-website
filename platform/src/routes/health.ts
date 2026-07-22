import { Router } from "express";
import { dbHealthy } from "../db.js";

const router = Router();

const startedAt = Date.now();

router.get("/healthz", async (_req, res) => {
  res.json({
    ok: true,
    service: "landcaller-platform",
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    db: await dbHealthy(),
  });
});

export default router;
