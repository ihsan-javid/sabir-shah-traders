"use client";

import { motion } from "framer-motion";
import { Sparkles, Plus, Edit, Trash2, Tag } from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
  const categories = [
    { name: "Supplements", count: 24, sub: ["Protein", "Vitamins", "Pre-workout", "Creatine"] },
    { name: "Electronics", count: 12, sub: ["Smartwatches", "Headphones", "Speakers", "Gadgets"] },
    { name: "Wellness", count: 8, sub: ["Massage", "Sleep", "Yoga"] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight">Categories</h1>
           <p className="text-white/40 mt-2">Manage your product hierarchy and taxonomy.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm shadow-glow-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.name} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 hover:bg-white/[0.05] transition-colors group">
             <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <Tag className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"><Edit className="h-4 w-4" /></button>
                   <button className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
                </div>
             </div>
             <h3 className="text-xl font-bold">{cat.name}</h3>
             <div className="mt-2 text-xs text-white/30 uppercase tracking-widest">{cat.count} products</div>
             
             <div className="mt-6 flex flex-wrap gap-2">
                {cat.sub.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40">{s}</span>
                ))}
             </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
