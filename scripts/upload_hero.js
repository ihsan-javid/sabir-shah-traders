const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagePath = "C:\\Users\\Ihsan Javid\\Desktop\\4813c1235733483.68dd3a5b333a2.webp";

cloudinary.uploader.upload(imagePath, {
  folder: "sabir-shah/assets",
  public_id: "new-hero-image"
}, function(error, result) {
  if (error) {
    console.error("Upload failed:", error);
  } else {
    console.log("Upload successful!");
    console.log("URL:", result.secure_url);
  }
});
