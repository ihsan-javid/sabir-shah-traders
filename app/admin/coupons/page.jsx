"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminButton,
  AdminIconButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminLabel,
  AdminStatCard,
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTHead,
  AdminTH,
  AdminTD,
  AdminSearchBar,
  AdminModal,
} from "@/components/admin/AdminShared";

function CouponFormModal({ coupon, onClose, onSave }) {
  const isNew = !coupon?._id;

  const getDatetimeLocalValue = (expiryVal) => {
    if (!expiryVal) return "";
    try {
      const date = new Date(expiryVal);
      if (isNaN(date.getTime())) return "";
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const [form, setForm] = useState(
    coupon || {
      code: "",
      type: "percent",
      value: "",
      minOrder: "",
      maxUses: "",
      expiry: "",
      active: true,
      description: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiry: form.expiry ? new Date(form.expiry).toISOString() : null,
        used: form.used || 0,
        usageCount: form.usageCount || 0,
        maxUses: Number(form.maxUses) || 0,
        maxUsage: Number(form.maxUses) || 0,
      };
      await onSave(payload);
      onClose();
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title={isNew ? "Create Coupon" : "Edit Coupon"}
      description="Manage coupon details and restrictions"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AdminLabel required>Coupon Code</AdminLabel>
          <AdminInput
            required
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="SUMMER50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel required>Type</AdminLabel>
            <AdminSelect
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount (PKR)</option>
            </AdminSelect>
          </div>
          <div>
            <AdminLabel required>{form.type === "percent" ? "Discount %" : "Amount (PKR)"}</AdminLabel>
            <AdminInput
              required
              type="number"
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
              max={form.type === "percent" ? 100 : undefined}
              placeholder={form.type === "percent" ? "10" : "500"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AdminLabel>Min Order (PKR)</AdminLabel>
            <AdminInput
              type="number"
              value={form.minOrder}
              onChange={(e) => set("minOrder", Number(e.target.value))}
              placeholder="1000"
            />
          </div>
          <div>
            <AdminLabel>Max Uses</AdminLabel>
            <AdminInput
              type="number"
              value={form.maxUses}
              onChange={(e) => set("maxUses", Number(e.target.value))}
              placeholder="0 for infinite"
            />
          </div>
        </div>

        <div>
          <AdminLabel>Expiry Date & Time</AdminLabel>
          <AdminInput
            type="datetime-local"
            value={getDatetimeLocalValue(form.expiry)}
            onChange={(e) => set("expiry", e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
        </div>

        <div>
          <AdminLabel>Description</AdminLabel>
          <AdminInput
            value={form.description || ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="e.g. Summer sale discount"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="couponActive"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <label htmlFor="couponActive" className="text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <AdminButton type="submit" loading={saving} className="flex-1">
            {isNew ? "Create Coupon" : "Save Changes"}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (saved) => {
    const isNew = !coupons.find((c) => c._id === saved._id);
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/coupons" : `/api/coupons/${saved._id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(saved),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to save coupon");
    }

    await fetchCoupons();
    toast.success(isNew ? "Coupon created!" : "Coupon updated!");
  };

  const toggleActive = async (id, current) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify({ active: !current }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      await fetchCoupons();
      toast.success("Coupon status updated!");
    } else {
      toast.error("Failed to update coupon status");
    }
  };

  const handleDelete = (c) => {
    setConfirmDelete(c);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const res = await fetch(`/api/coupons/${confirmDelete._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c._id !== confirmDelete._id));
      toast.success("Coupon deleted");
    } else {
      toast.error(data.error || "Failed to delete coupon");
    }
    setConfirmDelete(null);
  };

  const executeBulkDelete = async () => {
    try {
      const results = await Promise.all(
        selected.map((id) => fetch(`/api/coupons/${id}`, { method: "DELETE" })),
      );
      toast.success(`${selected.length} coupons deleted`);
      setSelected([]);
      fetchCoupons();
    } catch {
      toast.error("Bulk delete failed");
    } finally {
      setBulkConfirm(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c._id));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const now = new Date();
  const isExpired = (expiry) => expiry ? new Date(expiry) < now : false;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Coupons"
        description="Create and manage customer discount coupons"
        actions={
          <>
            {selected.length > 0 && (
              <AdminButton
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setBulkConfirm(true)}
              >
                Bulk Delete ({selected.length})
              </AdminButton>
            )}
            <AdminButton
              variant="primary"
              icon={Plus}
              onClick={() => setModal({ mode: "new" })}
            >
              Create Coupon
            </AdminButton>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          label="Total Coupons"
          value={coupons.length}
          icon={Tag}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <AdminStatCard
          label="Active"
          value={coupons.filter((c) => c.active && !isExpired(c.expiry)).length}
          icon={ToggleRight}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <AdminStatCard
          label="Expired"
          value={coupons.filter((c) => isExpired(c.expiry)).length}
          icon={Calendar}
          colorClass="text-red-500"
          bgClass="bg-red-500/10"
        />
        <AdminStatCard
          label="Total Used"
          value={coupons.reduce((a, c) => a + (c.usageCount ?? c.used ?? 0), 0)}
          icon={Users}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
      </div>

      {/* Table */}
      <AdminCard noPadding>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <AdminSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons..."
          />
        </div>
        <AdminTable>
          <AdminTHead>
            <AdminTH className="w-10">
              <Checkbox
                checked={filtered.length > 0 && selected.length === filtered.length}
                onCheckedChange={selectAll}
              />
            </AdminTH>
            <AdminTH>Code</AdminTH>
            <AdminTH>Discount</AdminTH>
            <AdminTH>Min Order</AdminTH>
            <AdminTH>Usage (Count)</AdminTH>
            <AdminTH>Expiry</AdminTH>
            <AdminTH>Status</AdminTH>
            <AdminTH className="text-right">Actions</AdminTH>
          </AdminTHead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((c) => {
              const expired = isExpired(c.expiry);
              const maxLimit = c.maxUsage || c.maxUses || 0;
              const currentUsage = c.usageCount ?? c.used ?? 0;
              const usagePercent = maxLimit ? Math.round((currentUsage / maxLimit) * 100) : 0;
              return (
                 <tr
                  key={c._id}
                  className={`hover:bg-muted/30 transition-colors border-b border-border/50 group ${selected.includes(c._id) ? "bg-primary/[0.03]" : ""} ${expired ? "opacity-60 bg-muted/20" : ""}`}
                >
                  <AdminTD>
                    <Checkbox
                      checked={selected.includes(c._id)}
                      onCheckedChange={() => toggleSelect(c._id)}
                    />
                  </AdminTD>
                  <AdminTD>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-foreground text-xs bg-muted px-2 py-1 rounded-lg border border-border">
                        {c.code}
                      </span>
                      <AdminIconButton
                        icon={Copy}
                        label="Copy Code"
                        size="sm"
                        onClick={() => copyCode(c.code)}
                      />
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black mt-1 uppercase tracking-widest opacity-60">
                      {c.description}
                    </div>
                  </AdminTD>
                  <AdminTD>
                    <div className="flex items-center gap-1 font-black text-foreground uppercase tracking-tight text-xs">
                      {c.type === "percent" ? (
                        <Percent className="h-3 w-3 text-primary" />
                      ) : (
                        <DollarSign className="h-3 w-3 text-primary" />
                      )}
                      {c.type === "percent" ? (
                        `${c.value}% off`
                      ) : (
                        `PKR ${Number(c.value).toLocaleString()} off`
                      )}
                    </div>
                  </AdminTD>
                  <AdminTD className="text-xs text-muted-foreground font-medium uppercase">
                    PKR {Number(c.minOrder || 0).toLocaleString()}
                  </AdminTD>
                  <AdminTD>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      {currentUsage} / {maxLimit || "∞"} used
                    </div>
                    {maxLimit > 0 && (
                      <div className="h-1 w-20 bg-muted rounded-full overflow-hidden border border-border/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? "bg-red-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(100, usagePercent)}%` }}
                        />
                      </div>
                    )}
                  </AdminTD>
                  <AdminTD className={`text-[11px] font-bold ${expired ? "text-red-500 font-extrabold" : "text-muted-foreground"}`}>
                    {c.expiry ? new Date(c.expiry).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "No expiry"}
                  </AdminTD>
                  <AdminTD>
                    {expired ? (
                      <AdminBadge variant="red">Expired</AdminBadge>
                    ) : maxLimit > 0 && currentUsage >= maxLimit ? (
                      <AdminBadge variant="amber">Limit Reached</AdminBadge>
                    ) : (
                      <AdminBadge variant={c.active ? "green" : "default"}>
                        {c.active ? "Active" : "Inactive"}
                      </AdminBadge>
                    )}
                  </AdminTD>
                  <AdminTD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <AdminIconButton
                        icon={c.active ? ToggleRight : ToggleLeft}
                        label={c.active ? "Deactivate" : "Activate"}
                        size="sm"
                        onClick={() => toggleActive(c._id, c.active)}
                      />
                      <AdminIconButton
                        icon={Pencil}
                        label="Edit"
                        size="sm"
                        onClick={() => setModal({ mode: "edit", coupon: c })}
                      />
                      <AdminIconButton
                        icon={Trash2}
                        label="Delete"
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(c)}
                      />
                    </div>
                  </AdminTD>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      {modal && (
        <CouponFormModal
          coupon={modal.mode === "edit" ? modal.coupon : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${confirmDelete?.code}"? This action cannot be undone.`}
      />

      <ConfirmationModal
        isOpen={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete"
        message={`Are you sure you want to delete ${selected.length} selected coupons?`}
      />
    </div>
  );
}
