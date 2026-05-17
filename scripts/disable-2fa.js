import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    console.log("Loading database modules dynamically...");
    const { connectDB } = await import("../lib/mongodb.js");
    const Admin = (await import("../models/Admin.js")).default;

    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Finding admin user...");
    const admin = await Admin.findOne({ username: "admin" });
    if (!admin) {
      console.log("Admin user 'admin' not found in database!");
      process.exit(1);
    }
    
    console.log("Found admin user! Current 2FA enabled state:", admin.twoFactorEnabled);
    
    admin.twoFactorEnabled = false;
    admin.twoFactorSecret = null;
    await admin.save();
    
    console.log("Successfully disabled 2FA for 'admin' user!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to disable 2FA:", err);
    process.exit(1);
  }
}

run();
