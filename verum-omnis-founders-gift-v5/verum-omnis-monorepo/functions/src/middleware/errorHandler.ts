import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";

export class VoError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    public details?: unknown
  ) {
    super(code);
    this.name = "VoError";
  }
}

export function voError(code: string, httpStatus: number, details?: unknown): VoError {
  return new VoError(code, httpStatus, details);
}

export function errorHandler(logger: Logger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof VoError) {
      logger.error({
        code: err.code,
        status: err.httpStatus,
        details: err.details,
        path: req.path,
      }, "Application error");

      res.status(err.httpStatus).json({
        ok: false,
        error: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      });
    } else {
      logger.error({
        error: err.message,
        stack: err.stack,
        path: req.path,
      }, "Unexpected error");

      res.status(500).json({
        ok: false,
        error: "VO_E_INTERNAL",
        message: "Internal server error",
      });
    }
  };
}
