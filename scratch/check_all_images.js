const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkAllImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    products.forEach(p => {
      if (p.images && p.images.length > 1) {
        console.log(`Product: ${p.name}`);
        console.log(`Images:`, p.images);
      }
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkAllImages();
