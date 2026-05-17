import mongoose from "mongoose";
import { PAYMENT_METHODS } from "@/lib/payments";

// Re-export for server-side use
export { PAYMENT_METHODS };

// Order item schema
const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 1 },
  variant: { type: String, default: null }, // e.g., size, flavor
});

// Payment proof schema for screenshots
const PaymentProofSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: null },
  uploadedAt: { type: Date, default: Date.now },
});

// Payment details schema
const PaymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: Object.keys(PAYMENT_METHODS),
    default: "COD",
  },
  status: {
    type: String,
    enum: ["pending", "authorized", "paid", "failed", "refunded", "cancelled"],
    default: "pending",
  },
  transactionId: { type: String, default: null }, // Gateway transaction ID
  referenceNumber: { type: String, default: null }, // Customer reference
  paidAt: { type: Date, default: null },
  refundedAt: { type: Date, default: null },
  refundAmount: { type: Number, default: 0 },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  proof: { type: PaymentProofSchema, default: null }, // Payment screenshot proof
});

// Shipping details schema
const ShippingDetailsSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postal: { type: String, default: "" },
  notes: { type: String, default: "" },
  trackingNumber: { type: String, default: null },
  carrier: { type: String, default: null },
  estimatedDelivery: { type: Date, default: null },
});

// Order status history
const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: "" },
  updatedBy: { type: String, default: "system" }, // admin username or "system"
});

// Main Order schema
const OrderSchema = new mongoose.Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    verificationCode: {
      type: String,
      index: true,
    },

    // Customer information
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      userId: { type: String, default: null }, // For registered users
    },

    // Order items
    items: [OrderItemSchema],

    // Pricing
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "PKR" },
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // Detailed schemas
    payment: PaymentDetailsSchema,
    shipping: ShippingDetailsSchema,
    statusHistory: [StatusHistorySchema],

    // Admin notes
    adminNotes: { type: String, default: "" },

    // Invoice
    invoice: {
      generatedAt: { type: Date, default: null },
      invoiceNumber: { type: String, default: null },
      pdfUrl: { type: String, default: null },
    },

    // Metadata
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    source: { type: String, default: "website" }, // website, mobile, admin
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "payment.status": 1 });

// Generate order number before saving
OrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const now = new Date();
    const prefix = "SST";
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // Get count of orders today for sequential number
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Use this.constructor to get the model constructor
      const OrderModel = this.constructor;
      const count = await OrderModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const sequence = String(count + 1).padStart(4, "0");
      this.orderNumber = `${prefix}-${year}${month}${day}-${sequence}`;
    } catch (err) {
      console.error("Order number generation error:", err);
      // Fallback if count fails - use timestamp
      const timestamp = Date.now().toString().slice(-4);
      this.orderNumber = `${prefix}-${year}${month}${day}-${timestamp}`;
    }
  }

  // Generate verification code before saving if not present
  if (!this.verificationCode) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.verificationCode = code;
  }

  // Initialize status history for new orders
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status || "pending",
      timestamp: new Date(),
      note: "Order received",
    });
  }

  // Add status history entry if status changed (for updates)
  if (!this.isNew && this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`,
    });
  }
});

// Virtual for formatted order date
OrderSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for payment method name
OrderSchema.virtual("paymentMethodName").get(function () {
  return PAYMENT_METHODS[this.payment.method]?.name || this.payment.method;
});

// Method to check if order can be cancelled
OrderSchema.methods.canCancel = function () {
  return !["shipped", "delivered", "cancelled", "refunded"].includes(
    this.status,
  );
};

// Method to check if order can be refunded
OrderSchema.methods.canRefund = function () {
  return (
    ["paid", "delivered"].includes(this.payment.status) &&
    !["refunded", "cancelled"].includes(this.status)
  );
};

// Static method to get order statistics
OrderSchema.statics.getStats = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.total" },
        avgOrderValue: { $avg: "$pricing.total" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        paidOrders: {
          $sum: {
            $cond: [{ $in: ["$payment.status", ["paid", "authorized"]] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      paidOrders: 0,
    }
  );
};

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
