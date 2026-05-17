const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  console.log("Connecting to:", uri);
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections in DB:");
  for (const col of collections) {
    console.log(`- ${col.name}`);
    const count = await db.collection(col.name).countDocuments();
    console.log(`  Count: ${count}`);
    if (count > 0) {
      const sample = await db.collection(col.name).findOne();
      console.log(`  Sample keys: ${Object.keys(sample).join(", ")}`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
