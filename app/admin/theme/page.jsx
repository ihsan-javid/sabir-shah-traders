"use client";

import { useState, useEffect } from "react";
import {
  Paintbrush,
  Sparkles,
  Layout,
  Save,
  Check,
  Eye,
  Type,
  Camera,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AdminButton } from "@/components/admin/AdminShared";

const COLOR_PRESETS = [
  { name: "Emerald Green", value: "#1E7A46", desc: "Organic & Healthy" },
  { name: "Luxury Gold", value: "#D4AF37", desc: "Sleek & Exclusive" },
  { name: "Tech Cobalt", value: "#2563EB", desc: "Modern & Bold" },
  { name: "Amber Orange", value: "#EA580C", desc: "Vibrant & Active" },
  { name: "Sleek Charcoal", value: "#374151", desc: "Minimal & Premium" },
];

export default function ThemeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [theme, setTheme] = useState({
    accentColor: "#1E7A46",
    announcementBar: "Free Delivery on All Orders Across Pakistan",
    showAnnouncement: true,
    heroTitle: "Fuel your strength. Trust your source.",
    heroDescription: "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves.",
    heroButtonText: "Shop Nutrition",
    heroImage: "https://res.cloudinary.com/dxhvfs4he/image/upload/v1779030421/sabir-shah/assets/new-hero-image.webp",
  });

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setTheme((prev) => ({
            ...prev,
            accentColor: data.accentColor || prev.accentColor,
            announcementBar: data.announcementBar || prev.announcementBar,
            showAnnouncement: data.showAnnouncement !== undefined ? data.showAnnouncement : prev.showAnnouncement,
            heroTitle: data.heroTitle || prev.heroTitle,
            heroDescription: data.heroDescription || prev.heroDescription,
            heroButtonText: data.heroButtonText || prev.heroButtonText,
            heroImage: data.heroImage || prev.heroImage,
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });

      if (res.ok) {
        setSaved(true);
        toast.success("Theme settings saved successfully!");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error("Failed to save theme settings");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading Customizer...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <Paintbrush className="h-6 w-6 text-primary" /> Theme & Brand settings
          </h1>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-semibold">
            Define colors, hero banners, and brand typography across the storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="primary"
            className={saved ? "bg-emerald-500 hover:bg-emerald-600 text-white font-bold" : "font-bold"}
            icon={saved ? Check : Save}
            loading={saving}
            onClick={handleSave}
          >
            {saved ? "Synchronized" : "Apply Aesthetics"}
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Color Palettes Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Paintbrush className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Accent Theme Color</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Storefront global accent scheme</p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setTheme({ ...theme, accentColor: preset.value })}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    theme.accentColor.toLowerCase() === preset.value.toLowerCase()
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className="h-4.5 w-4.5 rounded-md border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="text-[11px] font-black text-slate-700 truncate">{preset.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">{preset.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="h-11 w-11 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Custom Hex Value</label>
                  <code className="block text-sm font-mono font-bold text-slate-700 select-all uppercase">
                    {theme.accentColor}
                  </code>
                </div>
              </div>
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                className="w-full sm:w-28 text-center uppercase font-mono font-bold text-xs bg-white border border-slate-200 rounded-lg py-2.5"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Announcement Bar & Header Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Announcement Bar</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Vibrant promo header text</p>
                </div>
              </div>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme.showAnnouncement}
                  onChange={(e) => setTheme({ ...theme, showAnnouncement: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/20">
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow m-0.5 transition-transform ${
                      theme.showAnnouncement ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            {theme.showAnnouncement && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Announcement Message</label>
                <input
                  type="text"
                  value={theme.announcementBar}
                  onChange={(e) => setTheme({ ...theme, announcementBar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Free Delivery on All Orders Across Pakistan!"
                />
              </div>
            )}
          </div>

          {/* Hero Media Content Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Storefront Hero Visuals</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Main landing content setup</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hero Main Title</label>
                  <input
                    type="text"
                    value={theme.heroTitle}
                    onChange={(e) => setTheme({ ...theme, heroTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Button Call-to-action</label>
                  <input
                    type="text"
                    value={theme.heroButtonText}
                    onChange={(e) => setTheme({ ...theme, heroButtonText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hero Subtext Description</label>
                <textarea
                  value={theme.heroDescription}
                  onChange={(e) => setTheme({ ...theme, heroDescription: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hero Hero Image URL</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={theme.heroImage}
                    onChange={(e) => setTheme({ ...theme, heroImage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono"
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <Link
                    href="/admin/media"
                    className="flex-shrink-0 flex items-center justify-center p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500"
                    title="Upload via Media Library"
                  >
                    <Camera className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live CSS Preview Canvas */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Real-time Live Preview
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
              Storefront Mockup
            </span>
          </div>

          {/* Interactive Card Canvas Wrapper */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative text-white flex flex-col min-h-[460px]">
            {/* Inner Grid Graphic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* announcement bar preview */}
            {theme.showAnnouncement && (
              <div
                className="py-1.5 text-center text-[9px] font-black uppercase tracking-widest select-none transition-all flex items-center justify-center gap-1 shrink-0"
                style={{ backgroundColor: theme.accentColor, color: "#ffffff" }}
              >
                <span>{theme.announcementBar || "Announcement message..."}</span>
              </div>
            )}

            {/* Header Preview */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sabir Shah Traders</span>
              </div>
              <div className="flex gap-2.5 text-[8px] uppercase tracking-widest text-white/50">
                <span>Shop</span>
                <span>Track</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Landing Body Mockup */}
            <div className="flex-1 p-5 flex flex-col justify-between relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-white/70">
                  <Sparkles className="h-3 w-3" style={{ color: theme.accentColor }} />
                  <span>PREMIUM SUPPLS & GEAR</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight select-none">
                  {theme.heroTitle ?
                    theme.heroTitle.split(".").filter(t => t.trim().length > 0).map((part, i) => (
                      <span key={i} className="block">
                        <span style={i > 0 ? { color: theme.accentColor } : {}}>
                          {part.trim()}.
                        </span>
                      </span>
                    ))
                    : "Header title."
                  }
                </h1>

                <p className="text-[9px] text-white/50 leading-relaxed max-w-[200px] select-none">
                  {theme.heroDescription || "Subtext branding statement."}
                </p>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 mt-3 select-none"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {theme.heroButtonText || "Shop Collection"}
                </button>
              </div>

              {/* Floating Hero Image Mockup card */}
              <div className="mt-4 relative self-end w-36 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                {theme.heroImage ? (
                  <img
                    src={theme.heroImage}
                    alt="Mock image"
                    className="absolute inset-0 h-full w-full object-cover select-none"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white/20" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/75 rounded text-[7px] uppercase tracking-wider font-bold">
                  Live View
                </div>
              </div>
            </div>

            {/* Mock footer */}
            <div className="p-4 border-t border-white/5 text-center text-[7px] text-white/30 uppercase tracking-widest shrink-0">
              © 2026 Sabir Shah Traders · Premium Brand Aesthetics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
