import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import speakeasy from "speakeasy";

async function run() {
  try {
    console.log("Loading database modules dynamically...");
    const { connectDB } = await import("../lib/mongodb.js");
    const Admin = (await import("../models/Admin.js")).default;

    await connectDB();
    
    const admin = await Admin.findOne({ username: "admin" });
    if (!admin) {
      console.log("Admin not found!");
      process.exit(1);
    }
    
    // Set up a known 2FA secret
    const secret = speakeasy.generateSecret({ name: "Test Admin" });
    admin.twoFactorEnabled = true;
    admin.twoFactorSecret = secret.base32;
    await admin.save();
    console.log("2FA enabled with secret:", admin.twoFactorSecret);

    // Generate current token
    const token = speakeasy.totp({
      secret: admin.twoFactorSecret,
      encoding: "base32",
    });
    console.log("Generated valid TOTP code:", token);

    // Make login request
    console.log("Attempting login...");
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "123456", // Assuming this is correct
        twoFactorCode: token,
      }),
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

run();
