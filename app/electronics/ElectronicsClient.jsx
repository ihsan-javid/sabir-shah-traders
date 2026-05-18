"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryHero } from "@/components/CategoryHero";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { TextButton } from "@/components/ui/text-button";
import {
  IdentityCardBody,
  RevealCardContainer,
} from "@/components/ui/animated-profile-card";

function ElectronicsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryHidden, setCategoryHidden] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState(searchParams.get("cat") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "popular");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [min, setMin] = useState(Number(searchParams.get("minPrice")) || Number(searchParams.get("min")) || 0);
  const [max, setMax] = useState(Number(searchParams.get("maxPrice")) || Number(searchParams.get("max")) || 0);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCat(searchParams.get("cat") ?? "");
    setBrand(searchParams.get("brand") ?? "");
    setSort(searchParams.get("sort") ?? "popular");
    setInStock(searchParams.get("inStock") === "true");
    setMin(Number(searchParams.get("minPrice")) || Number(searchParams.get("min")) || 0);
    setMax(Number(searchParams.get("maxPrice")) || Number(searchParams.get("max")) || 0);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    let url = "/api/products?category=electronics";
    if (min > 0) url += `&minPrice=${min}`;
    if (max > 0) url += `&maxPrice=${max}`;

    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setAll(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [min, max]);

  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => {
        const electronics = cats.find((c) => c.slug === "electronics");
        if (electronics === undefined || electronics.visible === false) setCategoryHidden(true);
        else setCategoryData(electronics);
      })
      .catch(() => {});
  }, []);

  const hasProducts = all.length > 0;

  const brands = useMemo(
    () => Array.from(new Set(all.map((p) => p.brand))).sort(),
    [all],
  );
  const subCats = useMemo(
    () => Array.from(new Set(all.map((p) => p.subCategory).filter(Boolean))),
    [all],
  );
  const maxPrice = hasProducts ? Math.max(...all.map((p) => p.price)) : 0;

  const filtered = useMemo(() => {
    let list = [...all];
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lq) ||
          p.brand.toLowerCase().includes(lq) ||
          (p.tagline && p.tagline.toLowerCase().includes(lq)),
      );
    }
    if (cat) {
      list = list.filter((p) => p.subCategory === cat);
    }
    if (brand) list = list.filter((p) => p.brand === brand);
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (min > 0) list = list.filter((p) => Number(p.price) >= min);
    if (max > 0) list = list.filter((p) => Number(p.price) <= max);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || ""),
        );
        break;
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    return list;
  }, [all, q, brand, sort, inStock, min, max]);

  useEffect(() => {
    if (filtersOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [filtersOpen]);

  const updateSearch = (patch) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === false || v === 0) {
        params.delete(k);
        if (k === "q") setQ("");
        if (k === "cat") setCat("");
        if (k === "brand") setBrand("");
        if (k === "sort") setSort("popular");
        if (k === "inStock") setInStock(false);
        if (k === "minPrice" || k === "min") setMin(0);
        if (k === "maxPrice" || k === "max") setMax(0);
      } else {
        params.set(k, String(v));
        if (k === "q") setQ(String(v));
        if (k === "cat") setCat(String(v));
        if (k === "brand") setBrand(String(v));
        if (k === "sort") setSort(String(v));
        if (k === "inStock") setInStock(v === "true" || v === true);
        if (k === "minPrice" || k === "min") setMin(Number(v) || 0);
        if (k === "maxPrice" || k === "max") setMax(Number(v) || 0);
      }
    });
    router.replace(`/electronics?${params.toString()}`, { scroll: false });
  };

  const activeFilterCount =
    (cat ? 1 : 0) + (brand ? 1 : 0) + (inStock ? 1 : 0) + (min > 0 ? 1 : 0) + (max > 0 ? 1 : 0);

  if (categoryHidden) return <ElectronicsEmptyState />;

  return (
    <>
      <CategoryHero
        accent="tech"
        eyebrow="Electronics Showroom"
        title="Premium tech, curated."
        description="Hand-picked headphones, smartwatches, speakers and more — built for performance and style."
        icon={<Cpu className="h-5 w-5" />}
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
                placeholder="Search headphones, smartwatches…"
                className="w-full rounded-full glass pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tech/30"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              className="rounded-full glass px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-tech/30 cursor-pointer relative z-20">
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center gap-2 rounded-full glass px-4 py-3 text-sm relative">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-tech text-tech-foreground text-[10px] font-bold grid place-items-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
            <aside className="hidden md:block">
              <FilterPanel
                search={{ cat, brand, inStock, min, max, minPrice: Number(searchParams.get("minPrice")) || 0, maxPrice: Number(searchParams.get("maxPrice")) || 0 }}
                subCats={subCats}
                categoryData={categoryData}
                brands={brands}
                maxPrice={maxPrice}
                update={updateSearch}
                onFilterChange={() => setFiltersOpen(false)}
              />
            </aside>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm"
                  onClick={() => setFiltersOpen(false)}>
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="fixed left-0 top-0 h-full w-[85%] max-w-xs bg-surface p-6 overflow-y-auto pt-28 custom-scrollbar shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="font-display font-semibold">Filters</div>
                      <button
                        onClick={() => setFiltersOpen(false)}
                        aria-label="Close"
                        className="group overflow-hidden">
                        <div className="relative h-5 w-5 overflow-hidden">
                          <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-5">
                            <X className="h-5 w-5 shrink-0" />
                            <X className="h-5 w-5 shrink-0" />
                          </div>
                        </div>
                      </button>
                    </div>
                    <FilterPanel
                      search={{ cat, brand, inStock, min, max, minPrice: Number(searchParams.get("minPrice")) || 0, maxPrice: Number(searchParams.get("maxPrice")) || 0 }}
                      subCats={subCats}
                      categoryData={categoryData}
                      brands={brands}
                      maxPrice={maxPrice}
                      update={updateSearch}
                      onFilterChange={() => setFiltersOpen(false)}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "product" : "products"}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() =>
                      updateSearch({
                        cat: "",
                        brand: "",
                        inStock: false,
                        min: 0,
                        max: 0,
                        minPrice: 0,
                        maxPrice: 0,
                      })
                    }
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    Clear filters <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl glass p-12 text-center">
                  <p className="text-muted-foreground">
                    No products match your filters.
                  </p>
                  <Link
                    href="/electronics"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-tech">
                    Reset <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((p, i) => (
                      <motion.div
                        key={p._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}>
                        <ProductCard product={p} index={i} />
                      </motion.div>
                    ))}
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

