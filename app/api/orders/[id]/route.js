import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import {
  getAuthUser,
  requireAuth,
  securityHeaders,
  sanitizeInput,
  rateLimit,
  createActivityLogEntry,
} from "@/lib/security";

// Rate limiting for order updates
const UPDATE_RATE_LIMIT = { maxRequests: 30, windowMs: 60 * 1000 }; // 30 updates per minute

// Valid status transitions
const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out-for-delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

// Valid payment statuses
const VALID_PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "cancelled",
];

// GET /api/orders/[id] - Get single order (admin only)
export async function GET(req, { params }) {
  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders },
      );
    }

    return NextResponse.json({ order }, { headers: securityHeaders });
  } catch (err) {
    console.error("Order GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500, headers: securityHeaders },
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(req, { params }) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(
    `order-update:${ip}`,
    UPDATE_RATE_LIMIT.maxRequests,
    UPDATE_RATE_LIMIT.windowMs,
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: securityHeaders },
    );
  }

  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Validate status
    const { status, note } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400, headers: securityHeaders },
      );
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders },
      );
    }

    // Update status and add to history
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: sanitizeInput(note) || `Status changed to ${status}`,
      updatedBy: auth.user.username,
    });

    await order.save();

    // Log activity in production-ready db structure if required

    return NextResponse.json(
      {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          statusHistory: order.statusHistory,
        },
        message: "Order status updated successfully",
      },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Order PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500, headers: securityHeaders },
    );
  }
}

// PUT /api/orders/[id] - Full order update (admin only)
export async function PUT(req, { params }) {
  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;
    const updates = await req.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "status",
      "shipping",
      "adminNotes",
      "shipping.trackingNumber",
      "shipping.carrier",
    ];

    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Validate status if provided
    if (
      filteredUpdates.status &&
      !VALID_STATUSES.includes(filteredUpdates.status)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400, headers: securityHeaders },
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true },
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders },
      );
    }

    return NextResponse.json({ order }, { headers: securityHeaders });
  } catch (err) {
    console.error("Order PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500, headers: securityHeaders },
    );
  }
}

// DELETE /api/orders/[id] - Delete order (super admin only)
export async function DELETE(req, { params }) {
  try {
    // Check authentication - allow any authenticated admin
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: securityHeaders },
      );
    }

    // Log activity in production-ready db structure if required

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Order DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500, headers: securityHeaders },
    );
  }
}
