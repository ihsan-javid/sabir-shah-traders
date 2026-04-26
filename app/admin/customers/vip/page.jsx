"use client";

import { motion } from "framer-motion";

export default function CustomersVipPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 text-center bg-white/[0.03] rounded-3xl border border-white/5 h-[60vh] flex flex-col items-center justify-center"
    >
      <h1 className="text-3xl font-bold font-display tracking-tight text-white">Customers Vip</h1>
      <p className="text-white/40 mt-4 max-w-md">
        The Customers Vip module is currently under development. This feature will allow you to manage customers vip for Sabir Shah Traders.
      </p>
      <div className="mt-8 px-6 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/20">
        Coming Soon
      </div>
    </motion.div>
  );
}
