import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdminNotification from "@/models/AdminNotification";
import { getAuthUser, securityHeaders } from "@/lib/security";

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const username = user?.username || "admin";

    await AdminNotification.updateMany(
      { readBy: { $ne: username } },
      { $addToSet: { readBy: username }, $set: { isRead: true } }
    );

    return NextResponse.json(
      { ok: true, message: "All notifications marked read" },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
