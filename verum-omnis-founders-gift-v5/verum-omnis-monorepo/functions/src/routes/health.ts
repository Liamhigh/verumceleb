import { Router } from "express";
import type { Logger } from "pino";
import { getEnv } from "../config/env";

export function healthRouter(logger: Logger) {
  const router = Router();
  
  const startTime = Date.now();

  router.get("/", (req, res) => {
    const env = getEnv();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    res.status(200).json({
      ok: true,
      status: "healthy",
      service: "verum-omnis-api",
      env: env.FIREBASE_APP_ENV,
      uptime,
      versions: {
        node: process.version,
      },
    });
  });

  return router;
}
