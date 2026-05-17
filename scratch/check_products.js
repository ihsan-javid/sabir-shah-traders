const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  images: [String],
  category: String,
  variant: String,
});

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
    const products = await Product.find({}).limit(20);
    
    console.log('Sample Products:');
    products.forEach(p => {
      console.log(`- ${p.name} (${p.category})`);
      console.log(`  Main Image: ${p.image}`);
      console.log(`  Gallery Images: ${p.images?.length || 0}`);
      if (p.images?.length > 0) {
        p.images.forEach((img, i) => console.log(`    [${i}] ${img}`));
      }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkProducts();
