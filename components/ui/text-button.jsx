"use client";

import { motion } from "framer-motion";

export function TextButton({ text, onClick, type = "button", className, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group/text relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className || ''}`}
    >
      {/* Background Fill Overlay */}
      <div className="absolute inset-0 bg-[#10E891] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:translate-y-0" />
      
      {/* Text Container */}
      <span className="relative flex flex-col h-[1lh] overflow-hidden leading-none">
        <span className="flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:-translate-y-full uppercase tracking-wider h-[1lh]">
          {text}
        </span>
        <span className="flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:-translate-y-full text-black uppercase tracking-wider h-[1lh]">
          {text}
        </span>
      </span>
    </button>
  );
}
