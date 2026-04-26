"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Magnetic } from "./ui/magnetic";

export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Magnetic strength={0.3}>
        <motion.a
          href="https://wa.me/923000000000?text=Hi%20Sabir%20Shah%20Traders%2C%20I%20want%20to%20order"
          target="_blank"
          rel="noreferrer noopener"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl overflow-hidden"
          aria-label="WhatsApp"
        >
          {/* Background Fill Overlay */}
          <div className="absolute inset-0 bg-[#25D366] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:translate-y-0" />
          
          {/* WhatsApp Icon */}
          <svg 
            viewBox="0 0 24 24" 
            className="relative z-10 h-8 w-8 fill-[#25D366] transition-colors duration-500 group-hover:fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.877-9.884 9.877m8.415-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.411.001 12.045c0 2.121.554 4.191 1.607 6.005L0 24l6.117-1.605a11.787 11.787 0 005.925 1.597h.005c6.637 0 12.05-5.411 12.054-12.046a11.777 11.777 0 00-3.341-8.528" />
          </svg>
          
          <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20 pointer-events-none" />
        </motion.a>
      </Magnetic>
    </div>
  );
}
