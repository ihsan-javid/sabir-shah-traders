import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkProducts() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const db = mongoose.connection.db;
  const products = await db.collection("products").find({}).toArray();
  
  const withMultipleImages = products.filter(p => p.images && p.images.length > 1);
  console.log(`Total products: ${products.length}`);
  console.log(`Products with multiple images: ${withMultipleImages.length}`);
  
  if (withMultipleImages.length > 0) {
    console.log("Sample product with multiple images:", {
      name: withMultipleImages[0].name,
      image: withMultipleImages[0].image,
      images: withMultipleImages[0].images
    });
  }
  
  process.exit(0);
}

checkProducts().catch(console.error);
