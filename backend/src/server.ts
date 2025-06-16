// backend/src/server.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Initialize Express app
const app = express();

// ============================================
// TRUST PROXY (for accurate IP addresses)
// ============================================
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Needed for some frontend tools
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors(config.cors));

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

// Auth rate limiter - stricter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: config.server.nodeEnv === 'development' ? 50 : config.security.rateLimitMax, // 50 in dev, 5 in prod
  message: {
    success: false,
    message: 'มีการร้องขอเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    error: 'Too many authentication requests',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development for easier testing
  skip: (req: Request): boolean => {
    if (config.server.nodeEnv === 'development' && req.ip === '127.0.0.1') {
      return true;
    }
    return false;
  },
});

// Apply rate limiting to auth routes only
app.use('/api/auth', authLimiter);

// General rate limiter - more lenient for general API usage
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.server.nodeEnv === 'development' ? 2000 : 1000, // Higher limit in dev
  message: {
    success: false,
    message: 'คำขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    error: 'Too many requests',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req: Request): boolean => {
    if (config.server.nodeEnv === 'development') {
      const ip = req.ip || '';
      return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
    }
    return false;
  },
});

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// ============================================
// PARSING MIDDLEWARE
// ============================================

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Cookie parser middleware
app.use(cookieParser(config.cookie.secret));

// ============================================
// REQUEST LOGGING MIDDLEWARE (Development only)
// ============================================

if (config.server.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
      const resetColor = '\x1b[0m';
      
      console.log(
        `${new Date().toISOString()} ` +
        `${req.method} ${req.originalUrl} ` +
        `${statusColor}${res.statusCode}${resetColor} ` +
        `${duration}ms ` +
        `${req.ip || 'unknown'}`
      );
    });
    
    next();
  });
}

// ============================================
// PARSING MIDDLEWARE
// ============================================

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Cookie parser middleware
app.use(cookieParser(config.cookie.secret));

// ============================================
// REQUEST LOGGING MIDDLEWARE (Development only)
// ============================================

if (config.server.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const resetColor = '\x1b[0m';
      
      console.log(
        `${new Date().toISOString()} ` +
        `${req.method} ${req.originalUrl} ` +
        `${statusColor}${res.statusCode}${resetColor} ` +
        `${duration}ms ` +
        `${req.ip || 'unknown'}`
      );
    });
    
    next();
  });
}

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Disease Report System API',
    version: '1.0.0',
    documentation: '/api',
    health: '/health',
    timestamp: new Date().toISOString(),
    timezone: config.constants?.timezone || 'Asia/Bangkok',
  });
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'Disease Report API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    timezone: config.constants?.timezone || 'Asia/Bangkok',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      unit: 'MB',
    },
    nodejs: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    server: {
      host: config.server.host,
      port: config.server.port,
    },
  };

  res.json(healthData);
});

// ============================================
// API ROUTES
// ============================================

// Mount API routes
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = config.server.port;
const HOST = config.server.host;

const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 Disease Report API Server Started Successfully!
📍 Environment: ${config.server.nodeEnv}
🌐 URL: http://${HOST}:${PORT}
🏥 Health Check: http://${HOST}:${PORT}/health
📚 API Documentation: http://${HOST}:${PORT}/api
🕐 Timezone: ${config.constants?.timezone || 'Asia/Bangkok'}
⏰ Started at: ${new Date().toISOString()}
  `);
  
  if (config.server.nodeEnv === 'development') {
    console.log('🔧 Development mode: Rate limiting relaxed');
    console.log('📊 Request logging enabled');
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⏰ Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;