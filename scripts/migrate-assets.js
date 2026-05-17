const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  const heroPath = path.join(__dirname, "../public/hero-image.png");
  const logoPath = path.join(__dirname, "../public/logo.ico");

  console.log("Starting asset migration to Cloudinary...");

  // 1. Upload Hero Image
  if (fs.existsSync(heroPath)) {
    console.log("Uploading hero-image.png...");
    const heroResult = await cloudinary.uploader.upload(heroPath, {
      folder: "sabir-shah/assets",
      public_id: "hero-image",
      resource_type: "image",
    });
    console.log("Hero Image Secure URL:", heroResult.secure_url);
  } else {
    console.warn("hero-image.png not found locally at", heroPath);
  }

  // 2. Upload Logo Icon
  if (fs.existsSync(logoPath)) {
    console.log("Uploading logo.ico...");
    const logoResult = await cloudinary.uploader.upload(logoPath, {
      folder: "sabir-shah/assets",
      public_id: "logo",
      resource_type: "raw", // ICO needs to be raw or image depending on Cloudinary, raw is safest or let it auto detect
    });
    console.log("Logo ICO Secure URL:", logoResult.secure_url);
  } else {
    console.warn("logo.ico not found locally at", logoPath);
  }

  console.log("Migration complete!");
}

run().catch(console.error);
