"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Star,
  Search,
  Sparkles,
  TrendingUp,
  Award,
  Check,
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";

export default function BestsellersAdminPage() {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'bestsellers', 'suggestions'
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/bestsellers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch bestseller data");
      const data = await res.json();
      setProducts(data.products || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bestseller settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBestseller = async (productId, currentStatus) => {
    setUpdatingId(productId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, bestseller: newStatus } : p))
    );
    setSuggestions((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, bestseller: newStatus } : p))
    );

    try {
      const res = await fetch("/api/admin/bestsellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, bestseller: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update bestseller state");

      const data = await res.json();
      toast.success(
        newStatus
          ? `"${data.product.name}" marked as Bestseller!`
          : `"${data.product.name}" removed from Bestsellers`
      );

      // Refresh to recalculate suggestion scores & lists correctly
      const refreshRes = await fetch("/api/admin/bestsellers", { cache: "no-store" });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProducts(refreshData.products || []);
        setSuggestions(refreshData.suggestions || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bestseller");
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, bestseller: currentStatus } : p))
      );
      setSuggestions((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, bestseller: currentStatus } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "bestsellers") return p.bestseller;
      if (filterType === "suggestions") return suggestions.some((s) => s._id === p._id);
      return true;
    });
  }, [products, searchQuery, filterType, suggestions]);

  const bestsellersCount = useMemo(() => {
    return products.filter((p) => p.bestseller).length;
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Bestseller Management
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            Toggle bestsellers manually or accept intelligent suggestion score metrics based on real purchases and views.
          </p>
        </div>
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 self-start">
          <Star className="h-4 w-4 fill-primary" />
          <span>{bestsellersCount} Bestsellers active</span>
        </div>
      </div>

      {/* AUTO-SUGGESTIONS HERO PANEL */}
      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.02] to-primary/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Intelligent Bestseller Recommendations
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Top performing items based on purchases & views
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.slice(0, 3).map((p) => (
              <div
                key={p._id}
                className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-3.5 hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full flex items-center justify-center translate-x-3 -translate-y-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-3.5 w-3.5 text-primary opacity-60" />
                </div>
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-xs font-bold text-foreground truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase tracking-wider">
                      Score: {p.suggestionScore} pts
                    </span>
                    <span className="text-[8px] text-muted-foreground uppercase tracking-widest">
                      {p.orderCount} orders
                    </span>
                  </div>
                </div>
                <Tooltip content="Approve Bestseller Status" position="top">
                  <button
                    onClick={() => handleToggleBestseller(p._id, false)}
                    className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center transition-all shadow-glow-primary hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CATALOG FILTER TABLE */}
      <div className="space-y-4">
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 border border-border bg-card rounded-xl px-3 py-2 w-full sm:max-w-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex bg-muted/30 border border-border rounded-xl p-1 shrink-0 self-stretch sm:self-auto">
            {[
              { id: "all", label: "All Products" },
              { id: "bestsellers", label: "Bestsellers Only" },
              { id: "suggestions", label: "Suggested Candidates" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table Container */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="py-4 px-5">Product Details</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5 text-center">Popularity Views</th>
                  <th className="py-4 px-5 text-center">Orders Count</th>
                  <th className="py-4 px-5 text-center">Score Metric</th>
                  <th className="py-4 px-5 text-right">Bestseller Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr
                    key={p._id}
                    className={`hover:bg-muted/10 transition-colors ${
                      p.bestseller ? "bg-primary/[0.01]" : ""
                    }`}
                  >
                    {/* Details */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-muted border border-border/80"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm tracking-tight truncate max-w-xs sm:max-w-sm">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 tracking-wider">
                            SKU: {p.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-black uppercase tracking-wider">
                        {p.category}
                      </span>
                    </td>

                    {/* Popularity */}
                    <td className="py-3.5 px-5 text-center font-semibold text-sm">
                      {p.popularity || 0}
                    </td>

                    {/* Order count */}
                    <td className="py-3.5 px-5 text-center font-semibold text-sm">
                      {p.orderCount || 0}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-5 text-center">
                      <span className="text-[10px] font-black tracking-wider text-primary">
                        {p.suggestionScore || 0} pts
                      </span>
                    </td>

                    {/* Bestseller Toggle */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {p.bestseller && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                            <Star className="h-2.5 w-2.5 fill-primary" /> Bestseller
                          </span>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.bestseller}
                            disabled={updatingId === p._id}
                            onChange={() => handleToggleBestseller(p._id, p.bestseller)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/20">
                            <div
                              className={`w-4 h-4 bg-white rounded-full shadow m-0.5 transition-transform ${
                                p.bestseller ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-medium">No products found matching filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
