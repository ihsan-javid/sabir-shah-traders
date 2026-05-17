import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/Policy";
import { getAuthUser, securityHeaders } from "@/lib/security";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders }
      );
    }

    const { type } = await params;
    const body = await req.json();
    const { content } = body;

    const allowedTypes = ["shipping", "refund", "privacy", "terms"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid policy type" },
        { status: 400, headers: securityHeaders }
      );
    }

    let policy = await Policy.findOne({ type });
    if (!policy) {
      policy = new Policy({ type });
    }
    policy.content = content || "";
    await policy.save();

    return NextResponse.json({ ok: true, policy }, { headers: securityHeaders });
  } catch (error) {
    console.error("Failed to update policy:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
