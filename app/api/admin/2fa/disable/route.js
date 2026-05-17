import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Settings from "@/models/Settings";
import { requireAuth, securityHeaders } from "@/lib/security";

export async function POST(request) {
  await connectDB();

  // Verify auth
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
  }

  const { user } = auth;

  try {
    const admin = await Admin.findOne({ username: user.username.toLowerCase() });
    if (!admin) {
      return NextResponse.json({ error: "Admin record not found" }, { status: 404, headers: securityHeaders });
    }

    // Disable 2FA
    admin.twoFactorEnabled = false;
    admin.twoFactorSecret = null;
    await admin.save();

    // Synchronize global settings
    await Settings.updateOne({}, { $set: { "security.twoFactorAuth": false } });

    return NextResponse.json(
      {
        success: true,
        message: "Two-Factor Authentication disabled successfully",
      },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("2FA disable error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: securityHeaders });
  }
}
