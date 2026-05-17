// Security utilities for production-grade ecommerce application

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

// Role definitions
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
};

// Role permissions hierarchy
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    "*", // All permissions
  ],
  [ROLES.ADMIN]: [
    "dashboard:view",
    "orders:view",
    "orders:manage",
    "products:view",
    "products:manage",
    "categories:view",
    "categories:manage",
    "customers:view",
    "analytics:view",
    "reviews:view",
    "reviews:manage",
    "settings:view",
    "media:manage",
  ],
  [ROLES.STAFF]: [
    "dashboard:view",
    "orders:view",
    "products:view",
    "customers:view",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !PERMISSIONS[role]) return false;
  const rolePerms = PERMISSIONS[role];
  return rolePerms.includes("*") || rolePerms.includes(permission);
}

/**
 * Enhanced JWT token signing with shorter expiry for production
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h", // Short-lived access token
    issuer: "sabir-shah-traders",
    audience: "admin-panel",
  });
}

/**
 * Sign refresh token for session management
 */
export function signRefreshToken(payload) {
  return jwt.sign(
    { ...payload, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "sabir-shah-traders",
      audience: "admin-panel",
    }
  );
}

/**
 * Verify token with enhanced checks
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "sabir-shah-traders",
      audience: "admin-panel",
    });
  } catch (err) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        issuer: "sabir-shah-traders",
        audience: "admin-panel",
      }
    );
  } catch (err) {
    return null;
  }
}

/**
 * Set secure authentication cookies
 */
