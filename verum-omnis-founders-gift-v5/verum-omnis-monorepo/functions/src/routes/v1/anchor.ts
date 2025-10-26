import { Router } from "express";
import type { Logger } from "pino";
import { z } from "zod";
import { validateRequest, isSha512 } from "../../middleware/validation";
import { getEnv } from "../../config/env";

const anchorSchema = z.object({
  sha512: z.string().refine(isSha512, "sha512 must be a 128-character hexadecimal string").optional(),
  hash: z.string().optional(),
}).refine(data => data.sha512 || data.hash, {
  message: "Either sha512 or hash must be provided",
});

export function anchorRouter(logger: Logger) {
  const router = Router();

  router.post("/", validateRequest(anchorSchema), (req, res) => {
    const hash = req.body.sha512 || req.body.hash;
    const env = getEnv();
    
    logger.info({ hash: hash.substring(0, 16) + "..." }, "Anchor request");
    
    // If blockchain credentials are available, we would anchor here
    if (env.ANCHOR_RPC_URL && env.ANCHOR_PRIVATE_KEY) {
      // TODO: Implement actual blockchain anchoring
      res.json({
        ok: true,
        anchored: true,
        sha512: hash,
        tx: "0xTODO_ACTUAL_TX_HASH",
        status: "live",
      });
    } else {
      // Dry-run mode
      res.json({
        ok: true,
        anchored: true,
        sha512: hash,
        tx: "0xMOCK",
        status: "dry-run",
      });
    }
  });

  return router;
}
