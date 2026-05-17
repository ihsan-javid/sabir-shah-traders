import mongoose from "mongoose";

const SizeVariantSchema = new mongoose.Schema({
  label:  { type: String, required: true },   // e.g. "1KG", "2KG", "30 CAPS"
  price:  { type: Number, required: true },
  stock:  { type: Number, default: 0 },
  sku:    { type: String, default: "" },
});

const SpecificationSchema = new mongoose.Schema({
  label: { type: String },
  value: { type: String },
});

const ProductSchema = new mongoose.Schema(
  {
    slug:         { type: String, required: true, unique: true, trim: true },
    name:         { type: String, required: true },
    tagline:      { type: String, default: "" },
    description:  { type: String, default: "" },
    shortDescription: { type: String, default: "" },

    price:        { type: Number, required: true },

    // Primary image — always a Cloudinary HTTPS URL
    image:        { type: String, default: "" },
    imagePublicId:{ type: String, default: "" },

    // Full gallery — all Cloudinary HTTPS URLs
    images:       [{ type: String }],

    category:     { type: String, default: "" },
    subCategory:  { type: String, default: "" },
    brand:        { type: String, default: "" },
    badge:        { type: String, default: "" },

    // SKU — auto-generated on create if blank
    sku:          { type: String, default: "" },

    rating:       { type: Number, default: 0 },
    reviews:      { type: Number, default: 0 },

    benefits:       [{ type: String }],
    features:       [{ type: String }],
    specifications: [SpecificationSchema],
    highlights:     [{ type: String }],
    tags:           [{ type: String }],
    keyPoints:      [{ type: String }],

    stock:        { type: Number, default: 0 },

    // Size / weight / packaging variants
    sizes: [SizeVariantSchema],

    // Merchandising flags
    featured:     { type: Boolean, default: false },
    bestseller:   { type: Boolean, default: false },
    active:       { type: Boolean, default: true },

    popularity:   { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Auto-generate SKU before save if missing
ProductSchema.pre("save", async function () {
  if (!this.sku) {
    this.sku = this.slug.toUpperCase().replace(/-/g, "").slice(0, 10) +
      "-" + Math.floor(1000 + Math.random() * 9000);
  }
});

// Force recompile in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
