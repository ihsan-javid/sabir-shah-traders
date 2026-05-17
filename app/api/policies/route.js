import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/Policy";
import { securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type) {
      let policy = await Policy.findOne({ type });
      if (!policy) {
        policy = await Policy.create({ type, content: "" });
      }
      return NextResponse.json({ policy: policy.content }, { headers: securityHeaders });
    }

    const all = await Policy.find({});
    const policyMap = {};
    all.forEach((p) => {
      policyMap[p.type] = p.content;
    });
    return NextResponse.json({ policies: policyMap }, { headers: securityHeaders });
  } catch (error) {
    console.error("Public policy get error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
