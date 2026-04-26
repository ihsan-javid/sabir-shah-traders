import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, default: "" },          // Cloudinary secure_url
    imagePublicId: { type: String, default: "" },  // Cloudinary public_id for deletion
    category: { type: String, enum: ["electronics", "supplements"], required: true },
    subCategory: { type: String, default: "" },
    brand: { type: String, default: "" },
    badge: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    benefits: [{ type: String }],
    stock: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
