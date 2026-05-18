import { NextResponse } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/admin-login", "/api/admin/login"];

// Role-based protected paths
const ROLE_PROTECTED_PATHS = {
  "/admin/staff": ["super_admin"],
  "/admin/settings": ["super_admin", "admin"],
};

// Security headers for API responses
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self' https:;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// In-memory rate limiting store for proxy middleware
const rateLimitStore = new Map();

/**
 * Lightweight, edge-compatible rate limiter
 */
function rateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

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
 * Edge-compatible HMAC-SHA256 JWT signature and expiration verifier
 */
async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload securely
    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);

    // Verify expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Verify signature cryptographically
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Import raw secret key for HMAC SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert base64url signature back to bytes
    const sigBinaryStr = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigBinaryStr.length);
    for (let i = 0; i < sigBinaryStr.length; i++) {
      sigBytes[i] = sigBinaryStr.charCodeAt(i);
    }

    // Perform verification
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      data
    );

    if (!isValid) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Add security headers to all responses
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 1. Rate Limiting on API routes
  if (pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
    let allowed = true;
    let errorMsg = "Too many requests. Please try again later.";
    let retryAfter = 60;

    if (method === "POST" && (pathname === "/api/auth/login" || pathname === "/api/admin/login")) {
      const res = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
      allowed = res.allowed;
      retryAfter = res.retryAfter || 900;
      errorMsg = "Too many login attempts. Access blocked for 15 minutes.";
    } else if (method === "POST" && (pathname === "/api/checkout" || pathname === "/api/coupons/apply" || pathname === "/api/orders")) {
      const res = rateLimit(`checkout:${ip}`, 10, 60 * 1000);
      allowed = res.allowed;
      retryAfter = res.retryAfter || 60;
      errorMsg = "Too many attempts on this action. Please try again in a minute.";
    } else {
      const res = rateLimit(`api:${ip}`, 100, 60 * 1000);
      allowed = res.allowed;
      retryAfter = res.retryAfter || 60;
    }

    if (!allowed) {
      const rateLimitResponse = NextResponse.json(
        { error: errorMsg },
        { status: 429, headers: securityHeaders }
      );
      rateLimitResponse.headers.set("Retry-After", String(retryAfter));
      return rateLimitResponse;
    }
  }

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => 
    pathname === path || pathname === path + "/"
  );

  // Allow public paths immediately
  if (isPublicPath) {
    return response;
  }

  // Only check admin routes
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return response;
  }

  // Get auth tokens
  const token = req.cookies.get("admin_token")?.value;
  const refreshToken = req.cookies.get("admin_refresh")?.value;

  // If no tokens, redirect/respond unauthorized
  if (!token && !refreshToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders }
      );
    }
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  // Verify token cryptographically using Web Crypto
  let user = null;
  if (token) {
    user = await verifyJWT(token, process.env.JWT_SECRET);
    
    // Token invalid and no refresh token
    if (!user && !refreshToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: securityHeaders }
        );
      }
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  // Check role-based permission requirements (must be admin or super_admin)
  if (user && user.role !== "admin" && user.role !== "super_admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403, headers: securityHeaders }
      );
    }
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  // Check role-based access for specific paths
  if (user) {
    for (const [protectedPath, allowedRoles] of Object.entries(ROLE_PROTECTED_PATHS)) {
      if (pathname.startsWith(protectedPath)) {
        if (!allowedRoles.includes(user.role)) {
          if (pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "Forbidden: Insufficient permissions" },
              { status: 403, headers: securityHeaders }
            );
          }
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login", "/api/:path*"],
};
