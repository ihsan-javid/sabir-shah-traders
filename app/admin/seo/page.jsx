"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Save,
  Loader2,
  ExternalLink,
  Code,
  FileText,
  BarChart,
  Link as LinkIcon,
  Shield,
  Eye,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminInput,
  AdminTextarea,
  AdminPageHeader,
  AdminSpinner,
} from "@/components/admin/AdminShared";

export default function SEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: "/images/og-image.jpg",
    titleTemplate: "%s — Sabir Shah Traders",
    defaultDescription: "Pakistan's trusted online store for premium electronics and authentic food supplements. Cash on delivery available.",
    googleAnalyticsId: "",
    googleConsoleVerification: "",
    facebookPixelId: "",
    robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: https://sabirshahtraders.com/sitemap.xml",
    canonicalBase: "https://sabirshahtraders.com",
  });

  // Media Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState("");

  const fetchMediaForPicker = async () => {
    try {
      setLoadingMedia(true);
      const res = await fetch("/api/admin/media", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (e) {
      console.error("Failed to load media for picker:", e);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      fetchMediaForPicker();
    }
  }, [showPicker]);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.seo) {
          setForm((prev) => ({
            ...prev,
            ...data.seo,
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentRes = await fetch("/api/settings", { credentials: "include" });
      const current = await currentRes.json();

      const res = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current,
          seo: {
            ...current.seo,
            ...form,
          },
        }),
      });

      if (res.ok) {
        toast.success("SEO and Analytics Settings applied immediately!");
      } else {
        toast.error("Failed to sync SEO settings");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const calcScore = (f) => {
    let score = 0;
    // Required Fields (4 required = 80%)
    if (f.titleTemplate && f.titleTemplate.includes("%s")) score += 20;
    if (f.defaultDescription && f.defaultDescription.length >= 80) score += 20;
    if (f.canonicalBase && f.canonicalBase.startsWith("http")) score += 20;
    if (f.ogImage && (f.ogImage.startsWith("/") || f.ogImage.startsWith("http"))) score += 20;

    // Optional Fields (Total 20%)
    if (f.googleAnalyticsId) score += 10;
    if (f.googleConsoleVerification) score += 5;
    if (f.facebookPixelId) score += 5;
    
    return Math.min(100, score);
  };

  const score = calcScore(form);
  const sitemapUrl = `${form.canonicalBase || "https://sabirshahtraders.com"}/sitemap.xml`;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading SEO engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminPageHeader
        title="SEO & Marketing Control"
        description="Configure dynamic title structures, search console validations, custom sitemaps, and real-time tracking pipelines."
        actions={
          <AdminButton
            variant="primary"
            icon={Save}
            loading={saving}
            onClick={handleSave}
          >
            Save SEO Settings
          </AdminButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Preview and Score */}
        <div className="lg:col-span-1 space-y-6">
          {/* Optimization Score */}
          <div className="bg-card rounded-[2rem] border border-border shadow-sm p-6 text-center">
            <div
              className={`text-5xl font-black mb-2 transition-colors duration-500 ${
                score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500"
              }`}
            >
              {score}%
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-4">
              SEO Optimization Score
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${score}%`,
                  backgroundColor: score >= 80 ? "#10E891" : score >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase leading-relaxed tracking-tight">
              {score >= 80
                ? "Excellent coverage! All required SEO metadata tags are configured."
                : "Good start. Add missing analytics tags or base domains to improve discoverability."}
            </p>
          </div>

          {/* Search Result Snippet Preview */}
          <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Search Bot Preview
              </h3>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 truncate font-semibold">
                <Globe className="h-3 w-3" />
                {form.canonicalBase || "https://sabirshahtraders.com"}
              </div>
              <div className="text-blue-600 text-sm font-bold hover:underline cursor-pointer line-clamp-1">
                {form.titleTemplate ? form.titleTemplate.replace("%s", "Premium Supplements") : "Premium Supplements — Sabir Shah Traders"}
              </div>
              <div className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                {form.defaultDescription || "Enter a default fallback description to display here..."}
              </div>
            </div>
          </div>

          {/* Sitemap (Display Only) */}
          <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Auto-Generated Sitemap
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed uppercase">
                The XML sitemap index is automatically compiled and served dynamically to search engines.
              </p>
              <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 border border-border rounded-xl">
                <span className="text-[10px] font-black text-foreground truncate select-all">
                  {sitemapUrl}
                </span>
                <a
                  href={sitemapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Configurations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Standard Meta settings */}
          <AdminCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Metadata & Templates
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure default fallbacks and title schemas for search robots.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AdminLabel required>Site Title Template</AdminLabel>
                  <AdminInput
                    value={form.titleTemplate}
                    onChange={(e) => set("titleTemplate", e.target.value)}
                    placeholder="e.g. %s — Sabir Shah Traders"
                  />
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-1">
                    Use <code className="text-primary font-bold">%s</code> as the placeholder for each page's specific title.
                  </p>
                </div>
                <div>
                  <AdminLabel required>Canonical URL Base Domain</AdminLabel>
                  <AdminInput
                    value={form.canonicalBase}
                    onChange={(e) => set("canonicalBase", e.target.value)}
                    placeholder="e.g. https://sabirshahtraders.com"
                  />
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-1">
                    Used to construct sitemaps and absolute URL elements.
                  </p>
                </div>
              </div>

              <div>
                <AdminLabel required>Default Meta Description (Fallback)</AdminLabel>
                <AdminTextarea
                  value={form.defaultDescription}
                  onChange={(e) => set("defaultDescription", e.target.value)}
                  rows={3}
                  placeholder="Enter a default description for search engines..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AdminLabel>Meta Keywords</AdminLabel>
                  <AdminInput
                    value={form.keywords}
                    onChange={(e) => set("keywords", e.target.value)}
                    placeholder="supplements, electronics, pakistan"
                  />
                </div>
                <div>
                  <AdminLabel required>Default OG Image URL (Fallback)</AdminLabel>
                  <div className="flex gap-2">
                    <AdminInput
                      value={form.ogImage}
                      onChange={(e) => set("ogImage", e.target.value)}
                      placeholder="e.g. https://res.cloudinary.com/..."
                      className="flex-1"
                    />
                    <AdminButton
                      type="button"
                      variant="outline"
                      icon={ImageIcon}
                      onClick={() => {
                        setSelectedMediaUrl(form.ogImage);
                        setShowPicker(true);
                      }}
                      className="px-4 py-2 shrink-0 text-xs font-bold uppercase tracking-wider"
                    >
                      Pick Image
                    </AdminButton>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Section 2: Marketing & Tracking codes */}
          <AdminCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <BarChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Analytics & Trackers
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Directly inject Google Analytics, Google Search Console, and Facebook Pixels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <AdminLabel>Google Analytics ID (GA4)</AdminLabel>
                <AdminInput
                  value={form.googleAnalyticsId}
                  onChange={(e) => set("googleAnalyticsId", e.target.value)}
                  placeholder="e.g. G-XXXXXXXXXX"
                />
              </div>
              <div>
                <AdminLabel>Facebook Pixel ID</AdminLabel>
                <AdminInput
                  value={form.facebookPixelId}
                  onChange={(e) => set("facebookPixelId", e.target.value)}
                  placeholder="e.g. 123456789012345"
                />
              </div>
              <div className="md:col-span-2">
                <AdminLabel>Google Search Console Verification Tag</AdminLabel>
                <AdminInput
                  value={form.googleConsoleVerification}
                  onChange={(e) => set("googleConsoleVerification", e.target.value)}
                  placeholder="e.g. Google verification hash code"
                />
              </div>
            </div>
          </AdminCard>

          {/* Section 3: robots.txt controls */}
          <AdminCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Robots Configuration (robots.txt)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct search crawl engines on what files and folders to index.
                </p>
              </div>
            </div>

            <div>
              <AdminLabel required>robots.txt Content</AdminLabel>
              <AdminTextarea
                value={form.robotsTxt}
                onChange={(e) => set("robotsTxt", e.target.value)}
                rows={6}
                placeholder="User-agent: *..."
                className="font-mono text-xs"
              />
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Cloudinary Media Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
              <div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Select OG Image</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Pick an asset hosted on Cloudinary</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1 rounded-lg hover:bg-muted transition-all"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingMedia ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Loading assets...</p>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-bold text-foreground">No media assets found</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload images in the Media Library first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.publicId}
                      className={`relative aspect-square rounded-2xl overflow-hidden border cursor-pointer group transition-all ${
                        selectedMediaUrl === item.url
                          ? "border-primary ring-4 ring-primary/10 scale-[1.02]"
                          : "border-border hover:border-primary/40"
                      }`}
                      onClick={() => setSelectedMediaUrl(item.url)}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      {selectedMediaUrl === item.url && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-muted/10 shrink-0 flex items-center gap-3 justify-end">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => setShowPicker(false)}
                className="py-2.5 px-5"
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="button"
                onClick={() => {
                  if (selectedMediaUrl) {
                    set("ogImage", selectedMediaUrl);
                  }
                  setShowPicker(false);
                }}
                disabled={!selectedMediaUrl}
                className="py-2.5 px-5"
              >
                Select Image
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
