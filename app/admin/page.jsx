"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSpinner,
  AdminError,
} from "@/components/admin/AdminShared";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings2,
  BarChart2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Globe,
} from "lucide-react";

import Link from "next/link";
import { formatPKR } from "@/lib/payments";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

function StatCard({
  label,
  value,
  growth,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10",
  glowClass = "shadow-glow-primary",
}) {
  const positive = growth >= 0;

  return (
    <div className="group bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`h-9 w-9 rounded-xl ${bgClass} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>

        <span
          className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
            positive ?
              "bg-green-50 text-green-600 border border-green-100"
            : "bg-red-50 text-red-500 border border-red-100"
          }`}>
          {positive ?
            <ArrowUpRight className="h-2.5 w-2.5" />
          : <ArrowDownRight className="h-2.5 w-2.5" />}
          {Math.abs(growth)}%
        </span>
      </div>

      <div className="text-xl font-black text-foreground tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
        {label}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    revenue: { total: 0, today: 0, week: 0, month: 0 },
    orderCount: 0,
    productCount: 0,
    reviewCount: 0,
    pendingOrders: 0,
    recentOrders: [],
    avgOrderValue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AUTH CHECK & STATS FETCH
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check auth
        const authRes = await fetch("/api/admin/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (!authRes.ok) {
          router.push("/admin-login");
          return;
        }

        // Fetch stats
        const statsRes = await fetch("/api/admin/stats", {
          method: "GET",
          credentials: "include",
        });

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
          setError(null);
        } else {
          throw new Error("Failed to fetch stats");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return <AdminSpinner className="h-[70vh]" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <AdminError message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            Performance overview for your store
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <BarChart2 className="h-4 w-4" />
            Reports
          </Link>

          <Link
            href="/admin/products?new=true"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-glow-primary">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={formatPKR(stats.revenue?.total || 0)}
          growth={12.5}
          icon={DollarSign}
        />

        <StatCard
          label="Total Orders"
          value={stats.orderCount || 0}
          growth={8.2}
          icon={ShoppingCart}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />

        <StatCard
          label="Products"
          value={stats.productCount || 0}
          growth={5.3}
          icon={Package}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />

        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders || 0}
          growth={stats.pendingOrders > 0 ? -5 : 0}
          icon={TrendingUp}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* TODAY'S SUMMARY */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">
          Today&apos;s Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Orders Today
            </div>
            <div className="text-xl font-bold text-foreground">
              {stats.today?.orders || 0}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Revenue Today
            </div>
            <div className="text-xl font-bold text-primary">
              {formatPKR(stats.today?.revenue || 0)}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Avg Order Value
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatPKR(stats.avgOrderValue || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-5">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Products",
              href: "/admin/products",
              icon: Package,
            },
            {
              label: "Orders",
              href: "/admin/orders",
              icon: ShoppingCart,
            },
            {
              label: "Analytics",
              href: "/admin/analytics",
              icon: BarChart2,
            },
            {
              label: "Customers",
              href: "/admin/customers",
              icon: Users,
            },
            {
              label: "Settings",
              href: "/admin/settings",
              icon: Settings2,
            },
            {
              label: "SEO",
              href: "/admin/seo",
              icon: Globe,
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="h-4 w-4 text-primary" />
              </div>

              <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
            Recent Orders
          </h2>

          <Link
            href="/admin/orders"
            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
            View All
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div
          className="divide-y divide-border/50 max-h-96 overflow-y-auto custom-scrollbar overscroll-contain"
          data-lenis-prevent>
          {stats.recentOrders && stats.recentOrders.length > 0 ?
            stats.recentOrders.map((order) => {
              const date =
                order.createdAt ?
                  new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                  })
                : "-";
              return (
                <div
                  key={order.orderNumber}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                      {order.customer?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {order.customer || "Unknown"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="font-mono">{order.orderNumber}</span>
                        <span>•</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-foreground">
                      {formatPKR(order.total || 0)}
                    </div>
                    <span
                      className={`inline-block text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full mt-0.5 ${
                        STATUS_STYLES[order.status] ||
                        "bg-muted text-muted-foreground"
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })
          : <div className="px-6 py-10 text-center text-muted-foreground">
              No recent orders found
            </div>
          }
        </div>
      </div>
    </div>
  );
}