export function setAuthCookies(res, accessToken, refreshToken, sessionTimeoutMinutes = 60) {
  const isProduction = process.env.NODE_ENV === "production";

  // Access token cookie - dynamic lifetime based on Security Settings
  res.cookies.set("admin_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
    maxAge: 60 * sessionTimeoutMinutes, // Session Timeout in seconds (minutes * 60)
  });

  // Refresh token cookie - longer lived
  if (refreshToken) {
    res.cookies.set("admin_refresh", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return res;
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(res) {
  res.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("admin_refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return res;
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(req) {
  try {
    let token = req.cookies.get("admin_token")?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    if (!token) return null;

    const decoded = verifyAccessToken(token);
    if (!decoded) return null;

    return {
      username: decoded.username,
      role: decoded.role || ROLES.ADMIN,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Require authentication middleware helper
 */
export async function requireAuth(req, requiredRole = null) {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      error: "Unauthorized",
      status: 401,
    };
  }

  if (requiredRole && user.role !== requiredRole && user.role !== ROLES.SUPER_ADMIN) {
    return {
      error: "Forbidden: Insufficient permissions",
      status: 403,
    };
  }

  return { user };
}

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  name: /^[\p{L}\s'-]{2,100}$/u,
  username: /^[a-zA-Z0-9_-]{3,32}$/,
  postal: /^[0-9\-\s]{3,10}$/,
  orderId: /^#[0-9]{4,}$/,
};

/**
 * Sanitize string input to prevent XSS using sanitize-html
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return sanitizeHtml(input.trim(), {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {},
  });
}

/**
 * Validate and sanitize form data
 */
export function validateAndSanitize(data, schema) {
  const errors = [];
  const sanitized = {};

  for (const [key, rules] of Object.entries(schema)) {
    let value = data[key];

    // Check required
    if (rules.required && (!value || value.toString().trim() === "")) {
      errors.push(`${key} is required`);
      continue;
    }

    if (!value) {
      sanitized[key] = rules.default || null;
      continue;
    }

    // Sanitize
    value = sanitizeInput(value);

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.errorMessage || `${key} is invalid`);
      continue;
    }

    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${key} must be at least ${rules.minLength} characters`);
      continue;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${key} must be no more than ${rules.maxLength} characters`);
      continue;
    }

    // Type validation
    if (rules.type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${key} must be a number`);
        continue;
      }
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
        continue;
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`${key} must be no more than ${rules.max}`);
        continue;
      }
      sanitized[key] = num;
      continue;
    }

    if (rules.type === "email") {
      if (!VALIDATION_PATTERNS.email.test(value)) {
        errors.push(`${key} must be a valid email`);
        continue;
      }
    }

    if (rules.type === "phone") {
      if (!VALIDATION_PATTERNS.phone.test(value)) {
        errors.push(`${key} must be a valid phone number`);
        continue;
      }
    }

    sanitized[key] = value;
  }

  return { errors, sanitized };
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self' https:;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Rate limiting store (in-memory, replace with Redis for production)
 */
const rateLimitStore = new Map();

/**
 * Simple rate limiter
 */
export function rateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { requests: [], blocked: false, blockedUntil: 0 };
    rateLimitStore.set(identifier, entry);
  }

  // Clean old requests
  entry.requests = entry.requests.filter((time) => time > windowStart);

  // Check if blocked
  if (entry.blocked && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Reset block if expired
  if (entry.blocked && now >= entry.blockedUntil) {
    entry.blocked = false;
    entry.requests = [];
  }

  // Check rate limit
  if (entry.requests.length >= maxRequests) {
    entry.blocked = true;
    entry.blockedUntil = now + windowMs;
    return {
      allowed: false,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  // Allow request
  entry.requests.push(now);
  return { allowed: true, remaining: maxRequests - entry.requests.length };
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * File upload validation
 */
export function validateFileUpload(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }

  // Check extension
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(ext)) {
    errors.push(`Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`);
  }

  // Check for double extensions (security)
  if (file.name.split(".").length > 2) {
    errors.push("Invalid filename: multiple extensions detected");
  }

  // Check for null bytes
  if (file.name.includes("\0")) {
    errors.push("Invalid filename: contains null bytes");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Activity log structure (for admin actions)
 */
export function createActivityLogEntry({
  action,
  user,
  resource,
  resourceId,
  details = {},
  ip,
  userAgent,
}) {
  return {
    timestamp: new Date().toISOString(),
    action, // e.g., "order:update", "product:create", "login"
    user: user?.username || "anonymous",
    role: user?.role || "unknown",
    resource, // e.g., "order", "product", "user"
    resourceId,
    details,
    ip: ip || "unknown",
    userAgent: userAgent || "unknown",
  };
}

/**
 * Safe error response helper - prevents information leakage
 */
export function safeErrorResponse(error, isDev = false) {
  if (isDev) {
    return {
      error: error.message,
      stack: error.stack,
    };
  }

  // Production: generic error messages
  const errorMap = {
    ValidationError: "Invalid input provided",
    UnauthorizedError: "Authentication required",
    ForbiddenError: "Access denied",
    NotFoundError: "Resource not found",
    ConflictError: "Resource conflict",
    RateLimitError: "Too many requests",
  };

  const errorName = error.name || "Error";
  return {
    error: errorMap[errorName] || "An unexpected error occurred",
    code: errorName,
  };
}

/**
 * Sanitize object to prevent NoSQL query injection (express-mongo-sanitize equivalent)
 */
export function sanitizeNoSQL(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSQL);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with $ or containing . (standard NoSQL injection protection)
    if (!key.startsWith("$") && !key.includes(".")) {
      sanitized[key] = sanitizeNoSQL(value);
    }
  }
  return sanitized;
}

/**
 * Validate object against a Zod schema
 */
export function validateWithZod(data, schema) {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (err) {
    return {
      success: false,
      errors: err.errors ? err.errors.map((e) => `${e.path.join(".")}: ${e.message}`) : [err.message],
    };
  }
}

// Global Zod validation schemas
export const SCHEMAS = {
  login: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    twoFactorCode: z.string().optional(),
  }),
  trackOrder: z.object({
    orderNumber: z.string().min(1, "Order Number is required"),
    phone: z.string().min(1, "Phone number is required"),
    verificationCode: z.string().min(1, "Verification Code is required"),
  }),
  review: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1, "Comment is required"),
    productId: z.string().min(1, "Product ID is required"),
  }),
  newsletter: z.object({
    email: z.string().email("Invalid email address"),
  }),
  couponValidate: z.object({
    code: z.string().min(1, "Coupon code is required"),
    total: z.number().min(0),
  }),
  policyUpdate: z.object({
    content: z.string(),
  }),
  bestsellerUpdate: z.object({
    productId: z.string().min(1),
    bestseller: z.boolean(),
  }),
  customerCheck: z.object({
    phone: z.string().min(1),
  })
};

/**
 * Parses, NoSQL-sanitizes, and validates the request body against a specified Zod schema.
 */
export async function getValidatedBody(req, schemaName) {
  try {
    const rawBody = await req.json();
    
    // 1. Sanitize against NoSQL injections
    const sanitizedBody = sanitizeNoSQL(rawBody);
    
    // 2. Perform Zod validation if schema exists
    const schema = SCHEMAS[schemaName];
    if (schema) {
      const parsed = schema.safeParse(sanitizedBody);
      if (!parsed.success) {
        const errorMsg = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
        return { success: false, error: errorMsg };
      }
      return { success: true, data: parsed.data };
    }
    
    return { success: true, data: sanitizedBody };
  } catch (err) {
    return { success: false, error: "Invalid JSON request body" };
  }
}

/**
 * Returns a production-safe error message, shielding raw stack traces and db schemas.
 */
export function getSafeError(err) {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return err?.message || "An error occurred";
  }
  return "Something went wrong. Please try again later.";
}
