const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function listAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    products.forEach(p => {
      console.log(`Name: ${p.name} | Image: ${p.image.split('/').pop()}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listAll();
