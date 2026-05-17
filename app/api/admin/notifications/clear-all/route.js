import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdminNotification from "@/models/AdminNotification";
import { getAuthUser, securityHeaders } from "@/lib/security";

export async function DELETE(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const username = user?.username || "admin";

    await AdminNotification.updateMany(
      { clearedBy: { $ne: username } },
      { $addToSet: { clearedBy: username }, $set: { isCleared: true } }
    );

    return NextResponse.json(
      { ok: true, message: "All notifications cleared" },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Clear all notifications error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
