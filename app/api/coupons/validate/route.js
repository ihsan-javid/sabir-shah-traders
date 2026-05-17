import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { securityHeaders, rateLimit } from "@/lib/security";

export async function POST(req) {
  try {
    // Rate limiting (max 10 requests per minute per IP)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rateLimitResult = rateLimit(`coupon:${ip}`, 10, 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many coupon validation attempts. Please try again later." },
        { status: 429, headers: securityHeaders }
      );
    }

    await connectDB();
    const { code, total } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400, headers: securityHeaders },
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon" },
        { status: 404, headers: securityHeaders },
      );
    }

    // Check expiry
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 400, headers: securityHeaders },
      );
    }

    // Check usage limit
    if (
      (coupon.maxUsage > 0 && coupon.usageCount >= coupon.maxUsage) ||
      (coupon.maxUses > 0 && coupon.used >= coupon.maxUses)
    ) {
      return NextResponse.json(
        {
          error: "This coupon has reached its usage limit.",
        },
        { status: 400, headers: securityHeaders },
      );
    }

    // Check min order
    if (total < coupon.minOrder) {
      return NextResponse.json(
        {
          error: `Minimum order of ${coupon.minOrder} PKR required for this coupon`,
        },
        { status: 400, headers: securityHeaders },
      );
    }

    let discount = 0;
    if (coupon.type === "percent") {
      discount = Math.round((total * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json(
      {
        valid: true,
        discount,
        type: coupon.type,
        value: coupon.value,
        code: coupon.code,
      },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500, headers: securityHeaders },
    );
  }
}
