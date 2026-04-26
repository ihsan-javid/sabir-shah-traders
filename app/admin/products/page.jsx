"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { toast } from "sonner";
import { FlowButton } from "@/components/ui/flow-button";
import { TextButton } from "@/components/ui/text-button";

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.products) setProducts(data.products);
  };

  const openNew = () => {
    setIsNew(true);
    setEditing({
      name: "", tagline: "", description: "", price: "", oldPrice: "",
      category: "supplements", subCategory: "", brand: "", stock: 0,
      popularity: 0, benefits: "",
    });
  };

  useEffect(() => {
    fetchProducts();
    if (searchParams.get("new") === "true") {
      openNew();
    }
  }, [searchParams]);

  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...editing, benefits: typeof editing.benefits === "string" ? editing.benefits.split(",").map(b => b.trim()) : editing.benefits };
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/products" : `/api/products/${editing._id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    setLoading(false);
    if (res.ok) {
      toast.success(isNew ? "Product created" : "Product updated");
      setEditing(null);
      fetchProducts();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save product");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Product deleted");
    fetchProducts();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditing({ ...editing, imageBase64: reader.result, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (editing) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">{isNew ? "New Product" : "Edit Product"}</h1>
          <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <form onSubmit={saveProduct} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs text-muted-foreground">Product Name</span>
              <input required value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Category</span>
              <select value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none">
                <option value="supplements">Supplements</option>
                <option value="electronics">Electronics</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Price (PKR)</span>
              <input type="number" required value={editing.price} onChange={e => setEditing({...editing, price: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-muted-foreground">Description</span>
              <textarea required rows={4} value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
            </label>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block mb-2">Product Image</span>
              <div className="flex items-center gap-4">
                {editing.image ? (
                  <img src={editing.image} alt="preview" className="h-20 w-20 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-surface border border-dashed border-border grid place-items-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
              </div>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">Stock</span>
              <input type="number" value={editing.stock} onChange={e => setEditing({...editing, stock: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Brand</span>
              <input type="text" value={editing.brand} onChange={e => setEditing({...editing, brand: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
            </label>
          </div>
          <TextButton
            type="submit"
            disabled={loading}
            text={loading ? "Saving..." : "Save Product"}
          />
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <FlowButton text="Add Product" onClick={openNew} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-accent/50 transition-colors">
                <td className="px-5 py-3 flex items-center gap-3">
                  <img src={p.image || "/placeholder.png"} alt="" className="h-10 w-10 rounded-lg object-cover bg-surface" />
                  <div className="font-semibold">{p.name}</div>
                </td>
                <td className="px-5 py-3 capitalize">{p.category}</td>
                <td className="px-5 py-3">{formatPKR(p.price)}</td>
                <td className="px-5 py-3">
                  {p.stock === 0 ? <span className="text-destructive font-semibold">Out of stock</span> : p.stock}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => { setIsNew(false); setEditing({ ...p, benefits: p.benefits.join(", ") }); }} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteProduct(p._id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={<div>Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
