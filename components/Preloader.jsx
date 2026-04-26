"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Hide scrollbar immediately
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 10) + 5;
        return next > 100 ? 100 : next;
      });
    }, 40);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      // Wait for exit animation before restoring scroll
      setTimeout(() => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }, 1200);
    }, 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ 
            y: "-100%",
            transition: { 
              duration: 1.1, 
              ease: [0.83, 0, 0.17, 1],
            }
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
        >
          {/* Main Logo Container */}
          <div className="relative overflow-hidden px-10">
            <motion.div
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold tracking-[0.1em] uppercase">
                Sabir Shah
              </div>
              <div className="text-xs sm:text-sm tracking-[1.2em] text-primary mt-4 uppercase font-medium">
                Traders
              </div>
            </motion.div>
          </div>

          {/* Bottom Counter */}
          <div className="absolute bottom-12 right-12 flex items-baseline gap-3">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-white/20 text-[10px] tracking-[0.4em] uppercase"
             >
               Loading
             </motion.div>
            <span className="font-display text-6xl sm:text-8xl font-light tabular-nums leading-none">
              {Math.min(count, 100)}
            </span>
          </div>

          {/* Noise / Texture */}
          <div className="absolute inset-0 noise opacity-[0.03] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
