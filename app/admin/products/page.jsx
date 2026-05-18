"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  Filter,
  Copy,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Download,
} from "lucide-react";
import { formatPKR } from "@/lib/products";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

const CATEGORIES = ["supplements", "electronics"];

function Badge({ children, color = "gray" }) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-200/50",
    red: "bg-red-50 text-red-600 border-red-200/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/50",
    gray: "bg-muted text-muted-foreground border-border",
    blue: "bg-blue-50 text-blue-700 border-blue-200/50",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
}

function ProductForm({ product, isNew, onSave, onCancel, loading }) {
  const [form, setForm] = useState(() => {
    const images = Array.isArray(product.images) ? [...product.images] : (product.image ? [product.image] : []);
    return {
      ...product,
      images,
    };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  
  const [categories, setCategories] = useState([]);
  const [addingNewSub, setAddingNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      });
  }, []);

  const activeCategory = categories.find((c) => c.slug === (form.category || "supplements"));
  const subcategories = activeCategory?.children || [];

  const handleCategoryChange = (catSlug) => {
    setForm((f) => ({
      ...f,
      category: catSlug,
      subCategory: "",
    }));
    setAddingNewSub(false);
    setNewSubName("");
  };

  const handleSubCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      setAddingNewSub(true);
      set("subCategory", "");
    } else {
      setAddingNewSub(false);
      set("subCategory", val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingSub(true);
    let finalForm = { ...form };

    // If adding a brand new subcategory, save it to the DB first
    if (addingNewSub && newSubName.trim() && activeCategory) {
      const newSlug = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const exists = activeCategory.children?.some(s => s.slug === newSlug);
      if (!exists) {
        try {
          const newSubObj = { name: newSubName, slug: newSlug, visible: true };
          await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: activeCategory._id,
              ...activeCategory,
              children: [...(activeCategory.children || []), newSubObj]
            })
          });
          toast.success(`Created new subcategory "${newSubName}" successfully!`);
          finalForm.subCategory = newSlug;
        } catch (err) {
          console.error("Failed to create subcategory:", err);
          toast.error("Failed to create subcategory, but saving product...");
        }
      } else {
        finalForm.subCategory = newSlug;
      }
    }

    setSavingSub(false);
    onSave(finalForm);
  };

  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => {
          const currentImages = prev.images || [];
          const newImages = [...currentImages, reader.result];
          const primaryImage = prev.image || newImages[0];
          return {
            ...prev,
            images: newImages,
            image: primaryImage,
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => {
      const newImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      let primaryImage = prev.image;
      if (prev.image === prev.images[indexToRemove]) {
        primaryImage = newImages.length > 0 ? newImages[0] : "";
      }
      return {
        ...prev,
        images: newImages,
        image: primaryImage,
      };
    });
  };

  const setAsPrimary = (img) => {
    set("image", img);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isNew ? "Add New Product" : "Edit Product"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter product details below
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Product Name *
            </label>
            <input
              required
              value={form.name || ""}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Premium Whey Protein"
            />
          </div>
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Category *
            </label>
            <select
              value={form.category || "supplements"}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card">
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
              {categories.length === 0 && (
                <>
                  <option value="supplements">Supplements</option>
                  <option value="electronics">Electronics</option>
                </>
              )}
            </select>
          </div>
          {/* Subcategory */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Subcategory
            </label>
            <div className="space-y-3">
              {!addingNewSub ? (
                <select
                  value={form.subCategory || ""}
                  onChange={handleSubCategorySelect}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card"
                >
                  <option value="">-- Select Subcategory --</option>
                  {subcategories.map((s) => (
                    <option key={s._id || s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                  <option value="__add_new__" className="text-primary font-bold">
                    + Add New Subcategory...
                  </option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    required
                    value={newSubName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewSubName(name);
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      set("subCategory", slug);
                    }}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter new subcategory name..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAddingNewSub(false);
                      set("subCategory", "");
                      setNewSubName("");
                    }}
                    className="px-4 py-2.5 border border-border rounded-xl text-xs font-bold hover:bg-muted transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Brand
            </label>
            <input
              value={form.brand || ""}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Optimum Nutrition"
            />
          </div>
          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Price (PKR) *
            </label>
            <input
              type="number"
              required
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="0"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              value={form.stock ?? 0}
              onChange={(e) => set("stock", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Short Tagline
            </label>
            <input
              value={form.tagline || ""}
              onChange={(e) => set("tagline", e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. 100% Authentic"
            />
          </div>
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Product Description *
            </label>
            <textarea
              required
              rows={4}
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Detailed information about the product..."
            />
          </div>
          
          {/* Images Gallery */}
          <div className="md:col-span-2 border-t border-border pt-6">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Product Images / Gallery (Upload Multiple)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(form.images || []).map((img, idx) => {
                const isPrimary = form.image === img;
                return (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl border-2 overflow-hidden bg-muted group transition-all ${
                      isPrimary ? "border-primary shadow-glow-primary/20 scale-[1.02]" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Primary Badge */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {isPrimary ? (
                        <span className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAsPrimary(img)}
                          className="opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md hover:bg-black/80 transition-all"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              
              {/* Add Image Button Card */}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/20 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 text-muted-foreground hover:text-primary">
                <Plus className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImages}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wide">
              * Click "Make Primary" on any image card to set it as the primary cover image. You can select and upload multiple images at once.
            </p>
          </div>

          {/* Sizes */}
          <div className="md:col-span-2 border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Size / Variant Options
              </label>
              <button
                type="button"
                onClick={() =>
                  set("sizes", [...(form.sizes || []), { label: "", price: 0 }])
                }
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                <Plus className="h-3.5 w-3.5" /> Add New Variant
              </button>
            </div>
            <div className="space-y-3">
              {(form.sizes || []).map((sz, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-muted/20 p-3 rounded-xl border border-border/50 group transition-all hover:bg-muted/40">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input
                      placeholder="Label (e.g. 5LB / 2KG)"
                      value={sz.label}
                      onChange={(e) => {
                        const s = [...form.sizes];
                        s[i] = { ...s[i], label: e.target.value };
                        set("sizes", s);
                      }}
                      className="px-4 py-2 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Variant Price"
                      value={sz.price}
                      onChange={(e) => {
                        const s = [...form.sizes];
                        s[i] = { ...s[i], price: Number(e.target.value) };
                        set("sizes", s);
                      }}
                      className="px-4 py-2 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "sizes",
                        form.sizes.filter((_, idx) => idx !== i),
                      )
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {(form.sizes || []).length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                  No variants added yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
          <button
            type="submit"
            disabled={loading || savingSub}
            className="px-8 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 shadow-glow-primary uppercase tracking-widest">
            {loading || savingSub ?
              "Processing..."
            : isNew ?
              "Create Product"
            : "Update Product"}
          </button>
          {isNew && (
            <button
              type="button"
              onClick={() => onSave(form, true)}
              disabled={loading || savingSub}
              className="px-6 py-3 border border-emerald-600/35 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50 text-sm font-bold rounded-xl transition-all disabled:opacity-60 uppercase tracking-widest active:scale-95">
              Save & Add Another
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border border-border text-foreground text-sm font-bold rounded-xl hover:bg-muted transition-all uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selected, setSelected] = useState([]);
  const searchParams = useSearchParams();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    if (data.products) setProducts(data.products);
  };

  useEffect(() => {
    fetchProducts();
    if (searchParams.get("new") === "true") openNew();
  }, [searchParams]);

  const openNew = () => {
    setIsNew(true);
    setEditing({
      name: "",
      tagline: "",
      description: "",
      price: "",
      category: "supplements",
      subCategory: "",
      brand: "",
      stock: 0,
      popularity: 0,
      benefits: "",
      sizes: [],
      images: [],
    });
  };

  const saveProduct = async (form, addAnother = false) => {
    setLoading(true);
    const payload = {
      ...form,
      benefits:
        typeof form.benefits === "string" ?
          form.benefits.split(",").map((b) => b.trim())
        : form.benefits,
      sizes: (form.sizes || []).filter((sz) => sz.label.trim() !== ""),
    };
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/products" : `/api/products/${form._id}`;
    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      toast.success(isNew ? "Product created!" : "Product updated!");
      if (addAnother) {
        setEditing({
          name: "",
          tagline: form.tagline || "",
          description: form.description || "",
          price: "",
          category: form.category || "supplements",
          subCategory: form.subCategory || "",
          brand: form.brand || "",
          stock: 0,
          popularity: 0,
          benefits: form.benefits || "",
          sizes: [],
        });
        toast.info("Prefilled attributes for the next product. Enter a new Name and Price!");
      } else {
        setEditing(null);
      }
      fetchProducts();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to save");
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const inputElement = e.target;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          toast.error("Invalid CSV file (missing headers or data)");
          return;
        }

        // Normalize headers
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

        const importedProducts = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parser handling quotes
          const values = [];
          let currentVal = "";
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
              currentVal = "";
            } else {
              currentVal += char;
            }
          }
          values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

          if (values.length < 2) continue;

          const rawProduct = {};
          headers.forEach((h, idx) => {
            rawProduct[h] = values[idx] || "";
          });

          const name = rawProduct.name || rawProduct.title || "";
          if (!name) continue;

          const price = Number(rawProduct.price) || 0;
          const stock = Number(rawProduct.stock) || 0;
          const category = rawProduct.category || "supplements";
          
          // Capture subcategory beautifully
          const subCategoryName = rawProduct.subcategoryname || rawProduct.subcategory || rawProduct.subCategory || "";
          const subCategorySlug = subCategoryName
            ? subCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            : "";

          importedProducts.push({
            name,
            description: rawProduct.description || "",
            price,
            stock,
            category,
            subCategory: subCategorySlug,
            subCategoryName,
            brand: rawProduct.brand || "",
            image: rawProduct.image || rawProduct.imageUrl || "",
          });
        }

        if (importedProducts.length === 0) {
          toast.error("No valid products found in CSV. Headers should contain Name, Price, and Category.");
          return;
        }

        setLoading(true);
        const res = await fetch("/api/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: importedProducts }),
        });

        const d = await res.json();
        if (res.ok) {
          toast.success(`Successfully imported ${d.count} products!`);
          if (d.autoCreatedSubcats?.length > 0) {
            toast.info(`Created subcategories: ${d.autoCreatedSubcats.join(", ")}`);
          }
          fetchProducts();
        } else {
          toast.error(d.error || "Failed to import products");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error parsing or importing CSV");
      } finally {
        setLoading(false);
        inputElement.value = "";
      }
    };
    reader.readAsText(file);
  };

  const deleteProduct = async (id) => {
    const prod = products.find(p => p._id === id);
    if (prod) setConfirmDelete(prod);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    await fetch(`/api/products/${confirmDelete._id}`, { method: "DELETE" });
    toast.success("Product deleted");
    setConfirmDelete(null);
    fetchProducts();
  };

  const executeBulkDelete = async () => {
    setBulkConfirm(false);
    for (const id of selected) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    }
    setSelected([]);
    fetchProducts();
    toast.success("Deleted selected products");
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "low" && p.stock <= 5) ||
      (stockFilter === "out" && p.stock === 0) ||
      (stockFilter === "in" && p.stock > 5);
    return matchSearch && matchCat && matchStock;
  });

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const selectAll = () =>
    setSelected(
      filtered.length === selected.length ? [] : filtered.map((p) => p._id),
    );

  if (editing)
    return (
      <div className="pb-12">
        <ProductForm
          product={editing}
          isNew={isNew}
          onSave={saveProduct}
          onCancel={() => setEditing(null)}
          loading={loading}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">
            Products
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            <span className="font-semibold text-primary">
              {products.length}
            </span>{" "}
            total products in catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              exportToCSV(
                products.map((p) => ({
                  name: p.name,
                  brand: p.brand,
                  category: p.category,
                  price: p.price,
                  stock: p.stock,
                })),
                "Products_Catalog",
              )
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted transition-all shadow-sm active:scale-95">
            <Download className="h-4 w-4 text-primary" /> Export
          </button>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted transition-all shadow-sm active:scale-95 cursor-pointer">
            <Download className="h-4 w-4 text-emerald-600 rotate-180" /> Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-[10px] font-black rounded-xl hover:bg-primary/90 transition-all shadow-glow-primary uppercase tracking-widest">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="all">Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="all">Stock Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 ml-auto border-l border-border pl-4">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"}`}>
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"}`}>
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-top-2">
          <span className="text-sm font-bold text-primary">
            {selected.length} products selected
          </span>
          <button
            onClick={() => setBulkConfirm(true)}
            className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors uppercase tracking-wider">
            Delete Selected
          </button>
          <button
            onClick={() => setSelected([])}
            className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div
            className="overflow-x-auto custom-scrollbar overscroll-contain"
            data-lenis-prevent>
            <table className="w-full text-left text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-5 py-3 w-12 border-b border-border">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={selectAll}
                      className="rounded-md border-border text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    Product Details
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    Category
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    Pricing
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="group hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="rounded-md border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                          <img
                            src={p.image || "/placeholder.png"}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {p.name}
                          </div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {p.brand || "Generic Brand"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color="blue">{p.category}</Badge>
                    </td>
                    <td className="px-5 py-3 font-black text-foreground">
                      {formatPKR(p.price)}
                    </td>
                    <td className="px-5 py-3">
                      {p.stock === 0 ?
                        <Badge color="red">Out of stock</Badge>
                      : p.stock <= 5 ?
                        <Badge color="amber">{p.stock} units low</Badge>
                      : <Badge color="green">{p.stock} in stock</Badge>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setIsNew(true);
                            setEditing({
                              ...p,
                              _id: undefined,
                              slug: undefined,
                              sku: undefined,
                              name: `${p.name} (Copy)`,
                              benefits:
                                Array.isArray(p.benefits) ?
                                  p.benefits.join(", ")
                                : p.benefits,
                            });
                            toast.info("Product cloned! Make edits and click Save.");
                          }}
                          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm"
                          title="Clone Product">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsNew(false);
                            setEditing({
                              ...p,
                              benefits:
                                Array.isArray(p.benefits) ?
                                  p.benefits.join(", ")
                                : p.benefits,
                            });
                          }}
                          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-600 hover:border-red-600 transition-all shadow-sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              Showing {filtered.length} of {products.length} catalog items
            </p>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div
          className="overflow-y-auto max-h-[70vh] custom-scrollbar overscroll-contain pr-2"
          data-lenis-prevent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm gap-3">
                    <button
                      onClick={() => {
                        setIsNew(true);
                        setEditing({
                          ...p,
                          _id: undefined,
                          slug: undefined,
                          sku: undefined,
                          name: `${p.name} (Copy)`,
                          benefits:
                            Array.isArray(p.benefits) ?
                              p.benefits.join(", ")
                            : p.benefits,
                        });
                        toast.info("Product cloned! Make edits and click Save.");
                      }}
                      className="p-3 bg-white rounded-2xl shadow-xl text-emerald-600 hover:scale-110 transition-transform"
                      title="Clone Product">
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditing({
                          ...p,
                          benefits:
                            Array.isArray(p.benefits) ?
                              p.benefits.join(", ")
                            : p.benefits,
                        });
                      }}
                      className="p-3 bg-white rounded-2xl shadow-xl text-primary hover:scale-110 transition-transform">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="p-3 bg-white rounded-2xl shadow-xl text-red-500 hover:scale-110 transition-transform">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {p.stock === 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge color="red">Sold Out</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-sm font-bold text-foreground truncate mb-0.5">
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">
                    {p.category}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-bold text-primary">
                      {formatPKR(p.price)}
                    </div>
                    <div className="text-xs">
                      {p.stock <= 5 && p.stock > 0 && (
                        <span className="text-amber-600 font-bold">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">Your catalog is empty</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? All reviews associated with this product will also be deleted.`}
      />

      <ConfirmationModal
        isOpen={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete Products"
        message={`Are you sure you want to delete the ${selected.length} selected products?`}
      />
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }>
      <ProductsContent />
    </Suspense>
  );
}
