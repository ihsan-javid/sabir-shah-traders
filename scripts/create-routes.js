import fs from 'fs';
import path from 'path';

const routes = [
  'analytics', 'inventory', 'categories', 'reviews', 'orders/pending', 'orders/refunds',
  'customers', 'customers/vip', 'support', 'coupons', 'campaigns', 'banners',
  'seo', 'ai', 'predictions', 'staff', 'settings', 'logs'
];

routes.forEach(r => {
  const dir = path.join(process.cwd(), 'app/admin', r);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, 'page.jsx');
  if (!fs.existsSync(filePath)) {
    const name = r.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const componentName = name.replace(/\s/g, '') + 'Page';
    const content = `"use client";

import { motion } from "framer-motion";

export default function ${componentName}() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 text-center bg-white/[0.03] rounded-3xl border border-white/5 h-[60vh] flex flex-col items-center justify-center"
    >
      <h1 className="text-3xl font-bold font-display tracking-tight text-white">${name}</h1>
      <p className="text-white/40 mt-4 max-w-md">
        The ${name} module is currently under development. This feature will allow you to manage ${name.toLowerCase()} for Sabir Shah Traders.
      </p>
      <div className="mt-8 px-6 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/20">
        Coming Soon
      </div>
    </motion.div>
  );
}
`;
    fs.writeFileSync(filePath, content);
    console.log(`Created ${filePath}`);
  }
});
