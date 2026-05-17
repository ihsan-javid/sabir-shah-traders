import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 }, // 0 for infinite
    used: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 }, // TASK 3
    maxUsage: { type: Number, default: 0 },   // TASK 3
    expiry: { type: Date },
    active: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Coupon;
}

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
