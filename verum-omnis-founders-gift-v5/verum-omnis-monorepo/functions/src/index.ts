import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pino from "pino";
import { validateEnv } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { setupRoutes } from "./routes";

// Initialize logger
const logger = pino({
  level: process.env.FIREBASE_APP_ENV === "prod" ? "info" : "debug",
  transport:
    process.env.FIREBASE_APP_ENV !== "prod"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

// Validate environment on startup
validateEnv(logger);

const app = express();

// Security middleware
// Note: contentSecurityPolicy is disabled here because CSP is managed
// by Firebase Hosting (see firebase.json headers configuration)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Managed by Firebase Hosting
  })
);

app.use(compression());

// CORS configuration
const allowedOrigins = [
  "https://verumglobal.foundation",
  "https://gitverum.web.app",
  "https://verumdone.web.app",
  /^https:\/\/.*\.web\.app$/,
  /^https:\/\/.*\.firebaseapp\.com$/,
];

if (process.env.NODE_ENV !== "prod") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === "string" ? allowed === origin : allowed.test(origin)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS rejected origin");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsing with limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip }, "Rate limit exceeded");
    res.status(429).json({
      ok: false,
      error: "VO_E_RATE_LIMIT",
      message: "Too many requests, please try again later",
    });
  },
});

app.use(limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });
  next();
});

// Setup all routes
setupRoutes(app, logger);

// Error handler (must be last)
app.use(errorHandler(logger));

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
