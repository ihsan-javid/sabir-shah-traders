"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Layout,
  BookOpen,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Sliders,
  MousePointer,
  Truck,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomizePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  
  const [config, setConfig] = useState({
    heroTitle: "Fuel your strength. Trust your source.",
    heroDescription:
      "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves. From protein to wellness — all in one place.",
    heroButtonText: "Shop Nutrition",
    heroImage: "",
    announcementBar: "Free Delivery on All Orders",
    showAnnouncement: true,
    accentColor: "#10E891",

    // Section Titles
    supplementsTitle: "Premium Supplements",
    electronicsTitle: "Tech & Gadgets",

    // About Section
    aboutTitle: "The Sabir Shah Legacy",
    aboutText:
      "Providing Pakistan with the highest quality electronics and supplements for over a decade.",

    // Contact Info
    contactPhone: "+92 300 0000000",
    contactEmail: "info@sabirshah.com",
    contactAddress: "Main Market, Lahore, Pakistan",

    // Footer & Delivery
    footerCopyright: "© 2026 Sabir Shah Traders",
    footerAbout: "Your trusted source for premium supplements and tech.",
    deliveryEstimate: "3-5 Business Days",
    deliveryTerms: "Free Delivery Nationwide",

    socialLinks: {
      instagram: "#",
      twitter: "#",
      facebook: "#",
    },

    // CMS Fields
    shippingMessage: "Free shipping nationwide on all orders above PKR 5,000!",
    uiLabels: {
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      checkout: "Checkout",
      shopNow: "Shop Now",
    },
    informationalPages: {
      termsOfService: "Terms and conditions apply.",
      privacyPolicy: "We respect your privacy.",
      refundPolicy: "7-day return policy.",
    },
  });

  // Deep merge utility to handle nested objects
  const mergeDeep = (target, source) => {
    const isObject = (obj) => obj && typeof obj === "object";
    if (!isObject(target) || !isObject(source)) return source;
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = sourceValue;
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        if (
          sourceValue !== "" &&
          sourceValue !== null &&
          sourceValue !== undefined
        ) {
          target[key] = sourceValue;
        }
      }
    });
    return target;
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          setConfig((prev) => mergeDeep({ ...prev }, data));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Website appearance updated successfully!");
      }
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  const tabs = [
    { id: "branding", label: "Branding & Hero", icon: Layout, desc: "Visual theme, hero slider, banners" },
    { id: "story", label: "Story & About", icon: BookOpen, desc: "Legacy stories, footer about content" },
    { id: "contact", label: "Contact & Socials", icon: Phone, desc: "Addresses, phones, social handles" },
    { id: "navigation", label: "Navigation Titles", icon: Sliders, desc: "Store catalogs, menu labels" },
    { id: "cta", label: "CTA & UI Buttons", icon: MousePointer, desc: "Interactive button wordings" },
    { id: "delivery", label: "Delivery & Terms", icon: Truck, desc: "Estimates, shipping policies" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-foreground pb-12">
      {/* Top Banner Header */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-br from-card to-muted/10 p-6 md:p-8 overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
            Content Manager
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Control the visual styling, copy headlines, branding materials, custom page buttons, and dynamic text fields across your entire e-commerce store.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="relative z-10 flex items-center justify-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary/95 transition-all shadow-glow-primary active:scale-95 disabled:opacity-60">
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Apply All Changes"}
        </button>
        <div className="absolute right-0 top-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Tabs Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isActive
                    ? "bg-primary/[0.03] border-primary text-foreground shadow-sm"
                    : "bg-card border-border/50 text-muted-foreground hover:bg-muted/30 hover:border-border"
                }`}>
                <div
                  className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border/80"
                  }`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider block">
                    {tab.label}
                  </div>
                  <span className="text-[10px] opacity-75 mt-0.5 block truncate">
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Tab Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
              
              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Branding & Identity</h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure global announcement banners, primary buttons, and hero highlights.</p>
                  </div>
                  <hr className="border-border/60" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Announcement Bar Text
                      </label>
                      <input
                        type="text"
                        value={config.announcementBar || ""}
                        onChange={(e) => setConfig({ ...config, announcementBar: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                        placeholder="e.g. Free Delivery Nationwide"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Primary Accent Color
                      </label>
                      <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl bg-muted/10">
                        <input
                          type="color"
                          value={config.accentColor || "#10E891"}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <code className="text-xs font-mono font-black text-primary uppercase tracking-wider">{config.accentColor}</code>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
                      Hero Slider Content
                    </label>
                    <div className="p-5 border border-border/80 rounded-2xl bg-muted/10 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Hero Title Headlines</span>
                        <textarea
                          rows={2}
                          value={config.heroTitle || ""}
                          onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                          className="w-full p-4 bg-card border border-border rounded-xl text-sm font-extrabold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Hero Subtext Description</span>
                        <textarea
                          rows={3}
                          value={config.heroDescription || ""}
                          onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                          className="w-full p-4 bg-card border border-border rounded-xl text-xs text-muted-foreground font-medium leading-relaxed focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Hero Action Button Text</span>
                          <input
                            type="text"
                            value={config.heroButtonText || ""}
                            onChange={(e) => setConfig({ ...config, heroButtonText: e.target.value })}
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Hero Primary Cover Image URL</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={config.heroImage || ""}
                              onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                              className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-mono"
                              placeholder="https://res.cloudinary.com/..."
                            />
                            <Link
                              href="/admin/media"
                              className="px-3 flex items-center justify-center bg-muted border border-border hover:bg-muted-foreground/10 rounded-xl transition-all"
                              title="Media Library">
                              <Camera className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "story" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Story & Legacy Info</h3>
                    <p className="text-xs text-muted-foreground mt-1">Add rich detail to the brand story block presented on your storefront.</p>
                  </div>
                  <hr className="border-border/60" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        About Block Title
                      </label>
                      <input
                        type="text"
                        value={config.aboutTitle || ""}
                        onChange={(e) => setConfig({ ...config, aboutTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        About Story Description / Copy
                      </label>
                      <textarea
                        rows={6}
                        value={config.aboutText || ""}
                        onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
                        className="w-full p-4 bg-muted/30 border border-border rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Footer Short About Text
                      </label>
                      <textarea
                        rows={3}
                        value={config.footerAbout || ""}
                        onChange={(e) => setConfig({ ...config, footerAbout: e.target.value })}
                        className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Contact Channels & Social Handles</h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure physical addresses, phone numbers, dynamic emails, and direct social URLs.</p>
                  </div>
                  <hr className="border-border/60" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        WhatsApp / Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <input
                          type="text"
                          value={config.whatsappNumber || ""}
                          onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value, contactPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Official Inquiry Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <input
                          type="email"
                          value={config.contactEmail || ""}
                          onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
                      Social Presence Links
                    </label>
                    <div className="grid grid-cols-1 gap-3 p-4 bg-muted/10 border border-border rounded-2xl">
                      <div className="flex items-center gap-3 px-3 py-1 bg-card border border-border/80 rounded-xl focus-within:border-primary/50 transition-colors">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <input
                          placeholder="Instagram URL"
                          value={config.socialLinks?.instagram || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              socialLinks: {
                                ...config.socialLinks,
                                instagram: e.target.value,
                              },
                            })
                          }
                          className="bg-transparent border-0 outline-none flex-1 text-xs py-2 text-foreground font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-3 px-3 py-1 bg-card border border-border/80 rounded-xl focus-within:border-primary/50 transition-colors">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <input
                          placeholder="WhatsApp Chat/Group/Profile Link"
                          value={config.socialLinks?.whatsapp || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              socialLinks: {
                                ...config.socialLinks,
                                whatsapp: e.target.value,
                              },
                            })
                          }
                          className="bg-transparent border-0 outline-none flex-1 text-xs py-2 text-foreground font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-3 px-3 py-1 bg-card border border-border/80 rounded-xl focus-within:border-primary/50 transition-colors">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <input
                          placeholder="Facebook URL"
                          value={config.socialLinks?.facebook || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              socialLinks: {
                                ...config.socialLinks,
                                facebook: e.target.value,
                              },
                            })
                          }
                          className="bg-transparent border-0 outline-none flex-1 text-xs py-2 text-foreground font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "navigation" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Navigation & Section Names</h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure user-friendly headings for catalog sections on home and shop paths.</p>
                  </div>
                  <hr className="border-border/60" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Supplements Grid Title
                      </label>
                      <input
                        type="text"
                        value={config.supplementsTitle || ""}
                        onChange={(e) => setConfig({ ...config, supplementsTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Electronics Grid Title
                      </label>
                      <input
                        type="text"
                        value={config.electronicsTitle || ""}
                        onChange={(e) => setConfig({ ...config, electronicsTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "cta" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">CTA & Dynamic UI Button Labels</h3>
                    <p className="text-xs text-muted-foreground mt-1">Change core button action tags so storefront elements match regional dialect perfectly.</p>
                  </div>
                  <hr className="border-border/60" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Add to Cart Button Label
                      </label>
                      <input
                        type="text"
                        value={config.uiLabels?.addToCart || "Add to Cart"}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            uiLabels: {
                              ...config.uiLabels,
                              addToCart: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Buy Now Button Label
                      </label>
                      <input
                        type="text"
                        value={config.uiLabels?.buyNow || "Buy Now"}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            uiLabels: {
                              ...config.uiLabels,
                              buyNow: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Checkout Button Label
                      </label>
                      <input
                        type="text"
                        value={config.uiLabels?.checkout || "Checkout"}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            uiLabels: {
                              ...config.uiLabels,
                              checkout: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Shop Now Header Label
                      </label>
                      <input
                        type="text"
                        value={config.uiLabels?.shopNow || "Shop Now"}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            uiLabels: {
                              ...config.uiLabels,
                              shopNow: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Delivery Estimates & Policy Briefings</h3>
                    <p className="text-xs text-muted-foreground mt-1">Specify dynamic global messages visible on products checkout paths and customer portals.</p>
                  </div>
                  <hr className="border-border/60" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                        Global Shipping Banner Notification
                      </label>
                      <input
                        type="text"
                        value={config.shippingMessage || ""}
                        onChange={(e) => setConfig({ ...config, shippingMessage: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Free shipping nationwide on all orders above PKR 5,000!"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                          Standard Delivery Estimates
                        </label>
                        <input
                          type="text"
                          value={config.deliveryEstimate || ""}
                          onChange={(e) => setConfig({ ...config, deliveryEstimate: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                          placeholder="e.g. 3-5 Business Days"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2">
                          Dynamic Footer Copyright
                        </label>
                        <input
                          type="text"
                          value={config.footerCopyright || ""}
                          onChange={(e) => setConfig({ ...config, footerCopyright: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative footer details */}
      <div className="p-8 rounded-3xl border border-dashed border-border bg-muted/20 text-center shadow-inner">
        <Sparkles className="h-6 w-6 text-primary/60 mx-auto mb-3 animate-pulse" />
        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
          Content settings auto-sync dynamically across frontend routes. No deployment pipeline required.
        </div>
      </div>
    </div>
  );
}
