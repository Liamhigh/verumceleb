import type { Express } from "express";
import type { Logger } from "pino";
import { healthRouter } from "./health";
import { v1Router } from "./v1";
import { chatRouter } from "./chat";

export function setupRoutes(app: Express, logger: Logger) {
  // Health check
  app.use("/health", healthRouter(logger));
  
  // Chat endpoint
  app.use("/chat", chatRouter(logger));
  
  // V1 API routes
  app.use("/v1", v1Router(logger));
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      error: "VO_E_NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    });
  });
}
