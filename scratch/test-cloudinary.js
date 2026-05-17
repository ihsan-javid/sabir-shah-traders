require("dotenv").config({ path: ".env.local" });
const cloudinary = require("cloudinary").v2;

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Exists" : "Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Exists" : "Missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  try {
    const res = await cloudinary.api.resources({ type: "upload", max_results: 5 });
    console.log("Success! Fetched resources count:", res.resources.length);
    console.log("Resources:", res.resources.map(r => r.public_id));
  } catch (err) {
    console.error("Cloudinary error:", err);
  }
}

run();
