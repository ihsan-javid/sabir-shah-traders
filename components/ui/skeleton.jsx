import { motion } from "framer-motion";

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted/20 ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border p-4 flex flex-col gap-4 shadow-sm h-full">
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/10">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      
      <div className="flex flex-col flex-1 gap-4">
        {/* Title & Description */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        
        {/* Price & Badge */}
        <div className="mt-auto pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-full" />
            <Skeleton className="h-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
