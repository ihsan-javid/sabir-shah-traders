const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function run() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const admin = await db.collection("admins").findOne();
  console.log("Admin record found:", JSON.stringify(admin, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