function FilterPanel({ search, subCats, categoryData, brands, maxPrice, update, onFilterChange }) {
  const [minInput, setMinInput] = useState(search.min || "");
  const [maxInput, setMaxInput] = useState(search.max || "");
  const minTimer = useRef(null);
  const maxTimer = useRef(null);

  useEffect(() => { setMinInput(search.minPrice || search.min || ""); }, [search.minPrice, search.min]);
  useEffect(() => { setMaxInput(search.maxPrice || search.max || ""); }, [search.maxPrice, search.max]);

  const handleMinChange = (e) => {
    const val = e.target.value;
    setMinInput(val);
    clearTimeout(minTimer.current);
    minTimer.current = setTimeout(() => {
      update({ minPrice: Number(val) || 0, min: 0 });
    }, 400);
  };

  const handleMaxChange = (e) => {
    const val = e.target.value;
    setMaxInput(val);
    clearTimeout(maxTimer.current);
    maxTimer.current = setTimeout(() => {
      update({ maxPrice: Number(val) || 0, max: 0 });
    }, 400);
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(minTimer.current);
      clearTimeout(maxTimer.current);
      update({ minPrice: Number(minInput) || 0, maxPrice: Number(maxInput) || 0, min: 0, max: 0 });
      if (onFilterChange) onFilterChange();
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Category
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              update({ cat: "" });
              if (onFilterChange) onFilterChange();
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!search.cat ? "bg-tech/15 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}>
            All Categories
          </button>
          {subCats.slice(0, 5).map((c) => {
            const sc = categoryData?.children?.find(s => s.slug === c);
            const label = sc?.name || c.charAt(0).toUpperCase() + c.slice(1);
            return (
              <button
                key={c}
                onClick={() => {
                  update({ cat: c });
                  if (onFilterChange) onFilterChange();
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${search.cat === c ? "bg-tech/15 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}>
                {label}
              </button>
            );
          })}
          {subCats.length > 5 && (
            <div className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
              + {subCats.length - 5} more categories
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Brand
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              update({ brand: "" });
              if (onFilterChange) onFilterChange();
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
              !search.brand ?
                "bg-tech/15 text-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent"
            }`}>
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => {
                update({ brand: b });
                if (onFilterChange) onFilterChange();
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                search.brand === b ?
                  "bg-tech/15 text-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent"
              }`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Price (PKR)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minInput}
            onChange={handleMinChange}
            onKeyDown={handlePriceKeyDown}
            className="rounded-lg glass px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tech/30"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxInput}
            onChange={handleMaxChange}
            onKeyDown={handlePriceKeyDown}
            className="rounded-lg glass px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tech/30"
          />
        </div>
        {maxPrice > 0 && (
          <div className="text-[11px] text-muted-foreground mt-2">
            Up to Rs {maxPrice.toLocaleString("en-PK")}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={search.inStock}
            onChange={(e) => {
              update({ inStock: e.target.checked });
              if (onFilterChange) onFilterChange();
            }}
            className="h-4 w-4 rounded accent-tech"
          />
          <span className="text-sm">In stock only</span>
        </label>
      </div>
    </div>
  );
}

function ElectronicsEmptyState() {
  const router = useRouter();
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-hero-gradient grid-bg pt-28 pb-24 flex items-center">
      <div className="absolute inset-0 noise" />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 -right-20 h-72 w-72 rounded-full bg-tech/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 -left-20 h-72 w-72 rounded-full bg-health/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-5 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs">
          <span className="h-7 w-7 rounded-full bg-tech-gradient grid place-items-center text-tech-foreground">
            <Cpu className="h-3.5 w-3.5" />
          </span>
          <span className="text-muted-foreground uppercase tracking-[0.25em]">
            Electronics Showroom
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
          Electronics products
          <br />
          <span className="text-gradient-tech">coming soon.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          We&apos;re curating a premium line of headphones, smartwatches,
          speakers and more. Until then, our nutrition store is fully stocked.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap justify-center gap-6">
          <TextButton
            text="Shop Nutrition"
            onClick={() => router.push("/supplements")}
            className="text-base px-8 py-4"
          />
          <TextButton
            text="Notify me"
            onClick={() =>
              window.open(
                "https://wa.me/923000000000?text=Hi%2C%20notify%20me%20when%20electronics%20launch",
                "_blank",
              )
            }
            className="text-base px-8 py-4 bg-white text-black border border-border hover:text-black"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-20 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              icon: Sparkles,
              label: "Hand-picked",
              desc: "Only the best devices from top global brands.",
              accent: "#f0fdf4",
            },
            {
              icon: Cpu,
              label: "Authentic",
              desc: "100% genuine tech with local warranty support.",
              accent: "#e0f2fe",
            },
            {
              icon: Bell,
              label: "Get notified",
              desc: "Be the first to know when our tech showroom opens.",
              accent: "#fefce8",
            },
          ].map((it) => (
            <RevealCardContainer
              key={it.label}
              accent={it.accent}
              textOnAccent="#0f172a"
              mutedOnAccent="#475569"
              className="w-full h-[240px]"
              base={
                <IdentityCardBody
                  fullName={it.label}
                  about={it.desc}
                  icon={it.icon}
                  scheme="plain"
                  displayAvatar={false}
                />
              }
              overlay={
                <IdentityCardBody
                  fullName={it.label}
                  about={it.desc}
                  icon={it.icon}
                  scheme="accented"
                  displayAvatar={false}
                  cardCss={{ backgroundColor: "var(--accent-color)" }}
                />
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function ElectronicsClient() {
  return (
    <Suspense>
      <ElectronicsContent />
    </Suspense>
  );
}
