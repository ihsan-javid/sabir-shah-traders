import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectDB } from "../lib/mongodb.js";
import Product from "../models/Product.js";

const products = [
  {
    name: "Pure Whey Isolate - Platinum Series",
    slug: "pure-whey-isolate-platinum",
    tagline: "27g Protein · Zero Sugar · Ultra Filtered",
    description: "Our purest protein formula ever. Using cold-processed cross-flow microfiltration, we deliver 27g of the highest biological value protein per scoop. Perfect for lean muscle definition and rapid recovery.",
    price: 14500,
    category: "supplements",
    subCategory: "protein",
    brand: "VitaForm",
    image: "/images/p-whey.png",
    stock: 25,
    popularity: 98,
    rating: 4.9,
    reviews: 124,
    benefits: ["27g Protein per scoop", "Zero artificial fillers", "Gluten-free", "Lactose friendly"]
  },
  {
    name: "V-Pro Daily Multivitamin",
    slug: "vpro-daily-multivitamin",
    tagline: "Complete A-Z Immune Support",
    description: "Don't leave your health to chance. V-Pro provides a comprehensive blend of 24 essential vitamins and minerals tailored to support a high-performance lifestyle and strong immune system.",
    price: 3500,
    category: "supplements",
    subCategory: "vitamins",
    brand: "VitaForm",
    image: "/p-vitamins.jpg",
    stock: 50,
    popularity: 88,
    rating: 4.6,
    reviews: 210,
    benefits: ["A-Z Vitamins", "Antioxidant blend", "Energy boost", "Once-daily tablet"]
  },
  {
    name: "Pre-Workout Ignition - Watermelon",
    slug: "pre-workout-ignition",
    tagline: "Explosive Energy · Laser Focus · Massive Pump",
    description: "Blast through your plateaus with Ignition. A scientifically backed formula featuring Beta-Alanine, Citrulline Malate, and Caffeine for sustained energy without the crash.",
    price: 5800,
    category: "supplements",
    subCategory: "pre-workout",
    brand: "Apex",
    image: "/p-omega.jpg",
    stock: 30,
    popularity: 94,
    rating: 4.7,
    reviews: 89,
    benefits: ["300mg Caffeine", "6g Citrulline", "Zero Crash", "Great Taste"]
  },
  {
    name: "Omega-3 Ultra Pure",
    slug: "omega-3-ultra-pure",
    tagline: "Heart, Brain & Joint Support",
    description: "Triple-strength fish oil with high concentrations of EPA and DHA. Sourced from deep-sea wild-caught fish and molecularly distilled for purity.",
    price: 4200,
    category: "supplements",
    subCategory: "fish-oil",
    brand: "PureLife",
    image: "/p-omega.jpg",
    stock: 45,
    popularity: 82,
    rating: 4.8,
    reviews: 156,
    benefits: ["1000mg EPA/DHA", "No Fishy Aftertaste", "Mercury Free", "Heart Health"]
  },
  {
    name: "BCAA Recovery 2:1:1",
    slug: "bcaa-recovery",
    tagline: "Essential Amino Acids · Intra-Workout Support",
    description: "Keep your muscles hydrated and fed during the most intense training sessions. Our 2:1:1 ratio is proven to reduce muscle soreness and accelerate repair.",
    price: 4900,
    category: "supplements",
    subCategory: "recovery",
    brand: "Apex",
    image: "/p-whey.jpg",
    stock: 20,
    popularity: 76,
    rating: 4.5,
    reviews: 42,
    benefits: ["5g BCAA", "Electrolyte Blend", "Sugar Free", "Muscle Sparing"]
  },
  {
    name: "Vegan Plant Protein",
    slug: "vegan-plant-protein",
    tagline: "Pea & Rice Blend · Organic Ingredients",
    description: "A complete amino acid profile from plant-based sources. Smooth texture, great taste, and easy on the stomach.",
    price: 12500,
    category: "supplements",
    subCategory: "protein",
    brand: "EcoHealth",
    image: "/p-whey.jpg",
    stock: 15,
    popularity: 70,
    rating: 4.4,
    reviews: 35,
    benefits: ["22g Vegan Protein", "Non-GMO", "Soy Free", "Organic"]
  },
  {
    name: "Creatine Monohydrate - Micronized",
    slug: "creatine-monohydrate",
    tagline: "Strength · Power · Muscle Volume",
    description: "Pure micronized creatine for maximum absorption. The most researched supplement for building explosive power and strength.",
    price: 2800,
    category: "supplements",
    subCategory: "creatine",
    brand: "VitaForm",
    image: "/p-vitamins.jpg",
    stock: 100,
    popularity: 99,
    rating: 4.9,
    reviews: 450,
    benefits: ["5g Pure Creatine", "Unflavored", "Instant Mix", "GMP Certified"]
  },
  {
    name: "ZMA Sleep Support",
    slug: "zma-sleep-support",
    tagline: "Recovery While You Sleep",
    description: "A combination of Zinc, Magnesium, and Vitamin B6. Designed to improve sleep quality and hormone health for better recovery.",
    price: 2200,
    category: "supplements",
    subCategory: "wellness",
    brand: "PureLife",
    image: "/p-vitamins.jpg",
    stock: 60,
    popularity: 65,
    rating: 4.6,
    reviews: 78,
    benefits: ["Deep Sleep", "Muscle Recovery", "Hormone Support", "Nightly Use"]
  },
  {
    name: "Mass Gainer Pro",
    slug: "mass-gainer-pro",
    tagline: "1200 Calories · 50g Protein",
    description: "For those who struggle to gain weight. Packed with complex carbs and premium protein to help you reach your bulking goals.",
    price: 15500,
    category: "supplements",
    subCategory: "mass-gainer",
    brand: "Apex",
    image: "/p-whey.jpg",
    stock: 10,
    popularity: 85,
    rating: 4.7,
    reviews: 112,
    benefits: ["High Calorie", "Complex Carbs", "Vitamins Included", "Tastes Like Milkshake"]
  },
  {
    name: "Ashwagandha KSM-66",
    slug: "ashwagandha-ksm66",
    tagline: "Stress Relief · Cortisol Support",
    description: "Highest concentration full-spectrum root extract. Helps the body adapt to stress and supports cognitive function.",
    price: 2600,
    category: "supplements",
    subCategory: "wellness",
    brand: "EcoHealth",
    image: "/p-vitamins.jpg",
    stock: 40,
    popularity: 91,
    rating: 4.8,
    reviews: 134,
    benefits: ["Reduced Stress", "Better Focus", "Natural Extract", "Non-Drowsy"]
  },
  {
    name: "Zenith X-1 Smartwatch",
    slug: "zenith-x1-smartwatch",
    tagline: "Titanium Case · OLED Display",
    description: "The ultimate companion for the modern athlete. Featuring a rugged titanium case and advanced heart-rate tracking.",
    price: 32000,
    category: "electronics",
    subCategory: "smartwatches",
    brand: "Zenith",
    image: "/images/p-watch.png",
    stock: 12,
    popularity: 95,
    rating: 4.8,
    reviews: 86,
    benefits: ["14-Day battery life", "5ATM Water resistant", "Sleep tracking"]
  },
  {
    name: "Aura Silence ANC Headphones",
    slug: "aura-silence-headphones",
    tagline: "Active Noise Canceling · 40h Playtime",
    description: "Experience sound without the noise. The Aura Silence uses 6 integrated microphones to cancel up to 40dB of ambient sound.",
    price: 28500,
    category: "electronics",
    subCategory: "headphones",
    brand: "Aura",
    image: "/images/p-headphones.png",
    stock: 8,
    popularity: 92,
    rating: 4.7,
    reviews: 54,
    benefits: ["Hybrid ANC technology", "Transparency mode", "Fast charging"]
  },
  {
    name: "Lumina Smart Bulb Kit",
    slug: "lumina-smart-bulb",
    tagline: "16M Colors · Alexa & Google Home",
    description: "Transform your space with the Lumina Smart Kit. Control colors, schedules, and brightness from your phone.",
    price: 4500,
    category: "electronics",
    subCategory: "smart-home",
    brand: "Lumina",
    image: "/images/p-watch.png",
    stock: 25,
    popularity: 78,
    rating: 4.5,
    reviews: 67,
    benefits: ["Energy Efficient", "Voice Control", "RGB Support", "Easy Setup"]
  },
  {
    name: "Sonic Bass Portable Speaker",
    slug: "sonic-bass-speaker",
    tagline: "IPX7 Waterproof · 20W Power",
    description: "The perfect companion for your outdoor adventures. Deep bass and crystal clear highs in a rugged, waterproof shell.",
    price: 8900,
    category: "electronics",
    subCategory: "speakers",
    brand: "Aura",
    image: "/images/p-headphones.png",
    stock: 15,
    popularity: 84,
    rating: 4.6,
    reviews: 92,
    benefits: ["Waterproof", "24h Battery", "Bluetooth 5.3", "Built-in Mic"]
  },
  {
    name: "HyperCharge 100W Power Bank",
    slug: "hypercharge-powerbank",
    tagline: "20,000mAh · Laptop Charging",
    description: "Charge your phone, tablet, and even your laptop on the go. High-capacity and high-speed power in your pocket.",
    price: 12500,
    category: "electronics",
    subCategory: "accessories",
    brand: "Zenith",
    image: "/images/p-watch.png",
    stock: 30,
    popularity: 89,
    rating: 4.7,
    reviews: 145,
    benefits: ["PD 100W Output", "Triple Port", "Digital Display", "Flight Safe"]
  },
  {
    name: "SwiftClick Mechanical Keyboard",
    slug: "swiftclick-keyboard",
    tagline: "RGB Lighting · Tactile Switches",
    description: "A premium mechanical keyboard for typing enthusiasts. Aluminum frame and hotswappable switches.",
    price: 18500,
    category: "electronics",
    subCategory: "peripherals",
    brand: "Aura",
    image: "/images/p-headphones.png",
    stock: 10,
    popularity: 72,
    rating: 4.8,
    reviews: 38,
    benefits: ["Mechanical", "RGB Customization", "Wireless/Wired", "Ergonomic"]
  },
  {
    name: "ClearVision 4K Webcam",
    slug: "clearvision-webcam",
    tagline: "4K UHD · Auto Focus · Privacy Cover",
    description: "Look your best on video calls. Sharp 4K resolution and intelligent lighting correction for any environment.",
    price: 9500,
    category: "electronics",
    subCategory: "accessories",
    brand: "Lumina",
    image: "/images/p-watch.png",
    stock: 20,
    popularity: 68,
    rating: 4.4,
    reviews: 56,
    benefits: ["4K Resolution", "Dual Mic", "Tripod Included", "Plug & Play"]
  },
  {
    name: "Orbit VR Headset",
    slug: "orbit-vr-headset",
    tagline: "Wireless VR · 128GB Storage",
    description: "Enter a new world with the Orbit VR. No cables, no sensors, just pure immersive gaming.",
    price: 85000,
    category: "electronics",
    subCategory: "gadgets",
    brand: "Zenith",
    image: "/images/p-watch.png",
    stock: 5,
    popularity: 93,
    rating: 4.9,
    reviews: 212,
    benefits: ["Wireless", "4K Optics", "Hand Tracking", "Huge Library"]
  },
  {
    name: "Nexus Smart Router 6E",
    slug: "nexus-router",
    tagline: "Ultra-Fast Wi-Fi · 6GHz Support",
    description: "Future-proof your home network. Support for the latest 6GHz band means zero interference and blazing speeds.",
    price: 24000,
    category: "electronics",
    subCategory: "networking",
    brand: "Lumina",
    image: "/images/p-watch.png",
    stock: 12,
    popularity: 62,
    rating: 4.3,
    reviews: 24,
    benefits: ["Wi-Fi 6E", "Parental Controls", "Mesh Ready", "Gigabit Ports"]
  },
  {
    name: "Pulse Fit Band",
    slug: "pulse-fit-band",
    tagline: "Heart Rate · Blood Oxygen · Sleep",
    description: "A minimalist fitness tracker for everyone. Tracks all your vitals without the bulk of a full smartwatch.",
    price: 6500,
    category: "electronics",
    subCategory: "smartwatches",
    brand: "Zenith",
    image: "/images/p-watch.png",
    stock: 40,
    popularity: 81,
    rating: 4.5,
    reviews: 310,
    benefits: ["OLED Screen", "20-Day Battery", "IP68", "Vibration Alerts"]
  }
];

async function seed() {
  try {
    console.log("Connecting...");
    await connectDB();
    console.log("Connected.");
    
    console.log("Cleaning...");
    await Product.deleteMany({});
    console.log("Cleaned.");

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`Adding [${i+1}/20]: ${p.name}`);
      await Product.create(p);
    }

    console.log("DONE.");
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}

seed();
