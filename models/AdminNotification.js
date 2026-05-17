import mongoose from "mongoose";

const AdminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["order", "stock", "review", "contact", "coupon", "system"],
      required: true,
    },
    message: { type: String, required: true },
    href: { type: String },
    icon: { type: String },
    isRead: { type: Boolean, default: false },
    isCleared: { type: Boolean, default: false },
    relatedId: { type: String }, // e.g. orderId, productId
    readBy: [{ type: String }],
    clearedBy: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.AdminNotification ||
  mongoose.model("AdminNotification", AdminNotificationSchema);
