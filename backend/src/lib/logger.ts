// backend/src/lib/logger.ts

import { config } from '../config';

// ============================================
// LOGGER TYPES AND INTERFACES
// ============================================

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface LoggerOptions {
  enableConsole: boolean;
  enableFile: boolean;
  logLevel: LogLevel;
  maxFileSize: string;
  maxFiles: string;
  logDir: string;
}

// ============================================
// LOGGER CONFIGURATION
// ============================================

const loggerConfig: LoggerOptions = {
  enableConsole: true,
  enableFile: config.server.nodeEnv === 'production',
  logLevel: config.server.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  maxFileSize: '20m',
  maxFiles: '14d',
  logDir: 'logs',
};

// ============================================
// COLOR CONFIGURATION FOR CONSOLE
// ============================================

const colors = {
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.INFO]: '\x1b[36m',  // Cyan
  [LogLevel.HTTP]: '\x1b[35m',  // Magenta
  [LogLevel.DEBUG]: '\x1b[37m', // White
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
};

// ============================================
// LOG LEVEL PRIORITY
// ============================================

const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.HTTP]: 3,
  [LogLevel.DEBUG]: 4,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriority[level] <= logLevelPriority[loggerConfig.logLevel];
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const sanitizeMetadata = (metadata: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...metadata };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'currentPassword', 
    'newPassword',
    'confirmPassword',
    'authorization',
    'cookie',
    'x-api-key',
  ];

  const sanitizeObject = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitizedObj: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          sanitizedObj[key] = '[REDACTED]';
        } else {
          sanitizedObj[key] = sanitizeObject(value);
        }
      }
      
      return sanitizedObj;
    }
    
    return obj;
  };

  return sanitizeObject(sanitized) as Record<string, unknown>;
};

const formatConsoleMessage = (entry: LogEntry): string => {
  const color = colors[entry.level];
  const reset = colors.reset;
  const bright = colors.bright;
  const dim = colors.dim;

  let message = `${color}${bright}[${entry.timestamp}]${reset} `;
  message += `${color}${entry.level.toUpperCase().padEnd(5)}${reset} `;
  message += `${bright}${entry.message}${reset}`;

  if (entry.method && entry.url) {
    message += ` ${dim}${entry.method} ${entry.url}${reset}`;
  }

  if (entry.statusCode) {
    const statusColor = entry.statusCode >= 400 ? colors[LogLevel.ERROR] : colors[LogLevel.INFO];
    message += ` ${statusColor}${entry.statusCode}${reset}`;
  }

  if (entry.responseTime) {
    message += ` ${dim}${entry.responseTime}ms${reset}`;
  }

  if (entry.userId) {
    message += ` ${dim}User: ${entry.userId}${reset}`;
  }

  if (entry.error) {
    message += `\n${colors[LogLevel.ERROR]}Error: ${entry.error.name} - ${entry.error.message}${reset}`;
    
    if (config.server.nodeEnv === 'development' && entry.error.stack) {
      message += `\n${dim}Stack: ${entry.error.stack}${reset}`;
    }
  }

  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    message += `\n${dim}Metadata: ${JSON.stringify(entry.metadata, null, 2)}${reset}`;
  }

  return message;
};

const formatFileMessage = (entry: LogEntry): string => {
  return JSON.stringify(entry);
};

// ============================================
// SIMPLE FILE LOGGING (without external dependencies)
// ============================================

const writeToFile = async (entry: LogEntry): Promise<void> => {
  if (!loggerConfig.enableFile) return;

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const logDir = loggerConfig.logDir;
    const fileName = `${entry.level}-${new Date().toISOString().split('T')[0]}.log`;
    const filePath = path.join(logDir, fileName);

    // Ensure log directory exists
    try {
      await fs.access(logDir);
    } catch {
      await fs.mkdir(logDir, { recursive: true });
    }

    const logMessage = formatFileMessage(entry) + '\n';
    await fs.appendFile(filePath, logMessage, 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

// ============================================
// CORE LOGGER CLASS
// ============================================

class Logger {
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: formatTimestamp(),
      metadata: metadata ? sanitizeMetadata(metadata) : undefined,
    };
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    if (!shouldLog(entry.level)) return;

    // Console logging
    if (loggerConfig.enableConsole) {
      console.log(formatConsoleMessage(entry));
    }

    // File logging
    if (loggerConfig.enableFile) {
      await writeToFile(entry);
    }
  }

  // ============================================
  // PUBLIC LOGGING METHODS
  // ============================================

  async error(message: string, error?: Error, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: config.server.nodeEnv === 'development' ? error.stack : undefined,
      };
    }

    await this.writeLog(entry);
  }

  async warn(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
    await this.writeLog(entry);
  }

  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    await this.writeLog(entry);
  }

  async http(
    message: string,
    method?: string,
    url?: string,
    statusCode?: number,
    responseTime?: number,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry = this.createLogEntry(LogLevel.HTTP, message, metadata);
    entry.method = method;
    entry.url = url;
    entry.statusCode = statusCode;
    entry.responseTime = responseTime;
    entry.userId = userId;
    entry.ip = ip;
    entry.userAgent = userAgent;

    await this.writeLog(entry);
  }

  async debug(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    await this.writeLog(entry);
  }

  // ============================================
  // SPECIALIZED LOGGING METHODS
  // ============================================

  async auth(message: string, userId?: string, success: boolean = true, metadata?: Record<string, unknown>): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const entry = this.createLogEntry(level, `[AUTH] ${message}`, metadata);
    entry.userId = userId;
    await this.writeLog(entry);
  }

  async database(message: string, operation?: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, `[DATABASE] ${message}`, {
      operation,
      ...metadata,
    });
    await this.writeLog(entry);
  }

  async security(message: string, ip?: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, `[SECURITY] ${message}`, metadata);
    entry.ip = ip;
    await this.writeLog(entry);
  }

  // ============================================
  // PERFORMANCE LOGGING
  // ============================================

  async performance(message: string, duration: number, metadata?: Record<string, unknown>): Promise<void> {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    const entry = this.createLogEntry(level, `[PERFORMANCE] ${message}`, {
      duration,
      unit: 'ms',
      ...metadata,
    });
    await this.writeLog(entry);
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const logger = new Logger();

// ============================================
// EXPRESS MIDDLEWARE FOR REQUEST LOGGING
// ============================================

export const requestLogger = (req: any, res: any, next: any): void => {
  const startTime = Date.now();

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): void {
    const responseTime = Date.now() - startTime;
    
    logger.http(
      'HTTP Request',
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime,
      req.user?.id,
      req.ip,
      req.get('User-Agent'),
      {
        query: req.query,
        params: req.params,
        bodySize: req.body ? JSON.stringify(req.body).length : 0,
      }
    );

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default logger;