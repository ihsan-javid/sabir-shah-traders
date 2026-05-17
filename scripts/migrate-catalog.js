import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import { connectDB } from "../lib/mongodb.js";
import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER_PATH = path.join(__dirname, "..", "public", "images", "products");

const CATALOG = [
  {
    name: "Premium Whey Isolate",
    slug: "premium-whey-isolate",
    tagline: "27g Protein · Zero Sugar · Ultra Filtered",
    description: "Our purest protein formula ever. Using cold-processed cross-flow microfiltration, we deliver 27g of the highest biological value protein per scoop. Perfect for lean muscle definition and rapid recovery.",
    shortDescription: "Ultra-pure whey isolate filtered for maximum protein and minimum fat.",
    price: 14500,
    category: "supplements",
    subCategory: "whey-protein",
    brand: "VitaForm",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 512,
    benefits: ["27g Protein per scoop", "Zero artificial fillers", "Gluten-free", "Lactose friendly"],
    features: ["Cross-flow microfiltration", "No added sugar", "Instant mixability"],
    specifications: [
      { label: "Protein", value: "27g" },
      { label: "BCAAs", value: "5.5g" },
      { label: "Servings", value: "30" }
    ],
    tags: ["whey", "protein", "isolate", "muscle"],
    stock: 150,
    featured: true,
    bestseller: true,
    sizes: [
      { label: "1KG", price: 6500, stock: 50, sku: "WHEY-ISO-1KG" },
      { label: "2KG", price: 11999, stock: 60, sku: "WHEY-ISO-2KG" },
      { label: "5KG", price: 25000, stock: 40, sku: "WHEY-ISO-5KG" }
    ],
    popularity: 98,
    imageFiles: ["p1.jpeg", "p2.jpeg", "p3.jpeg", "p4.jpeg", "p5.jpeg"]
  },
  {
    name: "Mass Gainer Pro",
    slug: "mass-gainer-pro",
    tagline: "1200 Calories · 50g Protein",
    description: "For those who struggle to gain weight. Packed with complex carbs and premium protein to help you reach your bulking goals.",
    shortDescription: "High-calorie formula for hardgainers and bulking phases.",
    price: 15500,
    category: "supplements",
    subCategory: "mass-gainer",
    brand: "Apex",
    badge: "Popular",
    rating: 4.7,
    reviews: 112,
    benefits: ["High Calorie", "Complex Carbs", "Vitamins Included", "Tastes Like Milkshake"],
    features: ["50g sustained-release protein", "250g complex carbohydrates"],
    specifications: [
      { label: "Calories", value: "1200" },
      { label: "Protein", value: "50g" },
      { label: "Carbs", value: "250g" }
    ],
    tags: ["gainer", "mass", "bulking"],
    stock: 80,
    featured: true,
    bestseller: false,
    sizes: [
      { label: "3KG", price: 8500, stock: 40, sku: "MASS-3KG" },
      { label: "5KG", price: 15500, stock: 30, sku: "MASS-5KG" },
      { label: "10KG", price: 28000, stock: 10, sku: "MASS-10KG" }
    ],
    popularity: 85,
    imageFiles: ["p6.jpeg", "p7.jpeg", "p8.jpeg", "p9.jpeg", "p10.jpeg", "p11.jpeg"]
  },
  {
    name: "Creatine Monohydrate - Micronized",
    slug: "creatine-monohydrate",
    tagline: "Strength · Power · Muscle Volume",
    description: "Pure micronized creatine for maximum absorption. The most researched supplement for building explosive power and strength.",
    shortDescription: "Pure micronized creatine monohydrate for strength and power.",
    price: 4500,
    category: "supplements",
    subCategory: "creatine",
    brand: "VitaForm",
    badge: "Essential",
    rating: 4.9,
    reviews: 845,
    benefits: ["5g Pure Creatine", "Unflavored", "Instant Mix", "GMP Certified"],
    features: ["Micronized for better absorption", "No fillers or additives"],
    specifications: [
      { label: "Creatine per serving", value: "5g" },
      { label: "Servings", value: "60" }
    ],
    tags: ["creatine", "strength", "power"],
    stock: 200,
    featured: true,
    bestseller: true,
    sizes: [
      { label: "300g", price: 2800, stock: 100, sku: "CREA-300G" },
      { label: "500g", price: 4500, stock: 60, sku: "CREA-500G" },
      { label: "1KG", price: 7500, stock: 40, sku: "CREA-1KG" }
    ],
    popularity: 99,
    imageFiles: ["p12.jpeg", "p13.jpeg", "p14.jpeg", "p15.jpeg", "p16.jpeg"]
  },
  {
    name: "Pre-Workout Ignition",
    slug: "pre-workout-ignition",
    tagline: "Explosive Energy · Laser Focus",
    description: "Blast through your plateaus with Ignition. A scientifically backed formula featuring Beta-Alanine, Citrulline Malate, and Caffeine.",
    shortDescription: "Explosive energy and laser focus for intense workouts.",
    price: 5800,
    category: "supplements",
    subCategory: "pre-workout",
    brand: "Apex",
    badge: "Intense",
    rating: 4.8,
    reviews: 320,
    benefits: ["300mg Caffeine", "6g Citrulline", "Zero Crash", "Massive Pump"],
    features: ["Clinical doses", "Incredible flavors"],
    specifications: [
      { label: "Caffeine", value: "300mg" },
      { label: "Citrulline", value: "6g" },
      { label: "Beta-Alanine", value: "3.2g" }
    ],
    tags: ["preworkout", "energy", "pump", "focus"],
    stock: 120,
    featured: false,
    bestseller: true,
    sizes: [
      { label: "30 Servings", price: 5800, stock: 80, sku: "PRE-30S" },
      { label: "60 Servings", price: 9500, stock: 40, sku: "PRE-60S" }
    ],
    popularity: 94,
    imageFiles: ["p17.jpeg", "p18.jpeg", "p19.jpeg", "p20.jpeg", "p21.jpeg", "p22.jpeg"]
  },
  {
    name: "BCAA Recovery 2:1:1",
    slug: "bcaa-recovery",
    tagline: "Essential Amino Acids · Intra-Workout",
    description: "Keep your muscles hydrated and fed during the most intense training sessions. Our 2:1:1 ratio is proven to reduce muscle soreness.",
    shortDescription: "Optimal 2:1:1 BCAA ratio for intra-workout and recovery.",
    price: 4900,
    category: "supplements",
    subCategory: "amino-acids",
    brand: "PureLife",
    badge: "",
    rating: 4.6,
    reviews: 215,
    benefits: ["5g BCAA", "Electrolyte Blend", "Sugar Free", "Muscle Sparing"],
    features: ["Added electrolytes for hydration", "Refreshing flavors"],
    specifications: [
      { label: "BCAA per serving", value: "5g" },
      { label: "Ratio", value: "2:1:1" }
    ],
    tags: ["bcaa", "recovery", "amino", "hydration"],
    stock: 90,
    featured: false,
    bestseller: false,
    sizes: [
      { label: "30 Servings", price: 4900, stock: 60, sku: "BCAA-30S" },
      { label: "60 Servings", price: 8500, stock: 30, sku: "BCAA-60S" }
    ],
    popularity: 76,
    imageFiles: ["p23.jpeg", "p24.jpeg", "p25.jpeg", "p26.jpeg", "p27.jpeg", "p28.jpeg"]
  },
  {
    name: "V-Pro Daily Multivitamin",
    slug: "vpro-daily-multivitamin",
    tagline: "Complete A-Z Immune Support",
    description: "Don't leave your health to chance. V-Pro provides a comprehensive blend of 24 essential vitamins and minerals tailored to support a high-performance lifestyle.",
    shortDescription: "Comprehensive daily vitamin and mineral blend.",
    price: 3500,
    category: "supplements",
    subCategory: "vitamins",
    brand: "VitaForm",
    badge: "Health",
    rating: 4.8,
    reviews: 410,
    benefits: ["A-Z Vitamins", "Antioxidant blend", "Energy boost", "Once-daily tablet"],
    features: ["High bioavailability", "Added digestive enzymes"],
    specifications: [
      { label: "Vitamins/Minerals", value: "24" },
      { label: "Serving Size", value: "2 Tablets" }
    ],
    tags: ["vitamins", "health", "immunity", "daily"],
    stock: 300,
    featured: true,
    bestseller: true,
    sizes: [
      { label: "60 Tablets", price: 2000, stock: 150, sku: "MULTI-60T" },
      { label: "120 Tablets", price: 3500, stock: 100, sku: "MULTI-120T" },
      { label: "240 Tablets", price: 6000, stock: 50, sku: "MULTI-240T" }
    ],
    popularity: 88,
    imageFiles: ["p29.jpeg", "p30.jpeg", "p31.jpeg", "p32.jpeg", "p33.jpeg", "p34.jpeg"]
  },
  {
    name: "Omega-3 Ultra Pure",
    slug: "omega-3-ultra-pure",
    tagline: "Heart, Brain & Joint Support",
    description: "Triple-strength fish oil with high concentrations of EPA and DHA. Sourced from deep-sea wild-caught fish and molecularly distilled for purity.",
    shortDescription: "Triple-strength fish oil for cardiovascular and joint support.",
    price: 4200,
    category: "supplements",
    subCategory: "health",
    brand: "PureLife",
    badge: "",
    rating: 4.9,
    reviews: 280,
    benefits: ["1000mg EPA/DHA", "No Fishy Aftertaste", "Mercury Free", "Heart Health"],
    features: ["Enteric coated", "Molecularly distilled"],
    specifications: [
      { label: "Total Omega-3", value: "1200mg" },
      { label: "EPA/DHA", value: "1000mg" }
    ],
    tags: ["omega3", "fishoil", "heart", "joints"],
    stock: 140,
    featured: false,
    bestseller: true,
    sizes: [
      { label: "60 Softgels", price: 2500, stock: 60, sku: "OMG-60S" },
      { label: "120 Softgels", price: 4200, stock: 50, sku: "OMG-120S" },
      { label: "240 Softgels", price: 7500, stock: 30, sku: "OMG-240S" }
    ],
    popularity: 92,
    imageFiles: ["p35.jpeg", "p36.jpeg", "p37.jpeg", "p38.jpeg", "p39.jpeg", "p40.jpeg"]
  },
  {
    name: "Thermogenic Fat Burner",
    slug: "thermogenic-fat-burner",
    tagline: "Metabolism · Energy · Appetite Control",
    description: "Accelerate your fat loss journey with our potent thermogenic formula. Designed to boost metabolism, increase energy, and help control appetite.",
    shortDescription: "Potent thermogenic to support metabolism and fat loss.",
    price: 5500,
    category: "supplements",
    subCategory: "fat-burner",
    brand: "Apex",
    badge: "Hot",
    rating: 4.5,
    reviews: 190,
    benefits: ["Boosts Metabolism", "Increases Energy", "Controls Appetite", "Thermogenic"],
    features: ["Clinically researched ingredients", "Fast-acting capsules"],
    specifications: [
      { label: "Green Tea Extract", value: "400mg" },
      { label: "L-Carnitine", value: "500mg" }
    ],
    tags: ["fatburner", "weightloss", "energy", "metabolism"],
    stock: 75,
    featured: false,
    bestseller: false,
    sizes: [
      { label: "60 Capsules", price: 5500, stock: 75, sku: "BURN-60C" }
    ],
    popularity: 78,
    imageFiles: ["p41.jpeg", "p42.jpeg", "p43.jpeg", "p44.jpeg", "p45.jpeg", "p46.jpeg"]
  },
  {
    name: "Vegan Plant Protein",
    slug: "vegan-plant-protein",
    tagline: "Pea & Rice Blend · Organic",
    description: "A complete amino acid profile from plant-based sources. Smooth texture, great taste, and easy on the stomach.",
    shortDescription: "Organic plant-based protein blend for vegan athletes.",
    price: 12500,
    category: "supplements",
    subCategory: "vegan-protein",
    brand: "PureLife",
    badge: "Vegan",
    rating: 4.6,
    reviews: 145,
    benefits: ["22g Vegan Protein", "Non-GMO", "Soy Free", "Organic"],
    features: ["Complete amino acid profile", "Naturally sweetened"],
    specifications: [
      { label: "Protein", value: "22g" },
      { label: "Source", value: "Pea & Rice" }
    ],
    tags: ["vegan", "plant", "protein", "organic"],
    stock: 60,
    featured: true,
    bestseller: false,
    sizes: [
      { label: "1KG", price: 6800, stock: 30, sku: "VEG-1KG" },
      { label: "2KG", price: 12500, stock: 30, sku: "VEG-2KG" }
    ],
    popularity: 81,
    imageFiles: ["p47.jpeg", "p48.jpeg", "p49.jpeg", "p50.jpeg", "p51.jpeg", "p52.jpeg", "p53.jpeg", "p54.jpeg"]
  },
  {
    name: "ZMA Sleep Support",
    slug: "zma-sleep-support",
    tagline: "Recovery While You Sleep",
    description: "A combination of Zinc, Magnesium, and Vitamin B6. Designed to improve sleep quality and hormone health for better recovery.",
    shortDescription: "Zinc, Magnesium, and B6 blend for sleep and recovery.",
    price: 3200,
    category: "supplements",
    subCategory: "health",
    brand: "VitaForm",
    badge: "Recovery",
    rating: 4.7,
    reviews: 160,
    benefits: ["Deep Sleep", "Muscle Recovery", "Hormone Support", "Nightly Use"],
    features: ["Highly absorbable forms", "Optimal ratio"],
    specifications: [
      { label: "Zinc", value: "30mg" },
      { label: "Magnesium", value: "450mg" },
      { label: "Vitamin B6", value: "10.5mg" }
    ],
    tags: ["zma", "sleep", "recovery", "hormones"],
    stock: 110,
    featured: false,
    bestseller: false,
    sizes: [
      { label: "90 Capsules", price: 3200, stock: 110, sku: "ZMA-90C" }
    ],
    popularity: 72,
    imageFiles: ["p55.jpeg", "p56.jpeg", "p57.jpeg", "p58.jpeg", "p59.jpeg", "p60.jpeg", "p61.jpeg"]
  }
];

