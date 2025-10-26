import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pino from "pino";
import { z } from "zod";

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: { colorize: true }
  } : undefined
});

const app = express();

// Security middleware - helmet with Firebase-compatible CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.firebaseapp.com", "https://*.web.app"],
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS allowlist
const allowedOrigins = [
  "https://verumglobal.foundation",
  "https://verumdone.web.app",
  "https://gitverum.web.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, "CORS request from unauthorized origin");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Rate limiting - 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "rate_limit_exceeded", message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded");
    res.status(429).json({
      error: "rate_limit_exceeded",
      message: "Too many requests, please try again later"
    });
  }
});

app.use(limiter);

// Body parser with size limit
app.use(express.json({ limit: "5mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip
    }, "Request completed");
  });
  next();
});

// Error taxonomy
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class InternalError extends Error {
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalError";
    this.statusCode = 500;
  }
}

// Zod schemas for validation
const sha512Schema = z.string().regex(/^[a-f0-9]{128}$/i, "SHA-512 must be a 128-character hexadecimal string");

const verifySchema = z.object({
  sha512: sha512Schema,
  filename: z.string().optional(),
  mime: z.string().optional()
});

const sealSchema = z.object({
  sha512: sha512Schema,
  filename: z.string().optional(),
  title: z.string().optional()
});

const anchorSchema = z.object({
  sha512: sha512Schema,
  filename: z.string().optional()
});

// Health endpoint with detailed info
app.get("/health", (_req, res) => {
  const uptime = process.uptime();
  const env = process.env.NODE_ENV || "production";
  res.status(200).json({
    ok: true,
    status: "healthy",
    service: "verum-omnis-api",
    env,
    uptime: Math.floor(uptime),
    node: process.version,
    timestamp: new Date().toISOString()
  });
});

// Legacy /v1/health endpoint
app.get("/v1/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Utility function
function isSha512(s) { 
  return /^[a-f0-9]{128}$/i.test(s || ""); 
}

// Echo hash endpoint (for testing)
app.post("/echo-hash", (req, res) => {
  try {
    const { sha512 } = req.body || {};
    if (!sha512) throw new ValidationError("sha512 required");
    if (!isSha512(sha512)) throw new ValidationError("sha512 must be a 128-character hexadecimal string");
    res.json({ received: true, sha512 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message, details: error.details });
    }
    logger.error({ error }, "Error in echo-hash");
    res.status(500).json({ error: "Internal server error" });
  }
});

// V1 API endpoints with Zod validation
app.post("/v1/verify", (req, res) => {
  try {
    const validated = verifySchema.parse(req.body);
    logger.info({ sha512: validated.sha512 }, "Verify request");
    res.json({ 
      ok: true, 
      checked: true, 
      sha512: validated.sha512, 
      findings: [] 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.errors }, "Validation error in verify");
      return res.status(400).json({ 
        ok: false,
        error: "validation_error", 
        details: error.errors 
      });
    }
    logger.error({ error }, "Error in verify");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

app.post("/v1/seal", (req, res) => {
  try {
    const validated = sealSchema.parse(req.body);
    logger.info({ sha512: validated.sha512 }, "Seal request");
    // Placeholder PDF result (implement PDFKit+QR in follow-up PR)
    res.json({ 
      ok: true, 
      sealed: true, 
      sha512: validated.sha512, 
      filename: validated.filename || null, 
      pdf: "base64:TODO" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.errors }, "Validation error in seal");
      return res.status(400).json({ 
        ok: false,
        error: "validation_error", 
        details: error.errors 
      });
    }
    logger.error({ error }, "Error in seal");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

app.post("/v1/anchor", (req, res) => {
  try {
    const validated = anchorSchema.parse(req.body);
    logger.info({ sha512: validated.sha512 }, "Anchor request");
    // Placeholder receipt
    res.json({ 
      ok: true, 
      anchored: true, 
      sha512: validated.sha512, 
      tx: "0xMOCK",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ errors: error.errors }, "Validation error in anchor");
      return res.status(400).json({ 
        ok: false,
        error: "validation_error", 
        details: error.errors 
      });
    }
    logger.error({ error }, "Error in anchor");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// Legacy endpoints (no /v1/ prefix) for backward compatibility
app.post("/verify", (req, res) => {
  try {
    const { sha512 } = req.body || {};
    if (!isSha512(sha512)) throw new ValidationError("sha512 required (128 hex chars)");
    res.json({ ok: true, checked: true, sha512, findings: [] });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    logger.error({ error }, "Error in verify");
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/seal", (req, res) => {
  try {
    const { sha512, filename } = req.body || {};
    if (!isSha512(sha512)) throw new ValidationError("sha512 required (128 hex chars)");
    res.json({ ok: true, sealed: true, sha512, filename: filename || null, pdf: "base64:TODO" });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    logger.error({ error }, "Error in seal");
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/anchor", (req, res) => {
  try {
    const { sha512 } = req.body || {};
    if (!isSha512(sha512)) throw new ValidationError("sha512 required (128 hex chars)");
    res.json({ ok: true, anchored: true, sha512, tx: "0xMOCK" });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    logger.error({ error }, "Error in anchor");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  }, "Unhandled error");

  if (err.name === "ValidationError") {
    return res.status(err.statusCode || 400).json({
      error: err.message,
      details: err.details
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error"
  });
});

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
