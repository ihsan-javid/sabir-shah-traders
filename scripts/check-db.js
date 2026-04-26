import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

async function check() {
  try {
    console.log("URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const products = await db.collection("products").find({}).toArray();
    console.log("Product count:", products.length);
    if (products.length > 0) {
      console.log("First product name:", products[0].name);
      console.log("First product category:", products[0].category);
    }
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
