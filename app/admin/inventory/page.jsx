"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AdminSpinner,
  AdminError,
  AdminButton,
  AdminBadge,
} from "@/components/admin/AdminShared";
import {
  Package,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  RotateCcw,
  Download,
  Info,
} from "lucide-react";
import { formatPKR } from "@/lib/payments";

export default function AdminInventory() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all"); // all | low | out | healthy

  // Categories list
  const [categories, setCategories] = useState([]);

  // Expanded variant rows
  const [expandedRows, setExpandedRows] = useState({});

  // Local editing states (productId -> base stock or sizeIndex -> stock)
  const [editingStocks, setEditingStocks] = useState({}); // productId: value or `${productId}-${sizeIndex}`: value
  const [savingId, setSavingId] = useState(null);

  const fetchInventory = async () => {
    try {
      const authRes = await fetch("/api/admin/check-auth", { credentials: "include" });
      if (!authRes.ok) {
        router.push("/admin-login");
        return;
      }

      const res = await fetch("/api/admin/inventory", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to load inventory");
      }

      const data = await res.json();
      const productList = data.products || [];
      setProducts(productList);

      // Extract unique categories
      const uniqueCats = Array.from(new Set(productList.map((p) => p.category).filter(Boolean)));
      setCategories(uniqueCats);

      // Initialize editing states
      const initialEdits = {};
      productList.forEach((p) => {
        if (p.sizes && p.sizes.length > 0) {
          p.sizes.forEach((s, idx) => {
            initialEdits[`${p._id}-${idx}`] = s.stock;
          });
        } else {
          initialEdits[p._id] = p.stock;
        }
      });
      setEditingStocks(initialEdits);

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [router]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (stockStatus !== "all") {
      result = result.filter((p) => {
        if (stockStatus === "out") return p.stock === 0;
        if (stockStatus === "low") return p.stock > 0 && p.stock < 5;
        if (stockStatus === "healthy") return p.stock >= 5;
        return true;
      });
    }

    setFilteredProducts(result);
  }, [products, search, category, stockStatus]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStockChange = (key, val) => {
    const numeric = Math.max(0, parseInt(val) || 0);
    setEditingStocks((prev) => ({ ...prev, [key]: numeric }));
  };

  const incrementStock = (key) => {
    setEditingStocks((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const decrementStock = (key) => {
    setEditingStocks((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
  };

  // Save stock level to DB
  const saveProductStock = async (product) => {
    const isVariant = product.sizes && product.sizes.length > 0;
    setSavingId(product._id);

    try {
      let payload = { id: product._id };

      if (isVariant) {
        // Map current local values to sizes array
        payload.sizes = product.sizes.map((s, idx) => ({
          ...s,
          stock: editingStocks[`${product._id}-${idx}`] ?? s.stock,
        }));
      } else {
        payload.stock = editingStocks[product._id] ?? product.stock;
      }

      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to save changes");
      }

      const data = await res.json();
      if (data.success) {
        // Update main state
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, ...data.product } : p))
        );
      }
    } catch (err) {
      toast.error("Error saving: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <AdminBadge variant="red">Out of Stock</AdminBadge>;
    if (stock < 5) return <AdminBadge variant="amber">Low Stock</AdminBadge>;
    return <AdminBadge variant="green">Healthy</AdminBadge>;
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product Name,Category,SKU,Variant,Stock,Status\n";

    products.forEach((p) => {
      const statusText = p.stock === 0 ? "Out of Stock" : p.stock < 5 ? "Low Stock" : "Healthy";
      if (p.sizes && p.sizes.length > 0) {
        p.sizes.forEach((s) => {
          csvContent += `"${p.name}","${p.category}","${s.sku || p.sku || ""}","${s.label}",${s.stock},"${statusText}"\n`;
        });
      } else {
        csvContent += `"${p.name}","${p.category}","${p.sku || ""}",Standard,${p.stock},"${statusText}"\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sabir_shah_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <AdminSpinner className="h-[70vh]" />;
  if (error) return <AdminError message={error} onRetry={fetchInventory} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Inventory Manager
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            Monitor and adjust stock levels for all products & variants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-all active:scale-95">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="all">All Stock Statuses</option>
              <option value="healthy">Healthy (5+ items)</option>
              <option value="low">Low Stock (1-4 items)</option>
              <option value="out">Out of Stock (0 items)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Product Details</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Category</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Base SKU</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border text-center">In Stock</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Status</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border text-center">Adjust Stock</th>
                <th className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isVariant = product.sizes && product.sizes.length > 0;
                  const isExpanded = expandedRows[product._id];
                  const localStock = editingStocks[product._id] ?? product.stock;

                  const hasModified = isVariant
                    ? product.sizes.some((s, idx) => editingStocks[`${product._id}-${idx}`] !== s.stock)
                    : editingStocks[product._id] !== product.stock;

                  return (
                    <React.Fragment key={product._id}>
                      <tr className={`hover:bg-muted/10 transition-colors ${isExpanded ? "bg-muted/5" : ""}`}>
                        {/* Details */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/40">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground line-clamp-1">{product.name}</div>
                              {isVariant && (
                                <button
                                  onClick={() => toggleRow(product._id)}
                                  className="text-[10px] font-bold text-primary flex items-center gap-1 mt-0.5 hover:underline uppercase tracking-wider">
                                  {product.sizes.length} variants
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {product.category || "-"}
                          </span>
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                          {product.sku || "-"}
                        </td>

                        {/* In Stock */}
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-bold text-foreground">{product.stock}</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {getStockBadge(product.stock)}
                        </td>

                        {/* Adjust Stock */}
                        <td className="px-5 py-4">
                          {!isVariant ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => decrementStock(product._id)}
                                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="number"
                                value={localStock}
                                onChange={(e) => handleStockChange(product._id, e.target.value)}
                                className="w-16 px-2 py-1 text-center font-bold text-sm bg-muted/20 border border-border rounded-lg focus:outline-none focus:border-primary transition-all"
                              />
                              <button
                                onClick={() => incrementStock(product._id)}
                                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground italic flex items-center justify-center gap-1">
                              <Info className="h-3 w-3" /> Expand variants
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasModified && (
                              <button
                                onClick={() => saveProductStock(product)}
                                disabled={savingId === product._id}
                                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-sm">
                                {savingId === product._id ? (
                                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                            )}

                            {hasModified && (
                              <button
                                onClick={() => {
                                  // Reset local value
                                  const refreshed = { ...editingStocks };
                                  if (isVariant) {
                                    product.sizes.forEach((s, idx) => {
                                      refreshed[`${product._id}-${idx}`] = s.stock;
                                    });
                                  } else {
                                    refreshed[product._id] = product.stock;
                                  }
                                  setEditingStocks(refreshed);
                                }}
                                className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-all">
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED VARIANT ROWS */}
                      {isVariant && isExpanded && (
                        <tr>
                          <td colSpan="7" className="p-0 bg-muted/10">
                            <div className="px-6 py-4 space-y-3 border-l-4 border-primary/50 bg-muted/5">
                              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Variant Levels</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.sizes.map((size, idx) => {
                                  const sizeKey = `${product._id}-${idx}`;
                                  const curStock = editingStocks[sizeKey] ?? size.stock;
                                  const isSizeModified = size.stock !== curStock;

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3.5 bg-card border border-border/80 rounded-xl hover:shadow-sm transition-all">
                                      <div>
                                        <div className="font-bold text-sm text-foreground">{size.label}</div>
                                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{size.sku || "No SKU"}</div>
                                      </div>

                                      <div className="flex items-center gap-4">
                                        {/* Status */}
                                        {getStockBadge(size.stock)}

                                        {/* Adjust */}
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => decrementStock(sizeKey)}
                                            className="p-1 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                                            <Minus className="h-3 w-3" />
                                          </button>
                                          <input
                                            type="number"
                                            value={curStock}
                                            onChange={(e) => handleStockChange(sizeKey, e.target.value)}
                                            className="w-14 px-1.5 py-0.5 text-center font-bold text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:border-primary transition-all"
                                          />
                                          <button
                                            onClick={() => incrementStock(sizeKey)}
                                            className="p-1 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                                            <Plus className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                    No products found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
