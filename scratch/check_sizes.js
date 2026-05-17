const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkSizes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const ps = await db.collection('products').find({ name: 'Premium Whey Isolate' }).toArray();
    
    ps.forEach(p => {
      console.log(`Product: ${p.slug}`);
      console.log(`Sizes:`, p.sizes);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkSizes();
