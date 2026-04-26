"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPKR, products } from "@/lib/products";

export function SearchSidebar({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuery(""); // Reset query on open
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const results = query.trim() === "" ? [] : products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.brand.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-[100dvh] w-full max-w-md bg-surface z-[70] shadow-2xl border-l border-border flex flex-col"
          >
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="search"
                  placeholder="Search products, brands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full glass pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <button onClick={onClose} className="h-10 w-10 rounded-full glass grid place-items-center hover:bg-accent transition-colors shrink-0 group overflow-hidden">
                <div className="relative h-4 w-4 overflow-hidden">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                    <X className="h-4 w-4 shrink-0" />
                    <X className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {query.trim() !== "" && results.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                  No products found for "{query}"
                </div>
              )}
              {query.trim() === "" && (
                <div className="text-center text-muted-foreground mt-10 text-sm">
                  Start typing to search our catalog...
                </div>
              )}
              {results.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">
                    Products ({results.length})
                  </div>
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border hover:border-primary/30 transition-colors group"
                    >
                      <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 capitalize">{p.brand} · {p.category}</div>
                        <div className="text-sm font-medium mt-1">{formatPKR(p.price)}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
