import type { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { voError } from "./errorHandler";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw voError("VO_E_INPUT", 400, { errors: err.errors });
      }
      next(err);
    }
  };
}

export function isSha512(s: string): boolean {
  return /^[a-f0-9]{128}$/i.test(s || "");
}
