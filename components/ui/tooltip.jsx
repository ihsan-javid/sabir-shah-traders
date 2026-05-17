"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export function Tooltip({ children, content, position = "top", className = "", wrapperClassName = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const updateCoords = () => {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      };
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isVisible]);

  let portalContent = null;

  if (mounted) {
    let top = 0;
    let left = 0;
    let arrowClass = "";
    
    if (coords) {
      const gap = 8;
      switch(position) {
        case "top":
          top = coords.top - gap;
          left = coords.left + coords.width / 2;
          arrowClass = "top-full -mt-1 left-1/2 -translate-x-1/2 rotate-45";
          break;
        case "bottom":
          top = coords.top + coords.height + gap;
          left = coords.left + coords.width / 2;
          arrowClass = "bottom-full -mb-1 left-1/2 -translate-x-1/2 rotate-45";
          break;
        case "left":
          top = coords.top + coords.height / 2;
          left = coords.left - gap;
          arrowClass = "left-full -ml-1 top-1/2 -translate-y-1/2 rotate-45";
          break;
        case "right":
          top = coords.top + coords.height / 2;
          left = coords.left + coords.width + gap;
          arrowClass = "right-full -mr-1 top-1/2 -translate-y-1/2 rotate-45";
          break;
      }
    }

    const transformOriginMap = {
      top: "bottom center",
      bottom: "top center",
      left: "center right",
      right: "center left"
    };

    portalContent = createPortal(
      <AnimatePresence>
        {isVisible && content && coords && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: position === 'left' || position === 'right' ? (position === 'left' ? '-100%' : '0') : '-50%', y: position === 'top' || position === 'bottom' ? (position === 'top' ? '-100%' : '0') : '-50%' }}
            animate={{ opacity: 1, scale: 1, x: position === 'left' || position === 'right' ? (position === 'left' ? '-100%' : '0') : '-50%', y: position === 'top' || position === 'bottom' ? (position === 'top' ? '-100%' : '0') : '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: position === 'left' || position === 'right' ? (position === 'left' ? '-100%' : '0') : '-50%', y: position === 'top' || position === 'bottom' ? (position === 'top' ? '-100%' : '0') : '-50%' }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`fixed hidden md:block z-[9999] px-2.5 py-1.5 text-xs font-semibold text-background bg-foreground rounded-lg whitespace-nowrap shadow-xl pointer-events-none ${className}`}

            style={{ 
              top, 
              left, 
              transformOrigin: transformOriginMap[position]
            }}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-foreground ${arrowClass}`} />
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center cursor-pointer ${wrapperClassName}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      ref={containerRef}
    >
      {children}
      {portalContent}
    </div>
  );
}
