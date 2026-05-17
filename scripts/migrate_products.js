import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  slug: String,
  name: String,
  image: String,
  images: [String]
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function migrateProducts() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const products = await Product.find({});
  let totalCreated = 0;
  
  for (const product of products) {
    if (product.images && product.images.length > 1) {
      console.log(`Migrating ${product.name} with ${product.images.length} images`);
      
      const originalImages = product.images;
      
      // Update original product to only have first image
      product.image = originalImages[0];
      product.images = [originalImages[0]];
      // Remove hoverImage if it points to an unrelated image
      product.hoverImage = null; 
      await product.save();
      
      // Create new products for the rest of the images
      for (let i = 1; i < originalImages.length; i++) {
        const newProductObj = product.toObject();
        delete newProductObj._id;
        delete newProductObj.__v;
        delete newProductObj.createdAt;
        delete newProductObj.updatedAt;
        
        newProductObj.slug = `${newProductObj.slug}-${i}`;
        // we can optionally adjust the name but let's keep it the same or append the index
        // newProductObj.name = `${newProductObj.name} Variant ${i}`;
        newProductObj.image = originalImages[i];
        newProductObj.images = [originalImages[i]];
        newProductObj.hoverImage = null;
        
        // Let's generate a new SKU
        newProductObj.sku = newProductObj.slug.toUpperCase().replace(/-/g, "").slice(0, 10) +
          "-" + Math.floor(1000 + Math.random() * 9000);
        
        await Product.create(newProductObj);
        totalCreated++;
      }
    }
  }
  
  console.log(`Migration complete. Created ${totalCreated} new products.`);
  process.exit(0);
}

migrateProducts().catch(console.error);
