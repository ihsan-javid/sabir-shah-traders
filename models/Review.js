import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productSlug: { type: String, default: "" }, // empty = site-wide review
    name: { type: String, required: true },
    city: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
