import { Router } from "express";
import type { Logger } from "pino";
import { z } from "zod";
import { validateRequest } from "../../middleware/validation";
import { voError } from "../../middleware/errorHandler";

// In-memory receipt storage (same as original receipts-kv.js)
const receipts = new Map<string, any>();

const assistantSchema = z.object({
  mode: z.enum(["verify", "policy", "anchor", "receipt", "notice", "seal"]).optional(),
  hash: z.string().optional(),
  message: z.string().optional(),
});

export function assistantRouter(logger: Logger) {
  const router = Router();

  router.post("/", validateRequest(assistantSchema), (req, res) => {
    const { mode, hash, message } = req.body;
    
    if (!mode) {
      throw voError("invalid_mode", 400, { message: "mode is required" });
    }

    logger.info({ mode, hasHash: !!hash }, "Assistant request");

    switch (mode) {
      case "verify":
        res.json({
          ok: true,
          pack: "founders-release",
        });
        break;

      case "policy":
        res.json({
          ok: true,
          constitution: "Constitutional AI principles apply",
          manifest: {
            version: "1.0.0",
            principles: ["Truth", "Accuracy", "Transparency"],
          },
        });
        break;

      case "anchor":
        if (!hash) {
          throw voError("hash_required_for_anchor", 400);
        }
        
        // Store receipt
        const receipt = {
          hash,
          timestamp: new Date().toISOString(),
          tx: "0xMOCK",
        };
        receipts.set(hash, receipt);
        
        res.json({
          ok: true,
          hash,
          receipt,
        });
        break;

      case "receipt":
        if (!hash) {
          throw voError("hash_required_for_receipt", 400);
        }
        
        const storedReceipt = receipts.get(hash);
        if (!storedReceipt) {
          throw voError("receipt_not_found", 404);
        }
        
        res.json({
          ok: true,
          receipt: storedReceipt,
        });
        break;

      case "notice":
        res.json({
          ok: true,
          notice: {
            citizen: "Free forever for individual citizens",
            institution: "Institutions and companies pay 20% of recovered fraud amount after successful trial",
          },
        });
        break;

      case "seal":
        res.json({
          ok: true,
          sealed: true,
          message: "Seal functionality available via /v1/seal endpoint",
        });
        break;

      default:
        throw voError("invalid_mode", 400, { mode });
    }
  });

  return router;
}
