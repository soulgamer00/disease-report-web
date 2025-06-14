// backend/src/middleware/sanitization.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// ============================================
// SANITIZATION TYPES AND INTERFACES
// ============================================

interface SanitizationOptions {
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableHTMLEscaping: boolean;
  enableScriptTagRemoval: boolean;
  maxStringLength: number;
  allowedTags: string[];
  logSuspiciousActivity: boolean;
}

interface SanitizationResult {
  value: unknown;
  wasModified: boolean;
  threats: string[];
}

// ============================================
// SANITIZATION CONFIGURATION
// ============================================

const defaultOptions: SanitizationOptions = {
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableHTMLEscaping: true,
  enableScriptTagRemoval: true,
  maxStringLength: 10000,
  allowedTags: [],
  logSuspiciousActivity: true,
};

// ============================================
// THREAT DETECTION PATTERNS
// ============================================

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  /onchange\s*=/gi,
  /onsubmit\s*=/gi,
  /<img[^>]+src[^>]*>/gi,
  /<link[^>]+href[^>]*>/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"].*?['"])/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bUNION\b.*\bSELECT\b)/gi,
  /(\b(CHAR|ASCII|SUBSTRING|LENGTH|MID|CONCAT)\s*\()/gi,
  /([\x00-\x08\x0B\x0C\x0E-\x1F\x7F])/g,
  /(['\\';|*%<>{}[\]^])/g,
];

const COMMAND_INJECTION_PATTERNS = [
  /(\||&|;|`|\$\(|\$\{)/g,
  /(wget|curl|nc|netcat|ping|nslookup|dig)/gi,
  /(cat|ls|pwd|whoami|id|uname)/gi,
  /(rm|mv|cp|chmod|chown)/gi,
  /(sudo|su|ssh|telnet|ftp)/gi,
];

const HTML_ENTITIES_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;',
};

// ============================================
// SANITIZATION UTILITY FUNCTIONS
// ============================================

const escapeHTML = (str: string): string => {
  return str.replace(/[&<>"'`=\/]/g, (char: string) => HTML_ENTITIES_MAP[char] || char);
};

const removeScriptTags = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
};

const removeEventHandlers = (str: string): string => {
  return str
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
};

const removeDangerousProtocols = (str: string): string => {
  return str
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/file:/gi, '');
};

const detectThreats = (str: string, options: SanitizationOptions): string[] => {
  const threats: string[] = [];

  if (options.enableXSSProtection) {
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(str)) {
        threats.push('XSS');
        break;
      }
    }
  }

  if (options.enableSQLInjectionProtection) {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(str)) {
        threats.push('SQL_INJECTION');
        break;
      }
    }
  }

  // Command injection detection
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(str)) {
      threats.push('COMMAND_INJECTION');
      break;
    }
  }

  // Check for suspicious patterns
  if (str.length > options.maxStringLength) {
    threats.push('OVERSIZED_INPUT');
  }

  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(str)) {
    threats.push('CONTROL_CHARACTERS');
  }

  return threats;
};

const sanitizeString = (
  str: string, 
  options: SanitizationOptions
): SanitizationResult => {
  const originalStr = str;
  let sanitizedStr = str;
  const threats = detectThreats(str, options);

  // Trim excessive length
  if (sanitizedStr.length > options.maxStringLength) {
    sanitizedStr = sanitizedStr.substring(0, options.maxStringLength);
  }

  // Remove control characters
  sanitizedStr = sanitizedStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove script tags
  if (options.enableScriptTagRemoval) {
    sanitizedStr = removeScriptTags(sanitizedStr);
    sanitizedStr = removeEventHandlers(sanitizedStr);
    sanitizedStr = removeDangerousProtocols(sanitizedStr);
  }

  // HTML escape
  if (options.enableHTMLEscaping) {
    sanitizedStr = escapeHTML(sanitizedStr);
  }

  // Normalize whitespace
  sanitizedStr = sanitizedStr.replace(/\s+/g, ' ').trim();

  return {
    value: sanitizedStr,
    wasModified: originalStr !== sanitizedStr,
    threats,
  };
};

