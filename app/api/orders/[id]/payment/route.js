import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import {
  requireAuth,
  securityHeaders,
  sanitizeInput,
  rateLimit,
  createActivityLogEntry,
} from "@/lib/security";

// Rate limiting for payment updates
const PAYMENT_RATE_LIMIT = { maxRequests: 20, windowMs: 60 * 1000 }; // 20 updates per minute

// Valid payment statuses
const VALID_PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "cancelled",
];

// PATCH /api/orders/[id]/payment - Update payment status
export async function PATCH(req, { params }) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(
    `payment-update:${ip}`,
    PAYMENT_RATE_LIMIT.maxRequests,
    PAYMENT_RATE_LIMIT.windowMs
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: securityHeaders }
    );
  }

  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Validate payment status
    const { status, transactionId, referenceNumber, note } = body;

    if (!status || !VALID_PAYMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders }
      );
    }

    const previousStatus = order.payment.status;

    // Update payment status
    order.payment.status = status;

    // Update additional payment fields if provided
    if (transactionId) {
      order.payment.transactionId = sanitizeInput(transactionId);
    }
    if (referenceNumber) {
      order.payment.referenceNumber = sanitizeInput(referenceNumber);
    }

    // Set timestamps based on status
    if (status === "paid" && !order.payment.paidAt) {
      order.payment.paidAt = new Date();
    }
    if (status === "refunded" && !order.payment.refundedAt) {
      order.payment.refundedAt = new Date();
      if (body.refundAmount) {
        order.payment.refundAmount = Number(body.refundAmount);
      }
    }

    // Add status history entry
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: sanitizeInput(note) || `Payment status changed to ${status}`,
      updatedBy: auth.user.username,
    });

    await order.save();

    // Log activity in production-ready db structure if required

    return NextResponse.json(
      {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          payment: order.payment,
          statusHistory: order.statusHistory,
        },
        message: "Payment status updated successfully",
      },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("Payment update error:", err);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500, headers: securityHeaders }
    );
  }
}

// GET /api/orders/[id]/payment - Get payment details
export async function GET(req, { params }) {
  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders }
      );
    }

    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).select("orderNumber payment pricing").lean();
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        payment: order.payment,
        total: order.pricing.total,
      },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("Payment GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500, headers: securityHeaders }
    );
  }
}
