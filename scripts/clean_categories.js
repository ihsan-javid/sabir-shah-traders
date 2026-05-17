import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  children: [
    {
      name: String,
      slug: String
    }
  ]
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

async function cleanCategories() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const supplements = await Category.findOne({ slug: "supplements" });
  if (supplements && supplements.children && supplements.children.length > 5) {
    console.log(`Supplements has ${supplements.children.length} subcategories. Keeping first 5.`);
    supplements.children = supplements.children.slice(0, 5);
    await supplements.save();
  }
  
  const electronics = await Category.findOne({ slug: "electronics" });
  if (electronics && electronics.children && electronics.children.length > 5) {
    console.log(`Electronics has ${electronics.children.length} subcategories. Keeping first 5.`);
    electronics.children = electronics.children.slice(0, 5);
    await electronics.save();
  }
  
  console.log("Categories cleaned.");
  process.exit(0);
}

cleanCategories().catch(console.error);
