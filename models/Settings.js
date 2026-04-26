import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Fuel your strength. Trust your source." },
    heroDescription: { type: String, default: "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves." },
    aboutTitle: { type: String, default: "The Sabir Shah Legacy" },
    aboutText: { type: String, default: "Providing Pakistan with the highest quality electronics and supplements for over a decade." },
    contactPhone: { type: String, default: "+92 300 0000000" },
    contactEmail: { type: String, default: "info@sabirshah.com" },
    contactAddress: { type: String, default: "Main Market, Lahore, Pakistan" },
    accentColor: { type: String, default: "#10E891" },
    announcementBar: { type: String, default: "Free Delivery on orders over Rs 5,000" },
    socialLinks: {
      instagram: { type: String, default: "#" },
      twitter: { type: String, default: "#" },
      facebook: { type: String, default: "#" },
    }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
