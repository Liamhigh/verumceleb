import { Router } from "express";
import type { Logger } from "pino";
import { z } from "zod";
import { validateRequest, isSha512 } from "../../middleware/validation";
import { voError } from "../../middleware/errorHandler";

const verifySchema = z.object({
  sha512: z.string().refine(isSha512, "sha512 must be a 128-character hexadecimal string"),
});

export function verifyRouter(logger: Logger) {
  const router = Router();

  // GET endpoint that returns basic verification info
  router.get("/", (req, res) => {
    res.json({
      ok: true,
    });
  });

  // POST endpoint for actual verification
  router.post("/", validateRequest(verifySchema), (req, res) => {
    const { sha512 } = req.body;
    
    logger.info({ sha512: sha512.substring(0, 16) + "..." }, "Verify request");
    
    // Basic verification response
    // TODO: Implement triple-consensus verification
    res.json({
      ok: true,
      checked: true,
      sha512,
      findings: [],
      verdict: "ok",
    });
  });

  return router;
}
