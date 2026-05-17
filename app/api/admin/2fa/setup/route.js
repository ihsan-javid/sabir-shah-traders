import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Settings from "@/models/Settings";
import { requireAuth, securityHeaders } from "@/lib/security";

// POST handles action=generate and action=verify
export async function POST(request) {
  await connectDB();

  // 1. Verify that request is from an authenticated admin
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
  }

  const { user } = auth;

  try {
    const body = await request.json();
    const { action } = body;

    // A. ACTION: GENERATE SECRET & QR CODE
    if (action === "generate") {
      const secret = speakeasy.generateSecret({
        name: `Sabir Shah Traders (${user.username})`,
        issuer: "Sabir Shah Traders",
      });

      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return NextResponse.json(
        {
          secret: secret.base32,
          qrCode: qrCodeUrl,
        },
        { headers: securityHeaders }
      );
    }

    // B. ACTION: VERIFY CODE TO ENABLE 2FA
    if (action === "verify") {
      const { secret, code } = body;
      if (!secret || !code) {
        return NextResponse.json(
          { error: "Secret and verification code are required" },
          { status: 400, headers: securityHeaders }
        );
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: code.replace(/\s/g, ""),
        window: 1, // 1 step window allowance (30 seconds)
      });

      if (!verified) {
        return NextResponse.json(
          { error: "Invalid authentication code. Please try again." },
          { status: 400, headers: securityHeaders }
        );
      }

      // Save to admin record
      const admin = await Admin.findOne({ username: user.username.toLowerCase() });
      if (!admin) {
        return NextResponse.json({ error: "Admin record not found" }, { status: 404, headers: securityHeaders });
      }

      admin.twoFactorEnabled = true;
      admin.twoFactorSecret = secret;
      await admin.save();

      // Synchronize with global settings
      await Settings.updateOne({}, { $set: { "security.twoFactorAuth": true } });

      return NextResponse.json(
        {
          success: true,
          message: "Two-Factor Authentication enabled successfully",
        },
        { headers: securityHeaders }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: securityHeaders });
  } catch (err) {
    console.error("2FA setup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: securityHeaders });
  }
}
