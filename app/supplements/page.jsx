"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { SUB_CATEGORY_LABEL } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { CategoryHero } from "@/components/CategoryHero";

function SupplementsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?category=supplements")
      .then(r => r.json())
      .then(data => {
        setAll(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "";
  const sort = searchParams.get("sort") ?? "popular";
  const inStock = searchParams.get("inStock") === "true";
  const min = Number(searchParams.get("min")) || 0;
  const max = Number(searchParams.get("max")) || 0;

  const subCats = Array.from(new Set(all.map((p) => p.subCategory).filter(Boolean)));
  const maxPrice = all.length > 0 ? Math.max(...all.map((p) => p.price)) : 0;

  const filtered = useMemo(() => {
    let list = [...all];
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lq) ||
          p.brand.toLowerCase().includes(lq) ||
          (p.tagline && p.tagline.toLowerCase().includes(lq))
      );
    }
    if (cat) list = list.filter((p) => p.subCategory === cat);
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (min > 0) list = list.filter((p) => p.price >= min);
    if (max > 0) list = list.filter((p) => p.price <= max);

    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest": list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")); break;
      case "rating": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    return list;
  }, [all, q, cat, sort, inStock, min, max]);

  const updateSearch = (patch) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === false || v === 0) params.delete(k);
      else params.set(k, String(v));
    });
    router.replace(`/supplements?${params.toString()}`, { scroll: false });
  };

  const activeFilterCount = (cat ? 1 : 0) + (inStock ? 1 : 0) + (min > 0 ? 1 : 0) + (max > 0 ? 1 : 0);

  return (
    <>
      <CategoryHero
        accent="health"
        eyebrow="Nutrition Store"
        title="Fuel that works."
        description="100% authentic supplements sourced directly. Whey, vitamins, omega — built to support your goals."
        icon={<Leaf className="h-5 w-5" />}
      />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={q}
                onChange={(e) => updateSearch({ q: e.target.value })}
                placeholder="Search whey, vitamins, omega…"
                className="w-full rounded-full glass pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-health/30"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              className="rounded-full glass px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-health/30"
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center gap-2 rounded-full glass px-4 py-3 text-sm relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-health text-health-foreground text-[10px] font-bold grid place-items-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
            <aside className="hidden md:block">
              <FilterPanel search={{ cat, inStock, min, max }} subCats={subCats} maxPrice={maxPrice} update={updateSearch} />
            </aside>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                  onClick={() => setFiltersOpen(false)}
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-surface p-6 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="font-display font-semibold">Filters</div>
                      <button onClick={() => setFiltersOpen(false)} aria-label="Close" className="group overflow-hidden">
                        <div className="relative h-5 w-5 overflow-hidden">
                          <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-5">
                            <X className="h-5 w-5 shrink-0" />
                            <X className="h-5 w-5 shrink-0" />
                          </div>
                        </div>
                      </button>
                    </div>
                    <FilterPanel search={{ cat, inStock, min, max }} subCats={subCats} maxPrice={maxPrice} update={updateSearch} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"}
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={() => updateSearch({ cat: "", inStock: false, min: 0, max: 0 })} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    Clear filters <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl glass p-12 text-center">
                  <p className="text-muted-foreground">No products match your filters.</p>
                  <Link href="/supplements" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-health">
                    Reset <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <ProductSkeleton />
                        </motion.div>
                      ))
                    ) : (
                      filtered.map((p, i) => (
                        <motion.div key={p._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                          <ProductCard product={p} index={i} />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterPanel({ search, subCats, maxPrice, update }) {
  return (
    <div className="space-y-7">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</div>
        <div className="space-y-1.5">
          <button onClick={() => update({ cat: "" })} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!search.cat ? "bg-health/15 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}>All</button>
          {subCats.map((c) => (
            <button key={c} onClick={() => update({ cat: c })} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${search.cat === c ? "bg-health/15 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}>
              {SUB_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price (PKR)</div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min" value={search.min || ""} onChange={(e) => update({ min: Number(e.target.value) || 0 })} className="rounded-lg glass px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health/30" />
          <input type="number" placeholder="Max" value={search.max || ""} onChange={(e) => update({ max: Number(e.target.value) || 0 })} className="rounded-lg glass px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health/30" />
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">Up to Rs {maxPrice.toLocaleString("en-PK")}</div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={search.inStock} onChange={(e) => update({ inStock: e.target.checked })} className="h-4 w-4 rounded accent-health" />
          <span className="text-sm">In stock only</span>
        </label>
      </div>
    </div>
  );
}

export default function SupplementsPage() {
  return (
    <Suspense>
      <SupplementsContent />
    </Suspense>
  );
}
