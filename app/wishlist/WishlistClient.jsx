"use client";

import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";

export default function WishlistClient() {
  const { items } = useWishlist();

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <header className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-bold">
                <Heart className="h-3 w-3 fill-current" />
                Favorites
              </div>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
                My Wishlist
              </h1>
              <p className="mt-3 text-muted-foreground max-w-lg">
                Your curated collection of premium nutrition and wellness essentials.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{items.length} Items</div>
                <div className="text-xs text-muted-foreground">Saved to collection</div>
              </div>
            </div>
          </div>
        </header>

        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-border py-32 text-center"
          >
            <div className="mx-auto h-20 w-20 rounded-full bg-surface grid place-items-center mb-6">
              <Heart className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
            <p className="mt-2 text-muted-foreground max-w-xs mx-auto mb-8">
              Explore our collection and tap the heart icon to save products you love.
            </p>
            <Link 
              href="/supplements" 
              className="rounded-full bg-foreground text-background px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Start shopping
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
