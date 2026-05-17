import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productSlug: { type: String, default: "" }, // empty = site-wide review
    name: { type: String, required: true },
    city: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    // Reviews default to approved directly
    status: { type: String, default: "approved", enum: ["pending", "approved", "rejected"] },
    reply: { type: String, default: "" },
  },
  { timestamps: true }
);

// Force recompile in development
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Review;
}

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
