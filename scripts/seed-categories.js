import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectDB } from "../lib/mongodb.js";
import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true },
  description: { type: String, default: "" },
  visible:     { type: Boolean, default: true },
});
const CategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    visible:     { type: Boolean, default: true },
    children:    [SubCategorySchema],
  },
  { timestamps: true },
);
delete mongoose.models.Category;
const Category = mongoose.model("Category", CategorySchema);

const CATEGORIES = [
  {
    name: "Supplements",
    slug: "supplements",
    description: "Premium sports nutrition and health supplements for peak performance.",
    visible: true,
    children: [
      { name: "Whey Protein",       slug: "whey-protein",    description: "Fast-absorbing whey isolate and concentrate blends for muscle growth." },
      { name: "Mass Gainer",        slug: "mass-gainer",     description: "High-calorie formulas for hardgainers and bulking phases." },
      { name: "Creatine",           slug: "creatine",        description: "Pure micronized creatine monohydrate for strength and power." },
      { name: "Pre Workout",        slug: "pre-workout",     description: "Energy, focus, and pump formulas for maximum training intensity." },
      { name: "Fat Burner",         slug: "fat-burner",      description: "Thermogenic compounds to accelerate fat loss and metabolism." },
      { name: "Amino Acids",        slug: "amino-acids",     description: "BCAA, EAA, and glutamine for intra-workout and recovery support." },
      { name: "Vitamins",           slug: "vitamins",        description: "Essential vitamins, minerals, and antioxidants for overall health." },
      { name: "Health Supplements", slug: "health",          description: "Omega-3, probiotics, ZMA, and wellness support supplements." },
      { name: "Vegan Protein",      slug: "vegan-protein",   description: "Plant-based pea and rice protein blends for vegan athletes." },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Cutting-edge consumer electronics and tech accessories.",
    visible: true,
    children: [
      { name: "Smartwatches",  slug: "smartwatches",  description: "Fitness trackers and smartwatches for the modern athlete." },
      { name: "Headphones",    slug: "headphones",    description: "ANC headphones, earbuds, and portable speakers." },
      { name: "Accessories",   slug: "accessories",   description: "Power banks, webcams, and tech accessories." },
      { name: "Peripherals",   slug: "peripherals",   description: "Keyboards, mice, and desktop peripherals." },
      { name: "Smart Home",    slug: "smart-home",    description: "Smart bulbs, plugs, and home automation devices." },
      { name: "Networking",    slug: "networking",    description: "Routers, mesh systems, and network hardware." },
      { name: "Gadgets",       slug: "gadgets",       description: "VR headsets and innovative tech gadgets." },
    ],
  },
];

async function seed() {
  await connectDB();
  console.log("✅ Connected to MongoDB");

  await Category.deleteMany({});
  console.log("🗑️  Cleared existing categories");

  for (const cat of CATEGORIES) {
    await Category.create(cat);
    console.log(`✅ Created: ${cat.name} (${cat.children.length} subcategories)`);
  }

  console.log("\n🎉 Categories seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
