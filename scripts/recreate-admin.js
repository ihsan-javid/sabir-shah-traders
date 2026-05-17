const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is missing");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  const username = "admin";
  const password = "123456";

  console.log(`Hashing password for '${username}'...`);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log("Deleting any existing admin record...");
  await Admin.deleteMany({ username: username });

  console.log("Creating fresh admin record...");
  const admin = new Admin({
    username: username,
    password: hashedPassword,
    role: "admin",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    loginAttempts: 0,
    lockUntil: null,
  });

  await admin.save();
  console.log(`Admin user '${username}' successfully created with password '${password}'!`);

  await mongoose.disconnect();
}

run().catch(console.error);
