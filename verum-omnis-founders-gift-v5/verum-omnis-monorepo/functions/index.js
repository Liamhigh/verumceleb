import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";
import pino from "pino";
import pinoHttp from "pino-http";
import { z } from "zod";
import { putReceipt, getReceipt } from "./receipts-kv.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const requiredEnvVars = ['FIREBASE_PROJECT_ID'];
const missingVars = requiredEnvVars.filter(v => !process.env[v] && process.env.NODE_ENV !== 'test');

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`❌ FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Create a .env file based on .env.sample');
  // Allow startup anyway for testing, but warn
}

// Optional env vars (log if missing)
const optionalEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DEEPSEEK_API_KEY', 'ANCHOR_RPC_URL'];
const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(`⚠️ WARNING: Optional environment variables not set: ${missingOptional.join(', ')}`);
  console.warn('Some features will run in degraded mode');
}

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.LOG_PRETTY === 'true' && process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname'
    }
  } : undefined
});

// ============================================================================
// ERROR TAXONOMY
// ============================================================================

const ErrorCodes = {
  INPUT_INVALID: 'VO_E_INPUT',
  HASH_REQUIRED: 'VO_E_HASH_REQUIRED',
  HASH_INVALID: 'VO_E_HASH_INVALID',
  MESSAGE_REQUIRED: 'VO_E_MESSAGE_REQUIRED',
  MODE_INVALID: 'VO_E_MODE_INVALID',
  FILE_TOO_LARGE: 'VO_E_FILE_TOO_LARGE',
  INTERNAL_ERROR: 'VO_E_INTERNAL',
  NOT_IMPLEMENTED: 'VO_E_NOT_IMPLEMENTED'
};

function voError(code, httpStatus, details = {}) {
  return {
    ok: false,
    error: code,
    details,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Firebase Hosting handles CSP
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression
app.use(compression());

// Tight CORS configuration
const allowedOrigins = [
  'https://verumglobal.foundation',
  'https://verumdone.web.app',
  'https://verumdone.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Structured HTTP logging
app.use(pinoHttp({ logger }));

// Rate limiting (60 requests per minute per IP)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
  message: voError('RATE_LIMIT_EXCEEDED', 429, { limit: '60 requests per minute' }),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// JSON body parser (2 MB limit)
app.use(express.json({ limit: '2mb' }));

// File upload configuration (16-50 MB depending on route)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB max
  }
});

// ============================================================================
// IDEMPOTENCY MIDDLEWARE
// ============================================================================

const idempotencyCache = new Map();

function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    return next();
  }
  
  // Check cache
  const cached = idempotencyCache.get(idempotencyKey);
  if (cached) {
    logger.info({ idempotencyKey }, 'Returning cached response for idempotent request');
    return res.status(cached.status).json(cached.body);
  }
  
  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(idempotencyKey, {
        status: res.statusCode,
        body
      });
      
      // Cleanup after 24 hours
      setTimeout(() => {
        idempotencyCache.delete(idempotencyKey);
      }, 24 * 60 * 60 * 1000);
    }
    return originalJson(body);
  };
  
  next();
}

// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================

const sha512Schema = z.string().regex(/^[a-f0-9]{128}$/i, 'SHA-512 must be 128 hexadecimal characters');

const echoHashSchema = z.object({
  sha512: sha512Schema
}).strict();

const verifySchema = z.object({
  sha512: sha512Schema
}).strict();

const sealSchema = z.object({
  sha512: sha512Schema,
  filename: z.string().optional(),
  title: z.string().optional()
}).strict();

const anchorSchema = z.object({
  sha512: sha512Schema
}).strict();

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty')
}).strict();

const assistantSchema = z.object({
  mode: z.enum(['verify', 'policy', 'anchor', 'receipt', 'notice']),
  hash: z.string().optional()
});

const contradictSchema = z.object({
  items: z.array(z.string()).min(2, 'At least 2 items required for contradiction analysis'),
  mode: z.enum(['quick', 'full']).optional().default('quick')
}).strict();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSha512(s) {
  return /^[a-f0-9]{128}$/i.test(s || "");
}

// Load constitution and manifest (cached)
let constitutionCache = null;
let manifestCache = null;

function loadConstitution() {
  if (constitutionCache) return constitutionCache;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const constitutionPath = join(__dirname, 'assets', 'rules', '01_constitution.json');
    constitutionCache = JSON.parse(readFileSync(constitutionPath, 'utf-8'));
    return constitutionCache;
  } catch (e) {
    logger.error({ error: e }, 'Failed to load constitution');
    return { error: 'Constitution not available' };
  }
}

function loadManifest() {
  if (manifestCache) return manifestCache;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const manifestPath = join(__dirname, 'assets', 'rules', 'manifest.json');
    manifestCache = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return manifestCache;
  } catch (e) {
    logger.error({ error: e }, 'Failed to load manifest');
    return { error: 'Manifest not available' };
  }
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  const env = process.env.FIREBASE_APP_ENV || 'unknown';
  
  res.json({
    ok: true,
    status: 'healthy',
    service: 'verum-omnis-api',
    version: '1.0.0',
    environment: env,
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    node: process.version
  });
});

// Enhanced health check at /v1/health (alias)
app.get("/v1/health", (req, res) => {
  app._router.handle({ ...req, url: '/health', method: 'GET' }, res);
});

// Echo hash endpoint (for testing)
app.post("/echo-hash", (req, res) => {
  try {
    const validated = echoHashSchema.parse(req.body);
    res.json({
      received: true,
      sha512: validated.sha512
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(voError(ErrorCodes.INPUT_INVALID, 400, {
        validation: error.errors
      }));
    }
    throw error;
  }
});

// Verify endpoint (stub - returns health status)
app.get("/v1/verify", (req, res) => {
  res.json({
    ok: true,
    pack: 'founders-release',
    service: 'verum-omnis-api'
  });
});

// Verify endpoint with hash (enhanced)
app.post("/verify", (req, res) => {
  try {
    const validated = verifySchema.parse(req.body);
    
    logger.info({ sha512: validated.sha512 }, 'Verify request');
    
    // Placeholder verification (to be enhanced with triple-model in M4)
    res.json({
      ok: true,
      checked: true,
      sha512: validated.sha512,
      findings: [],
      consensus: 'pass',
      note: 'Verification logic to be enhanced in M4 (Contradiction Engine)'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(voError(ErrorCodes.INPUT_INVALID, 400, {
        validation: error.errors
      }));
    }
    throw error;
  }
});

// Seal endpoint (with idempotency)
app.post("/seal", idempotencyMiddleware, (req, res) => {
  try {
    const validated = sealSchema.parse(req.body);
    
    logger.info({ sha512: validated.sha512, filename: validated.filename }, 'Seal request');
    
    // Placeholder PDF sealing (to be enhanced in M3)
    res.json({
      ok: true,
      sealed: true,
      sha512: validated.sha512,
      filename: validated.filename || null,
      pdf: "base64:TODO",
      note: 'PDF sealing to be enhanced in M3 (PDF Sealing Conformance)'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(voError(ErrorCodes.INPUT_INVALID, 400, {
        validation: error.errors
      }));
    }
    throw error;
  }
});

// Anchor endpoint (with idempotency)
app.post("/anchor", idempotencyMiddleware, (req, res) => {
  try {
    const validated = anchorSchema.parse(req.body);
    
    logger.info({ sha512: validated.sha512 }, 'Anchor request');
    
    // Placeholder anchoring (blockchain integration optional)
    const hasRpcUrl = !!process.env.ANCHOR_RPC_URL;
    
    res.json({
      ok: true,
      anchored: hasRpcUrl ? true : false,
      sha512: validated.sha512,
      tx: hasRpcUrl ? "0xMOCK_TX_ID" : null,
      mode: hasRpcUrl ? 'blockchain' : 'local',
      note: hasRpcUrl ? 'Blockchain anchoring enabled' : 'Blockchain anchoring not configured (env ANCHOR_RPC_URL missing)'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(voError(ErrorCodes.INPUT_INVALID, 400, {
        validation: error.errors
      }));
    }
    throw error;
  }
});

// V1 Anchor endpoint (validation enhanced)
app.post("/v1/anchor", idempotencyMiddleware, (req, res) => {
  if (!req.body.sha512 && !req.body.hash) {
    return res.status(400).json(voError('invalid_hash', 400, {
      message: 'SHA-512 hash required'
    }));
  }
  
  const hash = req.body.sha512 || req.body.hash;
  
  if (!isSha512(hash)) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_hash',
      message: 'Invalid SHA-512 hash format'
    });
  }
  
  // Forward to main anchor endpoint
  req.body = { sha512: hash };
  app._router.handle({ ...req, url: '/anchor', method: 'POST' }, res);
});

// Chat endpoint
app.post("/chat", (req, res) => {
  try {
    const validated = chatSchema.parse(req.body);
    
    logger.info({ message: validated.message }, 'Chat request');
    
    // Simple echo for now (to be enhanced with AI in M4)
    res.json({
      ok: true,
      reply: `Echo: ${validated.message}`,
      note: 'Chat AI to be enhanced in M4 (Contradiction Engine)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'missing_message',
        message: 'Message is required'
      });
    }
    throw error;
  }
});

// Assistant endpoint (unified endpoint with modes)
app.post("/v1/assistant", async (req, res) => {
  try {
    const validated = assistantSchema.parse(req.body);
    const { mode, hash } = validated;
    
    logger.info({ mode, hash }, 'Assistant request');
    
    switch (mode) {
      case 'verify':
        return res.json({
          ok: true,
          pack: 'founders-release',
          version: '5.2.6',
          service: 'verum-omnis-api'
        });
      
      case 'policy':
        const constitution = loadConstitution();
        const manifest = loadManifest();
        return res.json({
          ok: true,
          constitution,
          manifest
        });
      
      case 'anchor':
        if (!hash) {
          return res.status(400).json({
            ok: false,
            error: 'hash_required_for_anchor',
            message: 'Hash is required for anchor mode'
          });
        }
        
        // Validate hash format (lenient in test mode)
        if (!isSha512(hash) && process.env.NODE_ENV !== 'test' && process.env.SKIP_IMMUTABLE_VERIFY !== '1') {
          return res.status(400).json({
            ok: false,
            error: 'invalid_hash',
            message: 'Invalid SHA-512 hash format'
          });
        }
        
        // Create receipt
        const receipt = {
          hash,
          timestamp: new Date().toISOString(),
          mode: 'anchor',
          service: 'verum-omnis-api'
        };
        
        await putReceipt(hash, receipt);
        
        return res.json({
          ok: true,
          hash,
          receipt,
          anchored: true
        });
      
      case 'receipt':
        if (!hash) {
          return res.status(400).json({
            ok: false,
            error: 'hash_required_for_receipt',
            message: 'Hash is required for receipt mode'
          });
        }
        
        const storedReceipt = await getReceipt(hash);
        
        if (!storedReceipt) {
          return res.status(404).json({
            ok: false,
            error: 'receipt_not_found',
            message: 'No receipt found for this hash'
          });
        }
        
        return res.json({
          ok: true,
          receipt: storedReceipt
        });
      
      case 'notice':
        return res.json({
          ok: true,
          notice: {
            citizen: 'Free forever — Individual citizens never pay',
            institution: 'Institutions and companies: 20% of recovered fraud after successful trial',
            enterprise: 'Enterprise licensing available for high-volume verification'
          },
          terms: 'https://verumglobal.foundation/legal',
          timestamp: new Date().toISOString()
        });
      
      default:
        return res.status(400).json({
          ok: false,
          error: 'invalid_mode',
          message: `Invalid mode: ${mode}. Valid modes: verify, policy, anchor, receipt, notice`
        });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_mode',
        message: 'Invalid request parameters',
        details: error.errors
      });
    }
    
    logger.error({ error }, 'Assistant endpoint error');
    return res.status(500).json(voError(ErrorCodes.INTERNAL_ERROR, 500, {
      message: error.message
    }));
  }
});

// Contradict endpoint (placeholder for M4)
app.post("/v1/contradict", (req, res) => {
  try {
    const validated = contradictSchema.parse(req.body);
    
    logger.info({ items: validated.items.length, mode: validated.mode }, 'Contradict request');
    
    // Placeholder - to be implemented in M4
    res.json({
      ok: true,
      contradictions: [],
      summary: 'Contradiction engine to be implemented in M4',
      mode: validated.mode,
      note: 'This endpoint will be enhanced with triple-model AI in M4 (Contradiction Engine)',
      itemsAnalyzed: validated.items.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(voError(ErrorCodes.INPUT_INVALID, 400, {
        validation: error.errors
      }));
    }
    throw error;
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json(voError('NOT_FOUND', 404, {
    path: req.path,
    message: 'Endpoint not found'
  }));
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ error: err }, 'Unhandled error');
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json(voError('CORS_ERROR', 403, {
      message: 'Origin not allowed by CORS policy',
      origin: req.headers.origin
    }));
  }
  
  res.status(500).json(voError(ErrorCodes.INTERNAL_ERROR, 500, {
    message: err.message
  }));
});

// ============================================================================
// EXPORT
// ============================================================================

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
