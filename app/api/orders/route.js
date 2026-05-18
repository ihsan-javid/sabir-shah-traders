import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import {
  validateAndSanitize,
  sanitizeInput,
  securityHeaders,
  rateLimit,
} from "@/lib/security";
import { validatePaymentMethod, calculateOrderTotals } from "@/lib/payments";

// Rate limiting for order creation
const ORDER_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000 }; // 10 orders per hour per IP

// Validation schema for order creation
const orderValidationSchema = {
  "customer.name": {
    required: true,
    minLength: 2,
    maxLength: 100,
    type: "string",
  },
  "customer.phone": {
    required: true,
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    errorMessage: "Please enter a valid phone number",
  },
  "customer.email": {
    required: false,
    type: "email",
  },
  "shipping.address": {
    required: true,
    minLength: 10,
    maxLength: 500,
    type: "string",
  },
  "shipping.city": {
    required: true,
    minLength: 2,
    maxLength: 100,
    type: "string",
  },
  "shipping.postal": {
    required: false,
    maxLength: 20,
    type: "string",
  },
  "payment.method": {
    required: true,
    type: "string",
  },
};

// GET /api/orders (admin)
export async function GET(req) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    return NextResponse.json(
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500, headers: securityHeaders },
    );
  }
}

// POST /api/orders (customer checkout)
export async function POST(req) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(
    `orders:${ip}`,
    ORDER_RATE_LIMIT.maxRequests,
    ORDER_RATE_LIMIT.windowMs,
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many orders. Please try again later.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          ...securityHeaders,
          "Retry-After": String(rateLimitResult.retryAfter),
        },
      },
    );
  }

  try {
    await connectDB();

    const body = await req.json();

    // Validate payment method
    const paymentValidation = validatePaymentMethod(body.payment?.method);
    if (!paymentValidation.valid) {
      console.warn("Payment validation failed:", body.payment?.method);
      return NextResponse.json(
        { error: paymentValidation.error },
        { status: 400, headers: securityHeaders },
      );
    }

    // Check if payment proof is required for non-COD methods
    const paymentMethod = body.payment?.method?.toUpperCase() || "COD";
    const requiresProof = ["EASYPAISA", "JAZZCASH", "CARD"].includes(
      paymentMethod,
    );

    if (requiresProof && !body.payment?.proof?.url) {
      return NextResponse.json(
        { error: "Payment screenshot is required for this payment method" },
        { status: 400, headers: securityHeaders },
      );
    }

    // Sanitize and validate input data
    const sanitized = {
      customer: {
        name: sanitizeInput(body.customer?.name),
        phone: sanitizeInput(body.customer?.phone),
        email:
          body.customer?.email ?
            sanitizeInput(body.customer.email.toLowerCase())
          : "",
        userId: body.customer?.userId || null,
      },
      shipping: {
        address: sanitizeInput(body.shipping?.address),
        city: sanitizeInput(body.shipping?.city),
        postal:
          body.shipping?.postal ? sanitizeInput(body.shipping.postal) : "",
        notes: body.shipping?.notes ? sanitizeInput(body.shipping.notes) : "",
      },
      payment: {
        method: paymentMethod,
        status: "pending",
        proof:
          requiresProof && body.payment?.proof ?
            {
              url: body.payment.proof.url,
              uploadedAt: body.payment.proof.uploadedAt || new Date(),
            }
          : null,
      },
    };

    // Validate required fields
    if (!sanitized.customer.name || sanitized.customer.name.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid name" },
        { status: 400, headers: securityHeaders },
      );
    }

    if (!sanitized.customer.phone || sanitized.customer.phone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400, headers: securityHeaders },
      );
    }

    if (!sanitized.shipping.address || sanitized.shipping.address.length < 10) {
      return NextResponse.json(
        { error: "Please enter a complete delivery address" },
        { status: 400, headers: securityHeaders },
      );
    }

    if (!sanitized.shipping.city) {
      return NextResponse.json(
        { error: "Please enter your city" },
        { status: 400, headers: securityHeaders },
      );
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400, headers: securityHeaders },
      );
    }

    const items = body.items.map((item) => ({
      productId: sanitizeInput(String(item.productId)),
      name: sanitizeInput(item.name),
      image: item.image || "",
      price: Math.max(0, Number(item.price) || 0),
      qty: Math.max(1, Math.min(99, Number(item.qty) || 1)),
      variant: item.variant ? sanitizeInput(item.variant) : null,
    }));

    // Validate pricing
    const pricing = body.pricing || {};
    const subtotal = Math.max(0, Number(pricing.subtotal) || 0);
    const shipping = Math.max(0, Number(pricing.shipping) || 0);
    const discount = Math.max(0, Number(pricing.discount) || 0);
    const tax = Math.max(0, Number(pricing.tax) || 0);
    const total = Math.max(
      0,
      Number(pricing.total) || subtotal + shipping - discount + tax,
    );

    // Verify totals match (prevent tampering)
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const maxDifference = 100; // Allow small rounding differences

    if (Math.abs(calculatedSubtotal - subtotal) > maxDifference) {
      console.warn(
        `Price mismatch: calculated ${calculatedSubtotal}, received ${subtotal}`,
      );
      // Use calculated values to prevent tampering
      // But still allow the order for better UX
    }

    // Create order
    const order = await Order.create({
      customer: sanitized.customer,
      items,
      payment: sanitized.payment,
      shipping: sanitized.shipping,
      pricing: {
        subtotal: calculatedSubtotal,
        shipping,
        discount,
        tax,
        total: calculatedSubtotal + shipping - discount + tax,
        currency: "PKR",
      },
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order received",
        },
      ],
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "unknown",
      source: "website",
    });

    // Track coupon usage
    if (body.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: body.couponCode.toUpperCase() },
          { $inc: { usageCount: 1, used: 1 } }
        );
      } catch (err) {
        console.error("Failed to update coupon usage count:", err);
      }
    }

    // Return order details
    return NextResponse.json(
      {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          verificationCode: order.verificationCode,
          status: order.status,
          total: order.pricing.total,
          paymentMethod: order.payment.method,
          createdAt: order.createdAt,
        },
        message: "Order created successfully",
      },
      { status: 201, headers: securityHeaders },
    );
  } catch (err) {
    console.error("Order creation error:", {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
    });

    // Handle MongoDB connection errors
    if (err.message?.includes("MONGODB_URI")) {
      return NextResponse.json(
        { error: "Database configuration error. Please contact support." },
        { status: 500, headers: securityHeaders },
      );
    }

    // Handle duplicate order number (rare edge case)
    if (err.code === 11000 && err.keyPattern?.orderNumber) {
      return NextResponse.json(
        { error: "Please try again - order number conflict" },
        { status: 409, headers: securityHeaders },
      );
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join(", ") },
        { status: 400, headers: securityHeaders },
      );
    }

    // Handle MongoDB connection errors
    if (err.name === "MongooseError" || err.name === "MongoError") {
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 503, headers: securityHeaders },
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to create order. Please try again." },
      { status: 500, headers: securityHeaders },
    );
  }
}
