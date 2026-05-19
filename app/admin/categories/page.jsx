"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { Checkbox } from "@/components/ui/checkbox";

function CategoryModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState(
    cat || { name: "", slug: "", description: "", visible: true },
  );
  const isNew = !cat?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
    toast.success(isNew ? "Category created!" : "Category updated!");
  };

  const autoSlug = (name) =>
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="font-bold text-[#111111]">
            {isNew ? "Create Category" : "Edit Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F3F4F6]">
            <X className="h-5 w-5 text-[#6B7280]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: autoSlug(e.target.value),
                })
              }
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#1E7A46]/60 focus:ring-2 focus:ring-[#1E7A46]/10"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#1E7A46]/60 font-mono text-[#6B7280]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#1E7A46]/60 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) =>
                  setForm({ ...form, visible: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/20">
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow m-0.5 transition-transform ${form.visible ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
            </label>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Visible to customers
            </span>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1E7A46] text-white text-sm font-semibold rounded-lg hover:bg-[#166a3a] transition-colors">
              {isNew ? "Create" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-lg hover:bg-[#F3F4F6]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryRow({
  cat,
  depth = 0,
  onEdit,
  onDelete,
  onToggle,
  onAddChild,
  selected,
  onSelect,
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children?.length > 0;

  return (
    <>
      <div
        className={`flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors border-b border-border ${depth > 0 ? "bg-muted/10" : ""} ${
          selected.includes(cat._id) ? "bg-primary/[0.03]" : ""
        }`}
        style={{ paddingLeft: `${12 + depth * 24}px` }}>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selected.includes(cat._id)}
            onCheckedChange={() => onSelect(cat._id)}
          />
          <GripVertical className="h-4 w-4 text-[#D1D5DB] cursor-grab flex-shrink-0" />
        </div>
        {hasChildren ?
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded text-[#9CA3AF] hover:text-[#111111]">
            {expanded ?
              <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />}
          </button>
        : <span className="w-5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm uppercase tracking-tight">
              {cat.name}
            </span>
            {!cat.visible && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-black uppercase tracking-widest border border-border">
                Hidden
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono opacity-60">
            /{cat.slug}
          </div>
        </div>
        <div className="text-xs text-[#9CA3AF] mr-4 flex-shrink-0">
          {cat.productCount || 0} products
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {depth === 0 && (
            <Tooltip content="Add Subcategory" position="top">
              <button
                onClick={() => onAddChild(cat)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#1E7A46]"
                title="Add subcategory">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          )}
          <Tooltip
            content={cat.visible ? "Hide Category" : "Show Category"}
            position="top">
            <button
              onClick={() => onToggle(cat)}
              className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111111]">
              {cat.visible ?
                <Eye className="h-3.5 w-3.5" />
              : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </Tooltip>
          <Tooltip content="Edit Category" position="top">
            <button
              onClick={() => onEdit(cat)}
              className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111111]">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Delete Category" position="top">
            <button
              onClick={() => onDelete(cat)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
      {hasChildren &&
        expanded &&
        cat.children.map((child) => (
          <CategoryRow
            key={child._id}
            cat={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onAddChild={onAddChild}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNew = () => setModal({ mode: "new" });
  const openEdit = (cat) => setModal({ mode: "edit", cat });
  const openAddChild = (parentCat) => setModal({ mode: "child", parentCat });

  const handleSave = async (form) => {
    if (modal.mode === "new") {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, children: [] }),
      });
    } else if (modal.mode === "edit") {
      // Could be a parent or child edit
      const isChild = !categories.find((c) => c._id === form._id);
      if (isChild) {
        // Find parent and update children array
        const parent = categories.find((c) =>
          c.children?.some((ch) => ch._id === form._id),
        );
        const updatedChildren = parent.children.map((ch) =>
          ch._id === form._id ? form : ch,
        );
        await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: parent._id,
            ...parent,
            children: updatedChildren,
          }),
        });
      } else {
        await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form._id, ...form }),
        });
      }
    } else if (modal.mode === "child") {
      const parent = modal.parentCat;
      const newChild = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        visible: form.visible,
      };
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parent._id,
          ...parent,
          children: [...(parent.children || []), newChild],
        }),
      });
    }
    fetchCategories();
  };

  const handleDelete = async (cat) => {
    setConfirmDelete(cat);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const cat = confirmDelete;
    const isChild = !categories.find((c) => c._id === cat._id);
    try {
      if (isChild) {
        const parent = categories.find((c) =>
          c.children?.some((ch) => ch._id === cat._id),
        );
        const updatedChildren = parent.children.filter(
          (ch) => ch._id !== cat._id,
        );
        await fetch(`/api/admin/categories?id=${parent._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: parent._id,
            ...parent,
            children: updatedChildren,
          }),
        });
      } else {
        await fetch(`/api/admin/categories?id=${cat._id}`, {
          method: "DELETE",
        });
      }
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setConfirmDelete(null);
    }
  };

  const onSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    const allIds = [];
    categories.forEach((cat) => {
      allIds.push(cat._id);
      if (cat.children) cat.children.forEach((child) => allIds.push(child._id));
    });
    setSelected(selected.length === allIds.length ? [] : allIds);
  };

  const handleBulkDelete = async () => {
    setBulkConfirm(true);
  };

  const executeBulkDelete = async () => {
    const count = selected.length;
    const toastId = toast.loading(
      `Deleting ${count} category${count !== 1 ? "ies" : ""}...`,
    );
    try {
      let successCount = 0;
      for (const id of selected) {
        try {
          const isParent = categories.find((c) => c._id === id);
          if (isParent) {
            const res = await fetch(`/api/admin/categories?id=${id}`, {
              method: "DELETE",
            });
            if (res.ok) successCount++;
          } else {
            const parent = categories.find((c) =>
              c.children?.some((ch) => ch._id === id),
            );
            if (parent) {
              const updatedChildren = parent.children.filter(
                (ch) => ch._id !== id,
              );
              const res = await fetch("/api/admin/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: parent._id,
                  ...parent,
                  children: updatedChildren,
                }),
              });
              if (res.ok) successCount++;
            }
          }
        } catch (err) {
          console.error("Error deleting category:", err);
        }
      }
      setSelected([]);
      fetchCategories();
      if (successCount > 0) {
        toast.success(
          `Successfully deleted ${successCount} category${successCount !== 1 ? "ies" : ""}`,
          { id: toastId },
        );
      } else {
        toast.error("Failed to delete categories", { id: toastId });
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Error deleting categories", { id: toastId });
    } finally {
      setBulkConfirm(false);
    }
  };

  const handleToggle = async (cat) => {
    const isChild = !categories.find((c) => c._id === cat._id);

    if (isChild) {
      const parent = categories.find((c) =>
        c.children?.some((ch) => ch._id === cat._id),
      );
      const updatedChildren = parent.children.map((ch) =>
        ch._id === cat._id ? { ...ch, visible: !ch.visible } : ch,
      );
      const { productCount, ...parentData } = parent;
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parent._id,
          ...parentData,
          children: updatedChildren,
        }),
      });
    } else {
      const { productCount, ...catData } = cat;
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat._id,
          ...catData,
          visible: !cat.visible,
        }),
      });
    }

    toast.success(cat.visible ? "Category hidden" : "Category visible");
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#1E7A46]/20 border-t-[#1E7A46] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">
            Categories
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            Organize your product catalog with nested categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest border border-red-200">
              <Trash2 className="h-4 w-4" /> Bulk Delete ({selected.length})
            </button>
          )}
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-[10px] font-black rounded-xl hover:bg-primary/90 transition-all shadow-glow-primary uppercase tracking-widest">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: categories.length },
          {
            label: "Subcategories",
            value: categories.reduce(
              (a, c) => a + (c.children?.length || 0),
              0,
            ),
          },
          {
            label: "Visible",
            value: categories.filter((c) => c.visible).length,
          },
          {
            label: "Hidden",
            value: categories.filter((c) => !c.visible).length,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl border border-border p-4 shadow-sm text-center hover:border-primary/20 transition-all">
            <div className="text-xl font-black text-foreground tracking-tight">
              {s.value}
            </div>
            <div className="text-[9px] font-black text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category Tree */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={
                selected.length > 0 &&
                selected.length ===
                  categories.length +
                    categories.reduce(
                      (acc, c) => acc + (c.children?.length || 0),
                      0,
                    )
              }
              onCheckedChange={selectAll}
            />
            <div className="grid grid-cols-4 flex-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <span className="col-span-2">Category Name</span>
              <span>Products</span>
              <span className="text-right">Actions</span>
            </div>
          </div>
        </div>
        <div>
          {categories.map((cat) => (
            <CategoryRow
              key={cat._id}
              cat={cat}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onAddChild={openAddChild}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
          {categories.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Plus className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                No categories found.
              </p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <CategoryModal
          cat={modal.mode === "edit" ? modal.cat : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will remove all subcategories and associations.`}
      />

      <ConfirmationModal
        isOpen={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete"
        message={`Are you sure you want to delete ${selected.length} selected categories?`}
      />
    </div>
  );
}
