"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Globe, MousePointer2 } from "lucide-react";
import { formatPKR } from "@/lib/products";

export default function AnalyticsPage() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight">Sales & Traffic</h1>
           <p className="text-white/40 mt-2">Deep dive into your store&apos;s performance metrics.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">
             Export Report
           </div>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Sales", value: formatPKR(2450000), trend: "+14%", up: true, icon: ShoppingBag },
          { label: "Avg. Order Value", value: formatPKR(8500), trend: "-2%", up: false, icon: DollarSign },
          { label: "Conversion Rate", value: "3.42%", trend: "+0.5%", up: true, icon: MousePointer2 },
          { label: "Total Sessions", value: "45,210", trend: "+22%", up: true, icon: Globe },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <s.icon className="h-5 w-5 text-primary" />
               </div>
               <div className={`flex items-center gap-1 text-xs font-bold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                 {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                 {s.trend}
               </div>
            </div>
            <div className="text-xs text-white/30 uppercase tracking-widest font-bold">{s.label}</div>
            <div className="text-2xl font-bold mt-1">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 h-[400px] flex flex-col">
            <h3 className="font-display text-xl font-bold tracking-tight uppercase mb-8">Traffic Sources</h3>
            <div className="flex-1 flex flex-col justify-center gap-6">
               {[
                 { label: "Direct", value: 45, color: "bg-primary" },
                 { label: "Social Media", value: 30, color: "bg-blue-500" },
                 { label: "Search Engines", value: 15, color: "bg-purple-500" },
                 { label: "Referrals", value: 10, color: "bg-emerald-500" },
               ].map((t) => (
                 <div key={t.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-white/40">{t.label}</span>
                       <span>{t.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${t.value}%` }}
                         transition={{ duration: 1, delay: 0.5 }}
                         className={`h-full ${t.color}`} 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>

         <motion.div variants={item} className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 h-[400px]">
            <h3 className="font-display text-xl font-bold tracking-tight uppercase mb-8">Device Breakdown</h3>
            <div className="h-full flex items-center justify-center">
               <div className="relative h-48 w-48 rounded-full border-[16px] border-white/5 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-r-transparent rotate-45" />
                  <div className="text-center">
                     <div className="text-3xl font-bold">68%</div>
                     <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Mobile</div>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
