"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Image as ImageIcon, Trash2, Pencil, 
  ToggleLeft, ToggleRight, Calendar, Clock, Sparkles, 
  X, Check, AlertCircle, Save, Upload, ExternalLink,
  Smartphone, Monitor, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

const MOCK_BANNERS = [
  {
    id: "B1",
    title: "Summer Sale 2026",
    type: "Home Hero",
    image: "/banners/summer.jpg",
    link: "/category/supplements",
    active: true,
    platform: "All",
    schedule: "May 01 - Aug 31",
    priority: 1
  },
  {
    id: "B2",
    title: "Protein Blast Popup",
    type: "Popup",
    image: "/banners/protein.jpg",
    link: "/product/whey-protein",
    active: false,
    platform: "Desktop",
    schedule: "Jun 10 - Jun 20",
    priority: 2
  }
];

function BannerModal({ banner, onClose, onSave }) {
  const isNew = !banner?.id;
  const [form, setForm] = useState(banner || {
    title: "",
    type: "Home Hero",
    link: "",
    active: true,
    platform: "All",
    scheduleStart: "",
    scheduleEnd: "",
    priority: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: form.id || `B${Date.now()}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
          <div>
            <h3 className="text-xl font-bold text-foreground">{isNew ? "Create New Banner" : "Edit Banner"}</h3>
            <p className="text-xs text-muted-foreground mt-1">Configure your marketing assets</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Banner Title</label>
              <input 
                required
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-semibold"
                placeholder="e.g. Summer Collection"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Display Type</label>
              <select 
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-semibold"
              >
                <option value="Home Hero">Home Hero</option>
                <option value="Announcement Bar">Announcement Bar</option>
                <option value="Popup">Popup</option>
                <option value="Sidebar Ad">Sidebar Ad</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Redirect Link</label>
            <input 
              value={form.link}
              onChange={e => setForm({...form, link: e.target.value})}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-semibold"
              placeholder="e.g. /category/electronics"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Start Date</label>
              <input 
                type="date"
                value={form.scheduleStart}
                onChange={e => setForm({...form, scheduleStart: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">End Date</label>
              <input 
                type="date"
                value={form.scheduleEnd}
                onChange={e => setForm({...form, scheduleEnd: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-border text-center group cursor-pointer hover:bg-muted/50 transition-all">
             <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5 text-primary" />
             </div>
             <div className="text-sm font-bold text-foreground">Click to upload banner image</div>
             <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black opacity-60">JPG, PNG or WEBP (Max 2MB)</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.active ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                   {form.active ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </div>
                <div>
                   <div className="text-sm font-bold text-foreground">Active Status</div>
                   <div className="text-[10px] text-muted-foreground uppercase font-black opacity-60 tracking-widest">Visibility on storefront</div>
                </div>
             </div>
             <button 
                type="button"
                onClick={() => setForm({...form, active: !form.active})}
                className="transition-colors hover:opacity-80"
             >
                {form.active ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
             </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-primary text-primary-foreground font-black uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-glow-primary"
            >
              {isNew ? "Create Asset" : "Save Changes"}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 bg-muted text-foreground font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (saved) => {
    if (banners.find(b => b.id === saved.id)) {
      setBanners(prev => prev.map(b => b.id === saved.id ? saved : b));
    } else {
      setBanners(prev => [saved, ...prev]);
    }
    toast.success("Marketing asset updated!");
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    setBanners(prev => prev.filter(b => b.id !== confirmDelete.id));
    toast.success("Banner removed successfully");
    setConfirmDelete(null);
  };

  const toggleStatus = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success("Status updated");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Banners & Popups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage storefront marketing and announcements</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-64 pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => setModal({ mode: 'new' })}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-primary"
          >
            <Plus className="h-5 w-5" /> Create New
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((banner) => (
            <motion.div 
              key={banner.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="relative h-48 bg-muted/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${banner.active ? 'bg-primary text-primary-foreground shadow-glow-primary' : 'bg-black/50 text-white/60'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                   </div>
                </div>
                <div className="absolute bottom-4 left-6 z-20">
                   <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{banner.type}</div>
                   <h3 className="text-lg font-bold text-white">{banner.title}</h3>
                </div>
                <ImageIcon className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground/20 group-hover:scale-125 transition-transform duration-500" />
              </div>

              <div className="p-6 space-y-4">
                 <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-2xl border border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                       <Calendar className="h-3.5 w-3.5 text-primary" />
                       <span className="truncate">{banner.schedule}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-border" />
                    <div className="flex items-center gap-1.5">
                       {banner.platform === 'Desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                       <span>{banner.platform}</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => toggleStatus(banner.id)}
                        className={`p-2 rounded-xl transition-all ${banner.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                       >
                          {banner.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                       </button>
                       <button 
                        onClick={() => setModal({ mode: 'edit', banner })}
                        className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                       >
                          <Pencil className="h-5 w-5" />
                       </button>
                    </div>
                    <button 
                      onClick={() => setConfirmDelete(banner)}
                      className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                       <Trash2 className="h-5 w-5" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-card rounded-3xl border border-dashed border-border">
          <Megaphone className="h-12 w-12 text-muted-foreground/20 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-foreground">No Assets Found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">Try adjusting your search or create a new marketing banner for your store.</p>
        </div>
      )}

      {modal && (
        <BannerModal 
          banner={modal.mode === 'edit' ? modal.banner : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
