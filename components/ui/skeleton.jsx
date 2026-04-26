import { motion } from "framer-motion";

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted/20 ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="rounded-3xl glass p-4 aspect-[4/5] flex flex-col gap-4">
      <Skeleton className="w-full h-full rounded-2xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <div className="flex justify-between items-center mt-2">
           <Skeleton className="h-6 w-20" />
           <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
