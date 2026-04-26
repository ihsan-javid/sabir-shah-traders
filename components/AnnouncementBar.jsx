"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AnnouncementBar() {
  const [text, setText] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.settings?.announcementBar) {
          setText(data.settings.announcementBar);
        }
      });
  }, []);

  if (pathname.startsWith("/admin") || !text) return null;

  return (
    <div className="bg-black text-white py-2 overflow-hidden border-b border-white/5">
      <motion.div 
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="whitespace-nowrap text-[10px] uppercase tracking-[0.3em] font-bold"
      >
        {text} • {text} • {text} • {text} • {text} • {text}
      </motion.div>
    </div>
  );
}
