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

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  message: {
    success: false,
    message: 'มีการร้องขอเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    error: 'Too many authentication requests',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    // Skip rate limiting in development for easier testing
    return config.server.nodeEnv === 'development';
  },
});

// Apply rate limiting to auth routes only
app.use('/api/auth', authLimiter);

// General rate limiting for all API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'มีการร้องขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    error: 'Too many requests',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    return config.server.nodeEnv === 'development';
  },
});

app.use('/api', generalLimiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ 
  limit: '10mb',
  type: 'application/json',
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));
app.use(cookieParser(config.cookie.secret));

// ============================================
// REQUEST LOGGING MIDDLEWARE (Development only)
// ============================================

if (config.server.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - User-Agent: ${userAgent}`);
    
    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      // Remove sensitive fields from logs
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
      if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
      if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
      
      console.log(`[${timestamp}] Request Body:`, JSON.stringify(sanitizedBody, null, 2));
    }
    
    next();
  });
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'Disease Report API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    timezone: config.constants.timezone,
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
// API ROOT ENDPOINT
// ============================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Disease Report System API',
    version: '1.0.0',
    documentation: '/api',
    health: '/health',
    timestamp: new Date().toISOString(),
    timezone: config.constants.timezone,
  });
});

// ============================================
// API ROUTES
// ============================================

// Mount API routes BEFORE error handlers
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler - Must be AFTER all routes but BEFORE error handler
app.use('*', notFoundHandler);

// Global Error Handler - Must be LAST middleware
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const startServer = (): void => {
  try {
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log(`
🚀 Disease Report API Server Started Successfully!
📍 Environment: ${config.server.nodeEnv}
🌐 URL: http://${config.server.host}:${config.server.port}
🏥 Health Check: http://${config.server.host}:${config.server.port}/health
📚 API Documentation: http://${config.server.host}:${config.server.port}/api
🕐 Timezone: ${config.constants.timezone}
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string): void => {
      console.log(`\n📡 Received ${signal}. Graceful shutdown initiated...`);
      
      server.close((err?: Error) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ HTTP server closed.');
        console.log('🔌 Database connections will be closed by Prisma.');
        console.log('👋 Graceful shutdown completed.');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;