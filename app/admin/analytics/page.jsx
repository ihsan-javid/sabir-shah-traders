"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Sparkles,
  Download,
  Package,
} from "lucide-react";
import { formatPKR } from "@/lib/products";
import {
  AdminSpinner,
  AdminEmpty,
  AdminError,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminButton,
  AdminPageHeader,
} from "@/components/admin/AdminShared";

// ── Tiny bar chart ─────────────────────────────────────────────────────────
function BarChartSimple({ data = [], color = "var(--primary)" }) {
  const values = data.map((d) => d.revenue ?? d);
  const max = Math.max(...values, 1);
  if (!values.length) return null;
  return (
    <div className="flex items-end gap-1.5 h-40 group/chart pt-8">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(v / max) * 100}%` }}
            transition={{ duration: 1, delay: i * 0.03, ease: "easeOut" }}
            className="w-full rounded-t-md transition-all hover:brightness-110 relative overflow-hidden shadow-sm"
            style={{ background: color, opacity: 0.65 + (i / values.length) * 0.35 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </motion.div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border shadow-2xl px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none z-20 whitespace-nowrap">
            <div className="text-[9px] font-black text-primary uppercase tracking-widest">{formatPKR(v)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Export helper ────────────────────────────────────────────────────────────
async function downloadExport(type) {
  const res = await fetch(`/api/admin/export?type=${type}`, { credentials: "include" });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  const fetchData = async (r = range) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?range=${r}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      await downloadExport(type);
    } catch {
      // toast handled by caller
    } finally {
      setExporting(null);
    }
  };

  // Label generation for x-axis
  const xLabels = (() => {
    if (!data?.revenueChart) return [];
    const n = data.revenueChart.length;
    if (range === "7d") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (range === "30d") {
      return data.revenueChart.map((d, i) => (i % 5 === 0 ? `Day ${i + 1}` : ""));
    }
    // 90d – show month short names
    return data.revenueChart.map((d) => {
      const dt = new Date(d.date);
      return dt.getDate() === 1 ? dt.toLocaleString("default", { month: "short" }) : "";
    });
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Analytics"
        description="Sales performance and business insights — live from database"
        actions={
          <div className="flex items-center gap-3">
            {/* Range selector */}
            <div className="flex items-center bg-card border border-border rounded-xl p-1 gap-1 shadow-sm">
              {[["7d", "7 Days"], ["30d", "30 Days"], ["90d", "90 Days"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${range === key ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <AdminButton
              variant="secondary"
              icon={Download}
              onClick={() => handleExport("orders")}
              loading={exporting === "orders"}
            >
              Export Orders
            </AdminButton>
          </div>
        }
      />

      {loading && <AdminSpinner />}
      {!loading && error && <AdminError message={error} onRetry={() => fetchData(range)} />}

      {!loading && !error && data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              label="Total Revenue"
              value={formatPKR(data.kpi?.totalRevenue || 0)}
              icon={DollarSign}
              subtext="All time"
            />
            <AdminStatCard
              label="Period Revenue"
              value={formatPKR(data.kpi?.rangeRevenue || 0)}
              icon={TrendingUp}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
              subtext={range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
            />
            <AdminStatCard
              label="Total Orders"
              value={data.kpi?.totalOrders || 0}
              icon={ShoppingCart}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
              subtext={`${data.kpi?.rangeOrders || 0} in period`}
            />
            <AdminStatCard
              label="Avg Order Value"
              value={formatPKR(data.kpi?.avgOrderValue || 0)}
              icon={Users}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
              subtext={`${data.kpi?.uniqueCustomers || 0} customers`}
            />
          </div>

          {/* Today's Summary */}
          <AdminCard>
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">
              Today&apos;s Activity
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Orders Today", value: data.kpi?.todayOrders || 0, color: "text-foreground" },
                { label: "Revenue Today", value: formatPKR(data.kpi?.todayRevenue || 0), color: "text-primary" },
                { label: "Avg Order Value", value: formatPKR(data.kpi?.avgOrderValue || 0), color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-muted/50 rounded-xl border border-border/50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Revenue Chart */}
          <div className="bg-card rounded-2xl border border-border p-5 lg:p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <TrendingUp className="h-20 w-20 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Revenue Trend</h2>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">
                  Period total:{" "}
                  <span className="text-primary font-black">{formatPKR(data.kpi?.rangeRevenue || 0)}</span>
                </p>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div className="relative z-10">
              {(data.revenueChart || []).every((d) => d.revenue === 0) ? (
                <AdminEmpty
                  icon={TrendingUp}
                  title="No revenue data in this period"
                  description="Revenue will appear here once orders are placed."
                />
              ) : (
                <>
                  <BarChartSimple data={data.revenueChart || []} />
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-4 font-black uppercase tracking-widest opacity-60 px-2">
                    {xLabels.map((l, i) => (
                      <span key={i}>{l}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Two Column: Top Products + Orders by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Products */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <AdminCardHeader title="Top Products by Revenue" />
              <div className="divide-y divide-border/50">
                {(data.topProducts || []).length === 0 ? (
                  <AdminEmpty icon={Package} title="No product sales data yet" />
                ) : (
                  (data.topProducts || []).map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                      <span className="text-[10px] font-black text-muted-foreground w-5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{p.name}</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                          {p.units} units sold
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-primary">{formatPKR(p.revenue)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <AdminCardHeader title="Orders by Status" />
              <div className="p-5 space-y-4">
                {(data.ordersByStatus || []).length === 0 ? (
                  <AdminEmpty icon={ShoppingCart} title="No orders yet" />
                ) : (() => {
                  const total = (data.ordersByStatus || []).reduce((a, s) => a + s.count, 0);
                  return (data.ordersByStatus || []).map((s, i) => (
                    <div key={s.label} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider capitalize">{s.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{s.count}</span>
                          <span className="text-xs font-black text-primary">{total ? Math.round((s.count / total) * 100) : 0}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: total ? `${(s.count / total) * 100}%` : "0%" }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full shadow-sm relative overflow-hidden"
                          style={{ background: s.color }}
                        >
                          <div className="absolute inset-0 bg-white/20" />
                        </motion.div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Export Reports */}
          <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">Export Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Orders", type: "orders", desc: "All order details" },
                { label: "Customers", type: "customers", desc: "Customer acquisition & spend" },
                { label: "Products", type: "products", desc: "Catalog with pricing" },
                { label: "Coupons", type: "coupons", desc: "Discount code usage" },
                { label: "Reviews", type: "reviews", desc: "Customer feedback" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-all">
                  <div>
                    <div className="text-sm font-bold text-foreground uppercase tracking-tight">{r.label}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mt-1">{r.desc}</div>
                  </div>
                  <AdminButton
                    variant="secondary"
                    icon={Download}
                    size="sm"
                    loading={exporting === r.type}
                    onClick={() => handleExport(r.type)}
                  >
                    CSV
                  </AdminButton>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
