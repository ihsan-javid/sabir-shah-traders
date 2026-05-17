"use client";

import { useEffect, useState, Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryHero } from "@/components/CategoryHero";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { Sparkles, Trophy } from "lucide-react";

function BestsellersContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([cats, prodData]) => {
        const allProducts = prodData.products || [];
        const visibleSlugs =
          Array.isArray(cats)
            ? cats.filter((c) => c.visible !== false).map((c) => c.slug)
            : [];
        // Filter products: must be bestsellers and belong to a visible category
        const bestsellerProducts = allProducts.filter(
          (p) => p.bestseller && visibleSlugs.includes(p.category)
        );
        setProducts(bestsellerProducts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <CategoryHero
        accent="gold"
        eyebrow="Highly Coveted"
        title="Sabir Shah Bestsellers"
        description="Our most popular, customer-favorite products from nutrition and electronics, all backed by 100% authenticity."
        icon={<Trophy className="h-4 w-4 text-gold" />}
      />

      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
            <p className="text-sm text-muted-foreground font-medium">
              Showing {products.length} bestselling product{products.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gold font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Top Sellers
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl glass p-16 text-center max-w-xl mx-auto">
              <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground">No bestseller products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back later as our inventory and bestseller statuses update.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function BestsellersClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-10 w-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BestsellersContent />
    </Suspense>
  );
}
