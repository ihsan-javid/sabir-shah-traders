"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Layout,
  Sparkles,
  Info,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Package,
  MessageSquare,
  Camera,
  Share2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomizePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        // Only override if sourceValue is not empty or null, so we keep fallbacks
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
        // API returns the settings object directly (not nested under data.settings)
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
        toast.success("Website configuration updated successfully!");
      }
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-5xl space-y-12 text-foreground">
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight uppercase">
            Website Appearance
          </h1>
          <p className="text-muted-foreground mt-2">
            The master control for your store&apos;s content and visual
            identity.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-glow-primary">
          <Save className="h-5 w-5" />{" "}
          {saving ? "Saving..." : "Apply All Changes"}
        </button>
      </motion.div>

      {/* Quick Guide Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="group p-5 rounded-3xl bg-card border border-border flex items-center justify-between hover:bg-muted transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Manage Products</div>
              <div className="text-xs text-muted-foreground">
                Add, edit or remove items from your store.
              </div>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
        <Link
          href="/admin/reviews"
          className="group p-5 rounded-3xl bg-card border border-border flex items-center justify-between hover:bg-muted transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Moderate Reviews</div>
              <div className="text-xs text-muted-foreground">
                See and manage customer testimonials.
              </div>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
        </Link>
      </motion.div>

      <div className="grid gap-8">
        {/* Hero Section */}
        <motion.div
          variants={item}
          className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-primary shadow-inner border border-border">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight leading-none text-foreground">
                Hero & Branding
              </h3>
              <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-black opacity-60">
                The first thing visitors see
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                  Announcement Bar
                </label>
                <input
                  type="text"
                  value={config.announcementBar}
                  onChange={(e) =>
                    setConfig({ ...config, announcementBar: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-4 bg-muted/50 border border-border rounded-2xl px-5 py-3">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) =>
                      setConfig({ ...config, accentColor: e.target.value })
                    }
                    className="h-10 w-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <code className="text-sm text-primary font-mono font-bold">
                    {config.accentColor}
                  </code>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                  Hero Main Title
                </label>
                <textarea
                  value={config.heroTitle}
                  onChange={(e) =>
                    setConfig({ ...config, heroTitle: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-3xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] text-lg font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                  Hero Button Label
                </label>
                <input
                  type="text"
                  value={config.heroButtonText}
                  onChange={(e) =>
                    setConfig({ ...config, heroButtonText: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                  placeholder="e.g. Shop Now"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                Hero Subtext
              </label>
              <textarea
                value={config.heroDescription}
                onChange={(e) =>
                  setConfig({ ...config, heroDescription: e.target.value })
                }
                className="w-full bg-muted/50 border border-border rounded-3xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] text-muted-foreground font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">
                Hero Image
              </label>
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border bg-card flex items-center justify-center overflow-hidden flex-shrink-0">
                  {config.heroImage ?
                    <img src={config.heroImage} alt="" className="h-full w-full object-cover" />
                  : <Camera className="h-8 w-8 text-muted-foreground/30" />}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Paste a Cloudinary image URL or upload via the{" "}
                    <Link href="/admin/media" className="text-primary underline">Media Library</Link>.
                  </p>
                  <input
                    type="text"
                    value={config.heroImage}
                    onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Management */}
        <motion.div
          variants={item}
          className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Layout className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Sections & Navigation
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Supplements Section Title
              </label>
              <input
                value={config.supplementsTitle}
                onChange={(e) =>
                  setConfig({ ...config, supplementsTitle: e.target.value })
                }
                className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Electronics Section Title
              </label>
              <input
                value={config.electronicsTitle}
                onChange={(e) =>
                  setConfig({ ...config, electronicsTitle: e.target.value })
                }
                className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
              />
            </div>
          </div>
        </motion.div>

        {/* Footer & Policy */}
        <motion.div
          variants={item}
          className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Footer & Delivery Info
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Copyright Text
                </label>
                <input
                  value={config.footerCopyright}
                  onChange={(e) =>
                    setConfig({ ...config, footerCopyright: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Delivery Estimate
                </label>
                <input
                  value={config.deliveryEstimate}
                  onChange={(e) =>
                    setConfig({ ...config, deliveryEstimate: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Footer "About Us" Brief
              </label>
              <textarea
                rows={4}
                value={config.footerAbout}
                onChange={(e) =>
                  setConfig({ ...config, footerAbout: e.target.value })
                }
                className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Content Management */}
        <motion.div variants={item} className="grid lg:grid-cols-2 gap-8">
          {/* About Section */}
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                About Content
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-2 block">
                  Heading
                </label>
                <input
                  type="text"
                  value={config.aboutTitle}
                  onChange={(e) =>
                    setConfig({ ...config, aboutTitle: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-2 block">
                  Story / Vision
                </label>
                <textarea
                  rows={5}
                  value={config.aboutText}
                  onChange={(e) =>
                    setConfig({ ...config, aboutText: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-2xl p-5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social Section */}
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10 space-y-10 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                  Contact Info
                </h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">
                      Phone
                    </label>
                    <input
                      value={config.contactPhone}
                      onChange={(e) =>
                        setConfig({ ...config, contactPhone: e.target.value })
                      }
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">
                      Email
                    </label>
                    <input
                      value={config.contactEmail}
                      onChange={(e) =>
                        setConfig({ ...config, contactEmail: e.target.value })
                      }
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">
                    Address
                  </label>
                  <input
                    value={config.contactAddress}
                    onChange={(e) =>
                      setConfig({ ...config, contactAddress: e.target.value })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                  Social Links
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2 border border-border focus-within:border-primary/50 transition-colors">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Instagram URL"
                    value={config.socialLinks?.instagram}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        socialLinks: {
                          ...config.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="bg-transparent border-none outline-none flex-1 text-sm py-1 text-foreground"
                  />
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2 border border-border focus-within:border-primary/50 transition-colors">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Twitter URL"
                    value={config.socialLinks?.twitter}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        socialLinks: {
                          ...config.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="bg-transparent border-none outline-none flex-1 text-sm py-1 text-foreground"
                  />
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2 border border-border focus-within:border-primary/50 transition-colors">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Facebook URL"
                    value={config.socialLinks?.facebook}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        socialLinks: {
                          ...config.socialLinks,
                          facebook: e.target.value,
                        },
                      })
                    }
                    className="bg-transparent border-none outline-none flex-1 text-sm py-1 text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advanced CMS */}
        <motion.div
          variants={item}
          className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
              <Layout className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Advanced CMS & Labels
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">
                Global Messaging
              </h4>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Shipping Message (Checkout/Cart)
                </label>
                <input
                  value={config.shippingMessage}
                  onChange={(e) =>
                    setConfig({ ...config, shippingMessage: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2 mt-8">
                UI Labels
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                    Add to Cart Button
                  </label>
                  <input
                    value={config.uiLabels?.addToCart}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        uiLabels: {
                          ...config.uiLabels,
                          addToCart: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                    Buy Now Button
                  </label>
                  <input
                    value={config.uiLabels?.buyNow}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        uiLabels: {
                          ...config.uiLabels,
                          buyNow: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                    Checkout Button
                  </label>
                  <input
                    value={config.uiLabels?.checkout}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        uiLabels: {
                          ...config.uiLabels,
                          checkout: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                    Shop Now Button
                  </label>
                  <input
                    value={config.uiLabels?.shopNow}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        uiLabels: {
                          ...config.uiLabels,
                          shopNow: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">
                Informational Pages
              </h4>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Terms of Service
                </label>
                <textarea
                  rows={4}
                  value={config.informationalPages?.termsOfService}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      informationalPages: {
                        ...config.informationalPages,
                        termsOfService: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Privacy Policy
                </label>
                <textarea
                  rows={4}
                  value={config.informationalPages?.privacyPolicy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      informationalPages: {
                        ...config.informationalPages,
                        privacyPolicy: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Refund Policy
                </label>
                <textarea
                  rows={4}
                  value={config.informationalPages?.refundPolicy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      informationalPages: {
                        ...config.informationalPages,
                        refundPolicy: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={item}
        className="p-8 rounded-3xl border border-dashed border-border bg-muted/30 text-center shadow-inner">
        <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-4 animate-pulse" />
        <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
          Your changes are applied globally across the entire website.
        </div>
      </motion.div>
    </motion.div>
  );
}