const sanitizeValue = (
  value: unknown,
  options: SanitizationOptions,
  path: string = 'root'
): SanitizationResult => {
  let allThreats: string[] = [];
  let wasModified = false;

  const sanitizeRecursive = (val: unknown, currentPath: string): unknown => {
    if (val === null || val === undefined) {
      return val;
    }

    if (typeof val === 'string') {
      const result = sanitizeString(val, options);
      if (result.wasModified) wasModified = true;
      allThreats.push(...result.threats);
      return result.value;
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item, index) => 
        sanitizeRecursive(item, `${currentPath}[${index}]`)
      );
    }

    if (typeof val === 'object') {
      const sanitizedObj: Record<string, unknown> = {};
      
      for (const [key, objValue] of Object.entries(val as Record<string, unknown>)) {
        // Sanitize key name
        const keyResult = sanitizeString(key, options);
        if (keyResult.wasModified) wasModified = true;
        allThreats.push(...keyResult.threats);
        
        const sanitizedKey = keyResult.value as string;
        const newPath = `${currentPath}.${sanitizedKey}`;
        
        sanitizedObj[sanitizedKey] = sanitizeRecursive(objValue, newPath);
      }
      
      return sanitizedObj;
    }

    return val;
  };

  const sanitizedValue = sanitizeRecursive(value, path);

  return {
    value: sanitizedValue,
    wasModified,
    threats: [...new Set(allThreats)], // Remove duplicates
  };
};

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

export const sanitizeInput = (options: Partial<SanitizationOptions> = {}) => {
  const config: SanitizationOptions = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startTime = Date.now();
      let totalThreats: string[] = [];
      let hasModifications = false;

      // Sanitize request body
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyResult = sanitizeValue(req.body, config, 'body');
        req.body = bodyResult.value;
        
        if (bodyResult.wasModified) hasModifications = true;
        totalThreats.push(...bodyResult.threats);
      }

      // Sanitize query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        const queryResult = sanitizeValue(req.query, config, 'query');
        req.query = queryResult.value as Record<string, string | string[] | undefined>;
        
        if (queryResult.wasModified) hasModifications = true;
        totalThreats.push(...queryResult.threats);
      }

      // Sanitize URL parameters
      if (req.params && Object.keys(req.params).length > 0) {
        const paramsResult = sanitizeValue(req.params, config, 'params');
        req.params = paramsResult.value as Record<string, string>;
        
        if (paramsResult.wasModified) hasModifications = true;
        totalThreats.push(...paramsResult.threats);
      }

      // Remove duplicate threats
      const uniqueThreats = [...new Set(totalThreats)];
      const processingTime = Date.now() - startTime;

      // Log suspicious activity
      if (config.logSuspiciousActivity && uniqueThreats.length > 0) {
        await logger.security(
          `Potential security threats detected and sanitized`,
          req.ip,
          {
            threats: uniqueThreats,
            url: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent'),
            userId: (req as any).user?.id,
            hasModifications,
            processingTime,
          }
        );
      }

      // Log performance if sanitization took too long
      if (processingTime > 100) {
        await logger.performance(
          'Input sanitization took longer than expected',
          processingTime,
          {
            url: req.originalUrl,
            method: req.method,
            bodySize: req.body ? JSON.stringify(req.body).length : 0,
            queryParams: Object.keys(req.query || {}).length,
            threats: uniqueThreats,
          }
        );
      }

      next();
    } catch (error) {
      await logger.error(
        'Input sanitization middleware error',
        error as Error,
        {
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
        }
      );

      // Continue without sanitization rather than blocking the request
      next();
    }
  };
};

// ============================================
// SPECIALIZED SANITIZATION MIDDLEWARES
// ============================================

export const sanitizeForDatabase = sanitizeInput({
  enableSQLInjectionProtection: true,
  enableXSSProtection: true,
  enableHTMLEscaping: false, // Let Zod handle validation
  enableScriptTagRemoval: true,
  maxStringLength: 5000,
  logSuspiciousActivity: true,
});

export const sanitizeForAPI = sanitizeInput({
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableHTMLEscaping: true,
  enableScriptTagRemoval: true,
  maxStringLength: 10000,
  logSuspiciousActivity: true,
});

export const sanitizeForPublicAPI = sanitizeInput({
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableHTMLEscaping: true,
  enableScriptTagRemoval: true,
  maxStringLength: 1000,
  logSuspiciousActivity: true,
});

// ============================================
// UTILITY EXPORTS
// ============================================

export { 
  escapeHTML,
  removeScriptTags,
  removeEventHandlers,
  removeDangerousProtocols,
  detectThreats,
  sanitizeString,
  sanitizeValue,
};

export type { SanitizationOptions, SanitizationResult };