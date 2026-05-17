"use client";

import { motion } from "framer-motion";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-card border border-border">
      <div className="aspect-square bg-muted animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-muted rounded-lg animate-pulse opacity-50" />
        <div className="pt-4 flex items-center justify-between">
          <div className="h-6 w-1/3 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-1/4 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 bg-muted rounded-full animate-pulse" />
          <div className="h-10 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function BestSellerSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
