import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAuthUser,
  securityHeaders,
  createActivityLogEntry,
} from "@/lib/security";

export async function POST(req) {
  try {
    // Get current user before clearing session
    const user = await getAuthUser(req);

    // Get client info for logging
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Log logout if user was authenticated
    if (user) {
      // Logged logout successfully
    }

    // Create success response
    const res = NextResponse.json(
      {
        ok: true,
        message: "Logged out successfully",
      },
      { headers: securityHeaders },
    );

    // Clear all auth cookies
    clearAuthCookies(res);

    return res;
  } catch (err) {
    console.error("Logout error:", err);

    // Even on error, try to clear cookies
    const res = NextResponse.json(
      { ok: true, message: "Session cleared" },
      { status: 200, headers: securityHeaders },
    );

    clearAuthCookies(res);
    return res;
  }
}
