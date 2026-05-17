import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: "" },
  visible: { type: Boolean, default: true },
});

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    children: [SubCategorySchema],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Category;
}

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);