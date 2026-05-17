require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.db.collection('products');
  await collection.updateOne(
    { slug: 'pure-whey-isolate-platinum' },
    { $set: { sizes: [{label: '1KG', price: 5000}, {label: '2KG', price: 9500}] } }
  );
  console.log('Sizes added to Pure Whey.');
  process.exit(0);
});
