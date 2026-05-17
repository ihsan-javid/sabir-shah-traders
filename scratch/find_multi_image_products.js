const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  images: [String],
  category: String,
  description: String,
  price: Number,
  stock: Number,
  brand: String,
  tagline: String,
  onSale: Boolean,
  salePrice: Number,
  saleDiscount: Number,
  sizes: Array,
  rating: Number,
  reviews: Number,
  isBestseller: Boolean,
  featured: Boolean,
});

async function findProductsWithManyImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
    // Find products where images array has more than 1 image
    const ps = await Product.find({ 'images.1': { $exists: true } });
    
    console.log(`Found ${ps.length} products with multiple images.`);
    ps.forEach(p => {
      console.log(`- ${p.name} (Images: ${p.images.length})`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

findProductsWithManyImages();
