"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, MessageCircle, DollarSign, TrendingUp, Users, ArrowUpRight, Plus, Eye, Settings2, Sparkles } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, []);

  if (!stats) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const cards = [
    { label: "Gross Revenue", value: formatPKR(stats.revenue || 0), icon: DollarSign, trend: "+12.5%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: stats.orderCount || 0, icon: ShoppingCart, trend: "+8.2%", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Conversion Rate", value: "3.42%", icon: TrendingUp, trend: "+1.2%", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Live Visitors", value: "12", icon: Users, trend: "Live now", color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             Live Dashboard
           </div>
           <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">Overview</h1>
           <p className="text-white/40 mt-2 text-sm lg:text-base">Command center for Sabir Shah Traders. Everything looks stable today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Link href="/admin/customize" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:scale-[1.02] transition-transform shadow-glow-primary">
             <Settings2 className="h-4 w-4" /> Edit Website
           </Link>
           <Link href="/admin/products?new=true" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
             <Plus className="h-4 w-4" /> Add Product
           </Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-8 overflow-hidden hover:bg-white/[0.05] transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${c.bg}`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-2xl ${c.bg} flex items-center justify-center ${c.color}`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 text-white/40">
                  {c.trend}
                </div>
              </div>
              <div className="mt-6">
                <div className="text-sm font-medium text-white/40 uppercase tracking-wider">{c.label}</div>
                <div className="mt-2 font-display text-4xl font-bold tracking-tight">{c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
         <motion.div variants={item} className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-display text-xl font-bold tracking-tight uppercase">Revenue Analytics</h3>
               <div className="flex items-center gap-4">
                 <select className="bg-white/5 border border-white/10 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-primary/50">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Year to Date</option>
                 </select>
               </div>
            </div>
            {/* Chart Area */}
            <div className="h-64 w-full flex items-end gap-2">
               {Array.from({ length: 14 }).map((_, i) => (
                 <motion.div 
                   key={i}
                   initial={{ height: 0 }}
                   animate={{ height: `${Math.random() * 60 + 20}%` }}
                   transition={{ duration: 1, delay: i * 0.05 + 0.5 }}
                   className="flex-1 bg-gradient-to-t from-primary/5 to-primary/30 rounded-t-lg relative group"
                 >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xl">
                      {Math.floor(Math.random() * 50)}k
                    </div>
                 </motion.div>
               ))}
            </div>
            <div className="mt-4 flex justify-between text-[10px] text-white/20 uppercase tracking-widest font-bold px-1">
               <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span><span>Tue</span><span>Thu</span><span>Sat</span>
            </div>
         </motion.div>

         <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 flex flex-col">
            <h3 className="font-display text-xl font-bold tracking-tight uppercase mb-6">Low Stock Alerts</h3>
            <div className="space-y-4 flex-1">
               {[
                 { name: "Whey Isolate 2kg", stock: 3, color: "text-red-400" },
                 { name: "Omega 3 Fish Oil", stock: 0, color: "text-red-500" },
                 { name: "Daily Multivitamin", stock: 5, color: "text-orange-400" },
               ].map((s) => (
                 <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className={`text-xs font-bold ${s.color}`}>
                      {s.stock === 0 ? "Out of Stock" : `${s.stock} left`}
                    </div>
                 </div>
               ))}
            </div>
            <Link href="/admin/products" className="mt-6 w-full text-center py-3 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Manage Inventory
            </Link>
         </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-display text-xl font-bold tracking-tight uppercase">Top Selling Products</h3>
               <Link href="/admin/analytics" className="text-[10px] font-bold uppercase tracking-widest text-primary">View Report</Link>
            </div>
            <div className="space-y-5">
               {[
                 { name: "Pure Whey Protein", sales: 142, revenue: 1680000, img: "/p-whey.jpg" },
                 { name: "ISO Whey Isolate", sales: 98, revenue: 832000, img: "/p-whey.jpg" },
                 { name: "Vitamin C 1000mg", sales: 85, revenue: 161500, img: "/p-vitamins.jpg" },
               ].map((p) => (
                 <div key={p.name} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                       <img src={p.img} alt="" className="h-full w-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1">
                       <div className="text-sm font-bold">{p.name}</div>
                       <div className="text-xs text-white/30">{p.sales} sales this month</div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold text-emerald-400">{formatPKR(p.revenue)}</div>
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>

         <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-display text-xl font-bold tracking-tight uppercase">Recent Orders</h3>
               <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-primary">All Orders</Link>
            </div>
            <div className="space-y-4">
               {[
                 { id: "#8241", user: "Javid Ali", status: "Delivered", total: 12500 },
                 { id: "#8242", user: "Sara Khan", status: "Pending", total: 4200 },
                 { id: "#8243", user: "Imran Shah", status: "Processing", total: 8900 },
               ].map((o) => (
                 <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {o.user[0]}
                       </div>
                       <div>
                          <div className="text-sm font-bold">{o.user}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest">{o.id}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold">{formatPKR(o.total)}</div>
                       <div className={`text-[10px] font-bold uppercase tracking-widest ${
                         o.status === 'Delivered' ? 'text-emerald-400' : 
                         o.status === 'Pending' ? 'text-orange-400' : 'text-blue-400'
                       }`}>{o.status}</div>
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
