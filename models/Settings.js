import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Fuel your strength. Trust your source.",
    },
    heroDescription: {
      type: String,
      default:
        "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves.",
    },
    heroButtonText: { type: String, default: "Shop Now" },
    heroImage: { type: String, default: "" },
    aboutTitle: { type: String, default: "The Sabir Shah Legacy" },
    aboutText: {
      type: String,
      default:
        "Providing Pakistan with the highest quality electronics and supplements for over a decade.",
    },
    contactPhone: { type: String, default: "+92 300 0000000" },
    contactEmail: { type: String, default: "info@sabirshah.com" },
    contactAddress: { type: String, default: "Main Market, Lahore, Pakistan" },
    whatsappNumber: { type: String, default: "923000000000" },
    accentColor: { type: String, default: "#10E891" },
    announcementBar: { type: String, default: "Free Delivery on All Orders" },
    showAnnouncement: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    storeName: { type: String, default: "Sabir Shah Traders" },

    supplementsTitle: { type: String, default: "Premium Supplements" },
    electronicsTitle: { type: String, default: "Tech & Gadgets" },
    footerCopyright: {
      type: String,
      default: "© 2024 Sabir Shah Traders. All Rights Reserved.",
    },
    deliveryInfo: {
      type: String,
      default: "Standard Delivery: 2-4 Working Days",
    },

    socialLinks: {
      instagram: { type: String, default: "#" },
      twitter: { type: String, default: "#" },
      facebook: { type: String, default: "#" },
    },

    deliveryFee: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },

    // Detailed Configuration
    shipping: {
      freeShippingGlobal: { type: Boolean, default: false },
      expressEnabled: { type: Boolean, default: false },
      expressRate: { type: Number, default: 0 },
    },

    tax: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0 },
      label: { type: String, default: "GST" },
      inclusive: { type: Boolean, default: false },
    },

    notifications: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      lowStockThreshold: { type: Number, default: 5 },
      newReview: { type: Boolean, default: true },
    },

    seo: {
      title: {
        type: String,
        default: "Sabir Shah Traders — Premium Electronics & Supplements",
      },
      description: {
        type: String,
        default:
          "Pakistan's trusted online store for premium electronics and authentic food supplements. Cash on delivery available.",
      },
      keywords: {
        type: String,
        default: "electronics, supplements, pakistan, ecommerce",
      },
      ogImage: { type: String, default: "/images/og-image.jpg" },
      titleTemplate: {
        type: String,
        default: "%s — Sabir Shah Traders",
      },
      defaultDescription: {
        type: String,
        default:
          "Pakistan's trusted online store for premium electronics and authentic food supplements. Cash on delivery available.",
      },
      googleAnalyticsId: {
        type: String,
        default: "",
      },
      googleConsoleVerification: {
        type: String,
        default: "",
      },
      facebookPixelId: {
        type: String,
        default: "",
      },
      robotsTxt: {
        type: String,
        default: "User-agent: *\nAllow: /\n\nSitemap: https://sabirshahtraders.com/sitemap.xml",
      },
      canonicalBase: {
        type: String,
        default: "https://sabirshahtraders.com",
      },
    },

    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 }, // minutes
      loginAttemptLimit: { type: Number, default: 5 },
    },

    // CMS Fields
    shippingMessage: {
      type: String,
      default: "Free shipping nationwide on all orders above PKR 5,000!",
    },

    uiLabels: {
      addToCart: { type: String, default: "Add to Cart" },
      buyNow: { type: String, default: "Buy Now" },
      checkout: { type: String, default: "Checkout" },
      shopNow: { type: String, default: "Shop Now" },
    },

    informationalPages: {
      termsOfService: { type: String, default: "" },
      privacyPolicy: { type: String, default: "" },
      refundPolicy: { type: String, default: "" },
      shippingPolicy: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
