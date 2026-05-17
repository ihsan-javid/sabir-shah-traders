export const products = [
  {
    _id: "4",
    slug: "pure-whey-protein-2kg",
    name: "Pure Whey Protein — 2kg",
    tagline: "24g protein per scoop",
    description:
      "Premium fast-absorbing whey isolate for lean muscle growth and faster recovery. No artificial fillers.",
    price: 11999,
    image: "/p-whey.jpg",
    hoverImage: "/p-omega.jpg", // Mock secondary image for testing hover
    category: "supplements",
    subCategory: "protein",
    brand: "VitaForm",
    badge: "Best Seller",
    rating: 4.9,
    reviews: 512,
    benefits: [
      "24g Protein / Scoop",
      "Whey Isolate",
      "Fast Absorbing",
      "No Added Sugar",
    ],
    stock: 24,
    sizes: [
      { label: "1KG", price: 6500 },
      { label: "2KG", price: 11999 },
      { label: "5KG", price: 25000 },
    ],
    popularity: 98,
    createdAt: "2025-01-12",
  },
  {
    _id: "5",
    slug: "daily-multivitamin-90-caps",
    name: "Daily Multivitamin — 90 Caps",
    tagline: "Complete A–Z formula",
    description:
      "A complete daily blend of essential vitamins and minerals to support immunity, energy and overall wellness.",
    price: 2999,
    image: "/p-vitamins.jpg",
    category: "supplements",
    subCategory: "vitamins",
    brand: "VitaForm",
    rating: 4.7,
    reviews: 241,
    benefits: [
      "A–Z Vitamins",
      "Immunity Support",
      "Daily Energy",
      "Vegetarian",
    ],
    stock: 60,
    popularity: 84,
    createdAt: "2024-11-03",
  },
  {
    _id: "6",
    slug: "omega-3-fish-oil-1000mg",
    name: "Omega 3 Fish Oil — 1000mg",
    tagline: "Heart, brain & joint health",
    description:
      "High-potency Omega 3 with EPA and DHA for cardiovascular, cognitive and joint support.",
    price: 3499,
    image: "/p-omega.jpg",
    category: "supplements",
    subCategory: "fish-oil",
    brand: "PureLife",
    badge: "Popular",
    rating: 4.8,
    reviews: 188,
    benefits: [
      "1000mg EPA+DHA",
      "Heart Health",
      "Brain Support",
      "Triple Strength",
    ],
    stock: 0,
    sizes: [
      { label: "30 CAPS", price: 1500 },
      { label: "60 CAPS", price: 2500 },
      { label: "90 CAPS", price: 3499 },
    ],
    popularity: 91,
    createdAt: "2024-09-22",
  },
  {
    _id: "7",
    slug: "iso-whey-isolate-1kg",
    name: "ISO Whey Isolate — 1kg",
    tagline: "27g protein · zero sugar",
    description:
      "Ultra-pure whey isolate filtered for maximum protein and minimum fat. Mixes instantly with no clumps.",
    price: 8499,
    image: "/p-whey.jpg",
    category: "supplements",
    subCategory: "protein",
    brand: "VitaForm",
    badge: "New",
    rating: 4.8,
    reviews: 76,
    benefits: ["27g Protein", "Zero Sugar", "Lactose-Free", "Easy Mixing"],
    stock: 18,
    popularity: 75,
    createdAt: "2025-03-04",
  },
  {
    _id: "8",
    slug: "vitamin-c-1000mg-120-tabs",
    name: "Vitamin C 1000mg — 120 Tabs",
    tagline: "Immunity & antioxidant defense",
    description:
      "High-strength Vitamin C with bioflavonoids. Supports immune health, collagen synthesis and energy.",
    price: 1899,
    image: "/p-vitamins.jpg",
    category: "supplements",
    subCategory: "vitamins",
    brand: "PureLife",
    rating: 4.6,
    reviews: 134,
    benefits: [
      "1000mg Vitamin C",
      "Bioflavonoids",
      "Immune Boost",
      "Antioxidant",
    ],
    stock: 42,
    popularity: 70,
    createdAt: "2024-12-18",
  },
  {
    _id: "9",
    slug: "pre-workout-energy-300g",
    name: "Pre-Workout Energy — 300g",
    tagline: "Explosive pumps & focus",
    description:
      "Caffeine, beta-alanine and citrulline for explosive energy, sharper focus and longer workouts.",
    price: 4999,
    image: "/p-omega.jpg",
    category: "supplements",
    subCategory: "pre-workout",
    brand: "Apex",
    rating: 4.5,
    reviews: 92,
    benefits: ["200mg Caffeine", "Beta-Alanine", "Citrulline", "Sharp Focus"],
    stock: 12,
    popularity: 68,
    createdAt: "2025-02-10",
  },
];

export const formatPKR = (amount) => {
  if (amount === undefined || amount === null) return "Rs 0";
  if (amount === 0) return "Free";
  return `Rs ${amount.toLocaleString("en-PK")}`;
};

export const getProduct = (slug) => products.find((p) => p.slug === slug);

export const byCategory = (cat) => products.filter((p) => p.category === cat);

export const SUB_CATEGORY_LABEL = {
  protein: "Protein",
  vitamins: "Vitamins",
  "fish-oil": "Omega / Fish Oil",
  "pre-workout": "Pre-Workout",
  "mass-gainer": "Mass Gainer",
  wellness: "Wellness",
};
