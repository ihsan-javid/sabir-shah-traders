"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Search, Filter, Eye, MoreVertical, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { formatPKR } from "@/lib/products";

export default function OrdersPage() {
  const orders = [
    { id: "#8241", customer: "Javid Ali", date: "Oct 24, 2023", status: "Delivered", total: 12500, method: "JazzCash" },
    { id: "#8242", customer: "Sara Khan", date: "Oct 25, 2023", status: "Pending", total: 4200, method: "COD" },
    { id: "#8243", customer: "Imran Shah", date: "Oct 25, 2023", status: "Processing", total: 8900, method: "Stripe" },
    { id: "#8244", customer: "Ahmed Raza", date: "Oct 26, 2023", status: "Shipped", total: 15400, method: "EasyPaisa" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight">Orders</h1>
           <p className="text-white/40 mt-2">Manage customer purchases and fulfillment status.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">Export CSV</button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/[0.03] overflow-hidden">
         <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
               <input type="text" placeholder="Search order ID, customer..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary/50" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5"><Filter className="h-4 w-4" /> Filters</button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40">
                     <th className="px-8 py-4">Order ID</th>
                     <th className="px-8 py-4">Customer</th>
                     <th className="px-8 py-4">Date</th>
                     <th className="px-8 py-4">Status</th>
                     <th className="px-8 py-4">Method</th>
                     <th className="px-8 py-4">Total</th>
                     <th className="px-8 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4 text-sm font-bold text-primary">{o.id}</td>
                       <td className="px-8 py-4 text-sm font-medium">{o.customer}</td>
                       <td className="px-8 py-4 text-sm text-white/40">{o.date}</td>
                       <td className="px-8 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 
                            o.status === 'Pending' ? 'bg-orange-500/10 text-orange-400' : 
                            o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-white/60'
                          }`}>
                            {o.status === 'Delivered' && <CheckCircle className="h-3 w-3" />}
                            {o.status === 'Pending' && <Clock className="h-3 w-3" />}
                            {o.status === 'Shipped' && <Truck className="h-3 w-3" />}
                            {o.status}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{o.method}</td>
                       <td className="px-8 py-4 text-sm font-bold">{formatPKR(o.total)}</td>
                       <td className="px-8 py-4 text-right">
                          <button className="h-8 w-8 rounded-lg bg-white/5 inline-flex items-center justify-center hover:bg-white/10 transition-colors"><Eye className="h-4 w-4" /></button>
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
