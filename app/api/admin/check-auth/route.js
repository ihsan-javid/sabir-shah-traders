import { NextResponse } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  setAuthCookies,
  getAuthUser,
  securityHeaders,
} from "@/lib/security";

export async function GET(req) {
  try {
    // Try to get user from access token
    let user = await getAuthUser(req);

    // If access token expired, try to refresh
    if (!user) {
      const refreshToken = req.cookies.get("admin_refresh")?.value;

      if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);

        if (decoded && decoded.type === "refresh") {
          // Generate new access token
          const { username, role } = decoded;
          user = { username, role };

          const newAccessToken = signAccessToken({ username, role });

          // Return user with new token in cookie
          const res = NextResponse.json(
            {
              ok: true,
              user,
              refreshed: true,
            },
            { headers: securityHeaders },
          );

          // Set new access token cookie
          const isProduction = process.env.NODE_ENV === "production";
          res.cookies.set("admin_token", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            path: "/",
            maxAge: 60 * 60 * 2, // 2 hours
          });

          return res;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        user,
      },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json(
      { ok: false, error: "Authentication check failed" },
      { status: 401, headers: securityHeaders },
    );
  }
}
