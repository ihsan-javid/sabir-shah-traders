import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { securityHeaders } from "@/lib/security";

export async function POST(req) {
  try {
    await connectDB();
    const { orderNumber, phone, verificationCode } = await req.json();

    if (!orderNumber || !phone || !verificationCode) {
      return NextResponse.json(
        { error: "Order number, phone number, and verification code are required" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Normalise inputs
    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[-\s]/g, "");

    // Search order
    const order = await Order.findOne({
      orderNumber: cleanOrderNumber,
      verificationCode: verificationCode.trim().toUpperCase(),
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please verify details." },
        { status: 404, headers: securityHeaders }
      );
    }

    // Simple security check: phone must match (either trailing digits or full match)
    const orderPhoneCleaned = order.customer.phone.replace(/[-\s]/g, "");
    if (!orderPhoneCleaned.endsWith(cleanPhone) && !cleanPhone.endsWith(orderPhoneCleaned)) {
      return NextResponse.json(
        { error: "Phone number does not match this order." },
        { status: 400, headers: securityHeaders }
      );
    }

    return NextResponse.json({ order }, { headers: securityHeaders });
  } catch (err) {
    console.error("Tracking API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}
