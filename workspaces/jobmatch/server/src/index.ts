import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from './config/env.js';
import { queryOne } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Hardening: Disable Express signature header
app.disable('x-powered-by');

// Security Hardening: Defense-in-depth HTTP Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (ENV.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Security Hardening: Strict Origin CORS Policy
const allowedOrigins = [
  ENV.CLIENT_ORIGIN,
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5055'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (tools, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || (ENV.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 86400
  })
);

// Body parsers: Guard against DoS & memory exhaustion (OWASP A04)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static uploads with strict security headers (Prevent Stored XSS)
const uploadsStaticDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsStaticDir, {
  dotfiles: 'ignore',
  index: false,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  try {
    const dbCheck = queryOne<{ result: number }>('SELECT 1 as result');
    const dbStatus = dbCheck?.result === 1 ? 'CONNECTED (WAL Mode)' : 'DEGRADED';

    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Jobmatch REST API Backend',
      environment: ENV.NODE_ENV,
      database: dbStatus,
      port: ENV.PORT
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'DOWN',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mount Core Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route '${req.method} ${req.originalUrl}' not found.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export function startServer(port: number = ENV.PORT) {
  return app.listen(port, () => {
    console.log(`========================================================`);
    console.log(` 🚀 JOBMATCH BACKEND API RUNNING ON PORT ${port}`);
    console.log(` 🔐 JWT Authentication & RBAC Enabled`);
    console.log(` 💾 SQLite WAL Connection: ${ENV.DB_PATH}`);
    console.log(` 📁 Resumes Uploads Directory: ${ENV.UPLOAD_DIR}`);
    console.log(` ⚡ Health Check: http://localhost:${port}/api/health`);
    console.log(`========================================================`);
  });
}

// Auto-start server when run directly (prevent double startup during test runner execution)
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'));
if (process.env.AUTO_START !== 'false' && process.env.NODE_ENV !== 'test' && isDirectRun) {
  startServer(ENV.PORT);
}

export default app;
