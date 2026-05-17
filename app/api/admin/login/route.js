import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Settings from "@/models/Settings";
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  rateLimit,
  sanitizeInput,
  securityHeaders,
  createActivityLogEntry,
} from "@/lib/security";

export async function POST(request) {
  await connectDB();
  const settings = await Settings.findOne().lean();
  const limit = settings?.security?.loginAttemptLimit || 5;

  // Get client IP for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Apply rate limiting on login (max 10 requests per minute per IP for sensitive routes)
  const rateLimitResult = rateLimit(`login:${ip}`, 10, 60 * 1000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Access blocked for 1 minute." },
      { status: 429, headers: securityHeaders }
    );
  }

  try {
    const body = await request.json();
    let { username, password, twoFactorCode } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Sanitize and normalize inputs
    username = sanitizeInput(username).toLowerCase().trim();

    // Query database for admin user
    const admin = await Admin.findOne({ username });
    if (!admin) {
      // Return generic error message to prevent username enumeration (security hardening!)
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401, headers: securityHeaders }
      );
    }

    // Check account locking
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const remainingTime = Math.ceil((new Date(admin.lockUntil) - new Date()) / 1000 / 60);
      return NextResponse.json(
        { error: `Account temporarily locked due to repeated failed logins. Try again in ${remainingTime} minutes.` },
        { status: 403, headers: securityHeaders }
      );
    }

    // Compare bcryptjs hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Increment login attempts
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      if (admin.loginAttempts >= limit) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await admin.save();

      // Logged failed login attempt

      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401, headers: securityHeaders }
      );
    }

    // Verify Two-Factor Authentication (2FA) if enabled on admin record
    if (admin.twoFactorEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          {
            twoFactorRequired: true,
            message: "Two-factor authentication code required",
          },
          { status: 200, headers: securityHeaders }
        );
      }

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: "base32",
        token: String(twoFactorCode).replace(/\s/g, ""),
        window: 1, // 1 step window allowance (30 seconds)
      });

      if (!verified) {
        return NextResponse.json(
          { error: "Invalid authentication code" },
          { status: 401, headers: securityHeaders }
        );
      }
    }

    // Reset login attempts on successful authentication
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    // Determine role based on database profile
    const role = admin.role || "admin";

    // Generate session JWT tokens
    const payload = { username, role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Create success response
    const res = NextResponse.json(
      {
        ok: true,
        message: "Login successful",
        user: { username, role },
      },
      { headers: securityHeaders }
    );

    // Set secure, httpOnly cookies
    setAuthCookies(res, accessToken, refreshToken, settings?.security?.sessionTimeout || 60);

    // Logged successful login attempt

    return res;
  } catch (err) {
    console.error("Login error:", err);
    // Generic error message - prevent stack trace leakage in production (security hardening!)
    return NextResponse.json(
      { error: "Authentication failed due to system error" },
      { status: 500, headers: securityHeaders }
    );
  }
}
