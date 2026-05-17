import mongoose from "mongoose";

const FOLDER_ENUM = ["Products", "Banners", "Branding", "Uncategorized"];

const MediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    folder: {
      type: String,
      enum: FOLDER_ENUM,
      default: "Products",
    },
    sizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.MediaAsset;
}

export default mongoose.models.MediaAsset ||
  mongoose.model("MediaAsset", MediaAssetSchema);
