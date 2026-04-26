"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Layout, Sparkles, Info, Phone, Mail, MapPin, ExternalLink, Package, MessageSquare, Camera, Share2, Globe } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomizePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    heroTitle: "",
    heroDescription: "",
    aboutTitle: "",
    aboutText: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    accentColor: "#10E891",
    announcementBar: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
    }
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.settings) setConfig(data.settings);
        setLoading(false);
      });
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
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl space-y-12">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
           <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight uppercase">Website Appearance</h1>
           <p className="text-white/40 mt-2">The master control for your store&apos;s content and visual identity.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-glow-primary"
        >
          <Save className="h-5 w-5" /> {saving ? "Saving..." : "Apply All Changes"}
        </button>
      </motion.div>

      {/* Quick Guide Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Link href="/admin/products" className="group p-5 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
               </div>
               <div>
                  <div className="font-bold text-sm">Manage Products</div>
                  <div className="text-xs text-white/40">Add, edit or remove items from your store.</div>
               </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
         </Link>
         <Link href="/admin/reviews" className="group p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between hover:blue-500/10 transition-colors">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <MessageSquare className="h-5 w-5" />
               </div>
               <div>
                  <div className="font-bold text-sm">Moderate Reviews</div>
                  <div className="text-xs text-white/40">See and manage customer testimonials.</div>
               </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-blue-400 transition-colors" />
         </Link>
      </motion.div>

      <div className="grid gap-8">
        {/* Hero Section */}
        <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 lg:p-10">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                 <Layout className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="font-display text-2xl font-bold uppercase tracking-tight leading-none">Hero & Branding</h3>
                 <p className="text-white/30 text-xs mt-1 uppercase tracking-widest font-bold">The first thing visitors see</p>
              </div>
           </div>
           
           <div className="grid gap-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Announcement Bar</label>
                  <input 
                    type="text"
                    value={config.announcementBar}
                    onChange={e => setConfig({...config, announcementBar: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Primary Theme Color</label>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                     <input 
                       type="color" 
                       value={config.accentColor}
                       onChange={e => setConfig({...config, accentColor: e.target.value})}
                       className="h-10 w-10 rounded-lg bg-transparent border-none cursor-pointer"
                     />
                     <code className="text-sm text-primary font-mono font-bold">{config.accentColor}</code>
                  </div>
                </div>
              </div>

              <div>
                 <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Hero Main Title</label>
                 <textarea 
                   value={config.heroTitle}
                   onChange={e => setConfig({...config, heroTitle: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] text-lg font-bold"
                 />
              </div>
              <div>
                 <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Hero Subtext</label>
                 <textarea 
                   value={config.heroDescription}
                   onChange={e => setConfig({...config, heroDescription: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] text-white/60"
                 />
              </div>
           </div>
        </motion.div>

        {/* Content Management */}
        <motion.div variants={item} className="grid lg:grid-cols-2 gap-8">
           {/* About Section */}
           <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Info className="h-5 w-5" />
                 </div>
                 <h3 className="font-display text-xl font-bold uppercase tracking-tight">About Content</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 block">Heading</label>
                    <input 
                      type="text"
                      value={config.aboutTitle}
                      onChange={e => setConfig({...config, aboutTitle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 block">Story / Vision</label>
                    <textarea 
                      rows={5}
                      value={config.aboutText}
                      onChange={e => setConfig({...config, aboutText: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm leading-relaxed"
                    />
                 </div>
              </div>
           </div>

           {/* Contact & Social Section */}
           <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 lg:p-10 space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">Contact Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Phone</label>
                      <input value={config.contactPhone} onChange={e => setConfig({...config, contactPhone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Email</label>
                      <input value={config.contactEmail} onChange={e => setConfig({...config, contactEmail: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Address</label>
                    <input value={config.contactAddress} onChange={e => setConfig({...config, contactAddress: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">Social Links</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10 focus-within:border-primary/50 transition-colors">
                     <Camera className="h-4 w-4 text-white/30" />
                     <input placeholder="Instagram URL" value={config.socialLinks?.instagram} onChange={e => setConfig({...config, socialLinks: {...config.socialLinks, instagram: e.target.value}})} className="bg-transparent border-none outline-none flex-1 text-sm py-1" />
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10 focus-within:border-primary/50 transition-colors">
                     <Share2 className="h-4 w-4 text-white/30" />
                     <input placeholder="Twitter URL" value={config.socialLinks?.twitter} onChange={e => setConfig({...config, socialLinks: {...config.socialLinks, twitter: e.target.value}})} className="bg-transparent border-none outline-none flex-1 text-sm py-1" />
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10 focus-within:border-primary/50 transition-colors">
                     <Globe className="h-4 w-4 text-white/30" />
                     <input placeholder="Facebook URL" value={config.socialLinks?.facebook} onChange={e => setConfig({...config, socialLinks: {...config.socialLinks, facebook: e.target.value}})} className="bg-transparent border-none outline-none flex-1 text-sm py-1" />
                  </div>
                </div>
              </div>
           </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="p-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] text-center">
         <Sparkles className="h-8 w-8 text-white/20 mx-auto mb-4 animate-pulse" />
         <div className="text-sm text-white/40 font-medium">Your changes are applied globally across the entire website.</div>
      </motion.div>
    </motion.div>
  );
}
