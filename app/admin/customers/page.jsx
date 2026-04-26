"use client";

import { motion } from "framer-motion";
import { Users, Search, Filter, Mail, Phone, ShoppingBag, MoreVertical } from "lucide-react";
import { formatPKR } from "@/lib/products";

export default function CustomersPage() {
  const customers = [
    { name: "Javid Ali", email: "javid@example.com", phone: "+92 300 1234567", orders: 12, spent: 145000, joined: "Aug 2023" },
    { name: "Sara Khan", email: "sara@example.com", phone: "+92 321 7654321", orders: 5, spent: 42000, joined: "Sep 2023" },
    { name: "Imran Shah", email: "imran@example.com", phone: "+92 333 9998887", orders: 24, spent: 382000, joined: "Jan 2023" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight">Customers</h1>
           <p className="text-white/40 mt-2">Manage your user base and view purchase history.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/[0.03] overflow-hidden">
         <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
               <input type="text" placeholder="Search customers..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary/50" />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40">
                     <th className="px-8 py-4">Customer</th>
                     <th className="px-8 py-4">Contact Info</th>
                     <th className="px-8 py-4">Orders</th>
                     <th className="px-8 py-4">Total Spent</th>
                     <th className="px-8 py-4">Joined</th>
                     <th className="px-8 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {customers.map((c) => (
                    <tr key={c.email} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {c.name[0]}
                             </div>
                             <span className="text-sm font-bold">{c.name}</span>
                          </div>
                       </td>
                       <td className="px-8 py-4">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-xs text-white/60"><Mail className="h-3 w-3" /> {c.email}</div>
                             <div className="flex items-center gap-2 text-xs text-white/40"><Phone className="h-3 w-3" /> {c.phone}</div>
                          </div>
                       </td>
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                             <ShoppingBag className="h-3 w-3 text-white/20" />
                             <span className="text-sm font-medium">{c.orders}</span>
                          </div>
                       </td>
                       <td className="px-8 py-4 text-sm font-bold text-emerald-400">{formatPKR(c.spent)}</td>
                       <td className="px-8 py-4 text-sm text-white/40">{c.joined}</td>
                       <td className="px-8 py-4 text-right">
                          <button className="h-8 w-8 rounded-lg bg-white/5 inline-flex items-center justify-center hover:bg-white/10 transition-colors"><MoreVertical className="h-4 w-4" /></button>
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
