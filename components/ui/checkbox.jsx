"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Checkbox({ checked, onCheckedChange, className = "" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`
        relative h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center overflow-hidden
        ${checked 
          ? "bg-primary border-primary shadow-glow-primary" 
          : "bg-background border-border hover:border-primary/50"}
        ${className}
      `}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
          >
            <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
