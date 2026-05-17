import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/Policy";
import { getAuthUser, securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders }
      );
    }

    const types = ["shipping", "refund", "privacy", "terms"];
    const policies = [];

    for (const t of types) {
      let policy = await Policy.findOne({ type: t });
      if (!policy) {
        policy = await Policy.create({ type: t, content: "" });
      }
      policies.push(policy);
    }

    const policyMap = {};
    policies.forEach((p) => {
      policyMap[p.type] = p.content;
    });

    return NextResponse.json({ policies: policyMap }, { headers: securityHeaders });
  } catch (error) {
    console.error("Failed to fetch admin policies:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
