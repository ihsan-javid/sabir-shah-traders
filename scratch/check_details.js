const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkDetails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const ps = await db.collection('products').find({ name: 'Premium Whey Isolate' }).toArray();
    
    ps.forEach(p => {
      console.log(`Product: ${p.slug} | Tagline: ${p.tagline} | Brand: ${p.brand}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDetails();
