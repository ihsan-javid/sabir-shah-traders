"use client";

import { useState, useEffect } from "react";
import { Shield, Save, Truck, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminTextarea,
  AdminPageHeader,
  AdminSpinner,
} from "@/components/admin/AdminShared";

export default function PoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    privacy: "",
    refund: "",
    terms: "",
    shipping: "",
  });
  const [saving, setSaving] = useState({
    privacy: false,
    refund: false,
    terms: false,
    shipping: false,
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/policies", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const p = data.policies || {};
        setForm({
          privacy: p.privacy || "",
          refund: p.refund || "",
          terms: p.terms || "",
          shipping: p.shipping || "",
        });
      } else {
        toast.error("Failed to load policies");
      }
    } catch {
      toast.error("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSavePolicy = async (type) => {
    setSaving((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/policies/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form[type] }),
      });
      if (res.ok) {
        const titleMap = {
          privacy: "Privacy Policy",
          refund: "Refund Policy",
          shipping: "Shipping Policy",
          terms: "Terms of Service",
        };
        toast.success(`${titleMap[type] || type} saved successfully!`);
      } else {
        const errData = await res.json();
        toast.error(errData.error || `Failed to save ${type} policy`);
      }
    } catch {
      toast.error(`Failed to save ${type} policy`);
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Policy Manager"
          description="Edit and publish legal policies instantly across the storefront"
        />
        <AdminCard>
          <div className="py-12 flex justify-center">
            <AdminSpinner />
          </div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Policy Manager"
        description="Edit and publish legal policies instantly across the storefront"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Privacy Policy */}
        <AdminCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Privacy Policy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Explain how you handle, collect, and protect customer personal data.</p>
              </div>
            </div>
            <AdminButton
              type="button"
              loading={saving.privacy}
              onClick={() => handleSavePolicy("privacy")}
              icon={Save}
              className="py-2.5 px-5 self-start sm:self-auto"
            >
              Save Privacy Policy
            </AdminButton>
          </div>
          <div>
            <AdminLabel required>Privacy Policy Content</AdminLabel>
            <AdminTextarea
              required
              value={form.privacy}
              onChange={(e) => set("privacy", e.target.value)}
              rows={12}
              placeholder="Write your Privacy Policy here..."
            />
          </div>
        </AdminCard>

        {/* Refund & Return Policy */}
        <AdminCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Refund Policy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Outline return windows, exchange criteria, and payment processing rules.</p>
              </div>
            </div>
            <AdminButton
              type="button"
              loading={saving.refund}
              onClick={() => handleSavePolicy("refund")}
              icon={Save}
              className="py-2.5 px-5 self-start sm:self-auto"
            >
              Save Refund Policy
            </AdminButton>
          </div>
          <div>
            <AdminLabel required>Refund Policy Content</AdminLabel>
            <AdminTextarea
              required
              value={form.refund}
              onChange={(e) => set("refund", e.target.value)}
              rows={12}
              placeholder="Write your Refund Policy here..."
            />
          </div>
        </AdminCard>

        {/* Shipping Policy */}
        <AdminCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Shipping Policy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">List estimated delivery speeds, tracking workflows, and rate structures.</p>
              </div>
            </div>
            <AdminButton
              type="button"
              loading={saving.shipping}
              onClick={() => handleSavePolicy("shipping")}
              icon={Save}
              className="py-2.5 px-5 self-start sm:self-auto"
            >
              Save Shipping Policy
            </AdminButton>
          </div>
          <div>
            <AdminLabel required>Shipping Policy Content</AdminLabel>
            <AdminTextarea
              required
              value={form.shipping}
              onChange={(e) => set("shipping", e.target.value)}
              rows={12}
              placeholder="Write your Shipping Policy here..."
            />
          </div>
        </AdminCard>

        {/* Terms of Service */}
        <AdminCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Terms of Service</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Detail usage guidelines, user accounts, and other general store agreements.</p>
              </div>
            </div>
            <AdminButton
              type="button"
              loading={saving.terms}
              onClick={() => handleSavePolicy("terms")}
              icon={Save}
              className="py-2.5 px-5 self-start sm:self-auto"
            >
              Save Terms of Service
            </AdminButton>
          </div>
          <div>
            <AdminLabel required>Terms of Service Content</AdminLabel>
            <AdminTextarea
              required
              value={form.terms}
              onChange={(e) => set("terms", e.target.value)}
              rows={12}
              placeholder="Write your Terms of Service here..."
            />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
