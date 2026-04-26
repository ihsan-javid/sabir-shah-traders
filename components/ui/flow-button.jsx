'use client';
import { ArrowRight } from 'lucide-react';

export function FlowButton({ text = "Modern Button", onClick, className, disabled, type="button", as: Tag = "button", ...props }) {
  const Comp = Tag;
  const isButton = Tag === "button";
  
  return (
    <Comp 
      {...(isButton ? { type, disabled } : {})}
      onClick={onClick} 
      className={`group/flow relative flex items-center gap-1 overflow-hidden rounded-full border-[1.5px] border-foreground/30 bg-transparent px-8 py-3 text-sm font-semibold text-foreground cursor-pointer transition-all duration-500 ease-out hover:border-transparent hover:text-white active:scale-95 will-change-transform ${className || ''}`}
      {...props}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-25%] stroke-foreground fill-none z-[9] group-hover/flow:left-4 group-hover/flow:stroke-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[left,stroke]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover/flow:translate-x-3 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
        {text}
      </span>

      {/* Circle background expansion */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full opacity-0 scale-0 group-hover/flow:scale-[15] group-hover/flow:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-foreground fill-none z-[9] group-hover/flow:right-[-25%] group-hover/flow:stroke-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[right,stroke]" 
      />
    </Comp>
  );
}
