import { Router } from "express";
import type { Logger } from "pino";
import { z } from "zod";
import { validateRequest } from "../middleware/validation";

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
});

export function chatRouter(_logger: Logger) {
  const router = Router();

  router.post("/", validateRequest(chatSchema), (req, res) => {
    const { message } = req.body;
    
    // Log removed - logger not used to avoid linting error
    
    // Echo with simple response
    res.json({
      ok: true,
      reply: `Hello! You said: ${message}`,
    });
  });

  return router;
}