async function uploadImage(localFilename) {
  const localPath = path.join(FOLDER_PATH, localFilename);
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️ Warning: Local image not found: ${localPath}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "sabir-shah-ecom/products",
      use_filename: true,
      unique_filename: true,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${localFilename}:`, error);
    return null;
  }
}

async function migrate() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("🗑️ Clearing existing products...");
    await Product.deleteMany({});

    console.log(`🚀 Starting migration for ${CATALOG.length} products...`);

    for (const prodData of CATALOG) {
      console.log(`\n📦 Processing: ${prodData.name}`);
      const { imageFiles, ...productInput } = prodData;
      
      const uploadedImages = [];
      let primaryImage = "";
      let primaryPublicId = "";

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`   Uploading ${file}...`);
        const result = await uploadImage(file);
        
        if (result) {
          uploadedImages.push(result.url);
          if (i === 0) {
            primaryImage = result.url;
            primaryPublicId = result.publicId;
          }
        }
      }

      productInput.images = uploadedImages;
      productInput.image = primaryImage;
      productInput.imagePublicId = primaryPublicId;

      const product = await Product.create(productInput);
      console.log(`   ✅ Created product in DB: ${product.slug} with ${product.images.length} images`);
    }

    console.log("\n🎉 All products migrated successfully!");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
