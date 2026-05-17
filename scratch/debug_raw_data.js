const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const products = await db.collection('products').find({}).toArray();
    console.log('Total products:', products.length);
    if (products.length > 0) {
      console.log('First product keys:', Object.keys(products[0]));
      console.log('First product images:', products[0].images);
      console.log('First product name:', products[0].name);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugData();
