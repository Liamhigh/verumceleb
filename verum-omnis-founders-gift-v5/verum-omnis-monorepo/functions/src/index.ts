import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Compression
app.use(compression());

// CORS with tight configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://gitverum.web.app', 'https://verumdone.web.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

app.use(express.json({ limit: "5mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { ok: false, error: 'too_many_requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Idempotency tracking for seal and anchor
const idempotencyStore = new Map<string, { timestamp: number; response: unknown }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old idempotency keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (now - value.timestamp > IDEMPOTENCY_TTL) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Idempotency middleware
function idempotent(req: Request, res: Response, next: NextFunction): void {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (idempotencyKey) {
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached) {
      res.json(cached.response);
      return;
    }
  }
  
  next();
}

// Validation schemas
const sha512Schema = z.string().regex(/^[a-f0-9]{128}$/i, "sha512 must be a 128-character hexadecimal string");

const echoHashSchema = z.object({
  sha512: sha512Schema,
});

const verifySchema = z.object({
  sha512: sha512Schema,
});

const sealSchema = z.object({
  sha512: sha512Schema,
  filename: z.string().optional(),
});

const anchorSchema = z.object({
  sha512: sha512Schema,
});

const chatSchema = z.object({
  message: z.string().min(1),
});

const assistantSchema = z.object({
  mode: z.enum(['verify', 'policy', 'anchor', 'receipt', 'notice']),
  hash: z.string().optional(),
});

// Helper function to validate SHA-512
function isSha512(s: string | undefined): boolean {
  return /^[a-f0-9]{128}$/i.test(s || "");
}

// Health endpoint with proper JSON response
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    service: "verum-omnis-api",
    timestamp: new Date().toISOString(),
  });
});

// V1 Health endpoint
app.get("/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    service: "verum-omnis-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Echo hash endpoint
app.post("/echo-hash", (req: Request, res: Response) => {
  try {
    const { sha512 } = echoHashSchema.parse(req.body);
    return res.json({ received: true, sha512 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: "validation_error", 
        details: error.errors 
      });
    }
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }
});

// Chat endpoint
app.post("/chat", (req: Request, res: Response) => {
  try {
    const { message } = chatSchema.parse(req.body);
    return res.json({ 
      ok: true, 
      reply: `Echo: ${message}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: "missing_message",
      });
    }
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }
});

// V1 Verify endpoint
app.get("/v1/verify", (_req: Request, res: Response) => {
  return res.json({ 
    ok: true,
    service: "verum-omnis-verify",
    version: "1.0.0",
  });
});

// Verify endpoint
app.post("/verify", (req: Request, res: Response) => {
  try {
    const { sha512 } = verifySchema.parse(req.body);
    return res.json({ 
      ok: true, 
      checked: true, 
      sha512, 
      findings: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: "sha512 required (128 hex chars)",
      });
    }
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }
});

// Seal endpoint with idempotency
app.post("/seal", idempotent, (req: Request, res: Response) => {
  try {
    const { sha512, filename } = sealSchema.parse(req.body);
    
    const response = { 
      ok: true, 
      sealed: true, 
      sha512, 
      filename: filename || null, 
      pdf: "base64:TODO",
      timestamp: new Date().toISOString(),
    };
    
    // Store for idempotency
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, {
        timestamp: Date.now(),
        response,
      });
    }
    
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: "sha512 required (128 hex chars)",
      });
    }
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }
});

// Anchor endpoint with idempotency
app.post("/anchor", idempotent, (req: Request, res: Response) => {
  try {
    const { sha512 } = anchorSchema.parse(req.body);
    
    const response = { 
      ok: true, 
      anchored: true, 
      sha512, 
      tx: "0xMOCK",
      timestamp: new Date().toISOString(),
    };
    
    // Store for idempotency
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, {
        timestamp: Date.now(),
        response,
      });
    }
    
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: "sha512 required (128 hex chars)",
      });
    }
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }
});

// V1 Anchor endpoint
app.post("/v1/anchor", idempotent, (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const hash = req.body.hash as string | undefined;
  
  if (!hash || !isSha512(hash)) {
    return res.status(400).json({ 
      ok: false, 
      error: "invalid_hash",
    });
  }
  
  const response = { 
    ok: true, 
    anchored: true, 
    hash, 
    tx: "0xMOCK",
    timestamp: new Date().toISOString(),
  };
  
  // Store for idempotency
  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, {
      timestamp: Date.now(),
      response,
    });
  }
  
  return res.json(response);
});

// Receipt storage
const receiptStore = new Map<string, unknown>();

// V1 Assistant endpoint
app.post("/v1/assistant", (req: Request, res: Response) => {
  try {
    const { mode, hash } = assistantSchema.parse(req.body);
    
    switch (mode) {
      case 'verify':
        return res.json({
          ok: true,
          pack: 'founders-release',
          timestamp: new Date().toISOString(),
        });
        
      case 'policy':
        return res.json({
          ok: true,
          constitution: {
            principles: ['Truth', 'Transparency', 'Accountability'],
            mission: 'Verify the whole truth',
          },
          manifest: {
            version: '1.0.0',
            features: ['verify', 'seal', 'anchor'],
          },
          timestamp: new Date().toISOString(),
        });
        
      case 'anchor': {
        if (!hash) {
          return res.status(400).json({
            ok: false,
            error: 'hash_required_for_anchor',
          });
        }
        
        const anchorReceipt = {
          ok: true,
          hash,
          tx: '0xMOCK',
          timestamp: new Date().toISOString(),
        };
        
        receiptStore.set(hash, anchorReceipt);
        
        return res.json(anchorReceipt);
      }
        
      case 'receipt': {
        if (!hash) {
          return res.status(400).json({
            ok: false,
            error: 'hash_required_for_receipt',
          });
        }
        
        const receipt = receiptStore.get(hash);
        if (!receipt) {
          return res.status(404).json({
            ok: false,
            error: 'receipt_not_found',
          });
        }
        
        return res.json({
          ok: true,
          receipt,
          timestamp: new Date().toISOString(),
        });
      }
        
      case 'notice':
        return res.json({
          ok: true,
          notice: {
            citizen: 'Free forever for individuals',
            institution: '20% of recovered fraud after trial',
          },
          timestamp: new Date().toISOString(),
        });
        
      default:
        return res.status(400).json({
          ok: false,
          error: 'invalid_mode',
        });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_mode',
      });
    }
    return res.status(400).json({ ok: false, error: 'invalid_request' });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    ok: false, 
    error: 'not_found',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    ok: false, 
    error: 'internal_server_error',
  });
});

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
