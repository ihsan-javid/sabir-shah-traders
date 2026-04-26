"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle, ArrowRight, Search, Filter, History } from "lucide-react";
import { motion } from "framer-motion";
import { formatPKR } from "@/lib/products";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, []);

  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight">Inventory Tracking</h1>
           <p className="text-white/40 mt-2 text-sm lg:text-base">Real-time stock levels and warehouse management.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">
             <History className="h-4 w-4" /> Stock History
           </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
               <Package className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-white/40 uppercase tracking-wider">Total SKUs</div>
            <div className="mt-2 font-display text-4xl font-bold tracking-tight">{products.length}</div>
         </div>
         <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6">
               <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-white/40 uppercase tracking-wider">Low Stock items</div>
            <div className="mt-2 font-display text-4xl font-bold tracking-tight">{lowStock.length}</div>
         </div>
         <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
               <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-white/40 uppercase tracking-wider">Out of Stock</div>
            <div className="mt-2 font-display text-4xl font-bold tracking-tight">
               {products.filter(p => p.stock === 0).length}
            </div>
         </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/[0.03] overflow-hidden">
         <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
               <input 
                 type="text" 
                 placeholder="Search SKU or Product..." 
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary/50 transition-colors"
               />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">
               <Filter className="h-4 w-4" /> Filters
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40">
                     <th className="px-8 py-4">Product</th>
                     <th className="px-8 py-4">SKU</th>
                     <th className="px-8 py-4">Status</th>
                     <th className="px-8 py-4">Stock</th>
                     <th className="px-8 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                             <img src={p.image} className="h-10 w-10 rounded-lg object-cover" />
                             <span className="text-sm font-medium">{p.name}</span>
                          </div>
                       </td>
                       <td className="px-8 py-4 font-mono text-xs text-white/30 uppercase tracking-widest">
                          {p._id.slice(-8)}
                       </td>
                       <td className="px-8 py-4">
                          {p.stock === 0 ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
                          ) : p.stock <= 5 ? (
                            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest">Low Stock</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">In Stock</span>
                          )}
                       </td>
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 max-w-[80px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${p.stock === 0 ? 'w-0' : p.stock <= 5 ? 'bg-orange-400 w-1/4' : 'bg-primary w-full'}`} 
                                />
                             </div>
                             <span className="text-sm font-bold">{p.stock}</span>
                          </div>
                       </td>
                       <td className="px-8 py-4 text-right">
                          <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Update</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
