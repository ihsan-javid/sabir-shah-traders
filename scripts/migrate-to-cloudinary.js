import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectDB } from "../lib/mongodb.js";
import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary() {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to process.`);

    for (const product of products) {
      if (product.image && product.image.startsWith("/")) {
        const localPath = path.join(process.cwd(), "public", product.image);
        
        if (fs.existsSync(localPath)) {
          console.log(`Uploading ${product.name} image to Cloudinary...`);
          
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "sabir-shah-ecom/products",
            use_filename: true,
            unique_filename: true,
          });

          console.log(`Successfully uploaded. URL: ${result.secure_url}`);

          product.image = result.secure_url;
          product.imagePublicId = result.public_id;
          await product.save();
          
          console.log(`Updated database record for ${product.name}.`);
        } else {
          console.warn(`Local image not found for ${product.name} at ${localPath}`);
        }
      }
    }

    console.log("All images uploaded to Cloudinary and database updated!");
    process.exit(0);
  } catch (err) {
    console.error("Cloudinary migration failed:", err);
    process.exit(1);
  }
}

uploadToCloudinary();
