import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { requireAuth, securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Date range
    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[range] || 30;
    const since = new Date(now);
    since.setDate(since.getDate() - days);

    // Today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── Parallel DB queries ─────────────────────────────────────────────────
    const [allOrders, rangeOrders, todayOrders, products] = await Promise.all([
      Order.find().select("pricing.total status payment customer.name createdAt items").lean(),
      Order.find({ createdAt: { $gte: since } }).select("pricing.total status createdAt items").lean(),
      Order.find({ createdAt: { $gte: today } }).select("pricing.total").lean(),
      Product.find({ active: true }).select("name price popularity").lean(),
    ]);

    // ── KPI Totals ──────────────────────────────────────────────────────────
    const totalRevenue = allOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0);

    // Unique customers by name (approximate)
    const uniqueCustomers = new Set(allOrders.map((o) => o.customer?.name).filter(Boolean)).size;

    // ── Revenue over time (bucketed per day) ────────────────────────────────
    // Build a map: dateString -> revenue
    const revenueByDay = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      revenueByDay[key] = 0;
    }
    for (const o of rangeOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (key in revenueByDay) {
        revenueByDay[key] += o.pricing?.total || 0;
      }
    }
    const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // ── Orders by status ────────────────────────────────────────────────────
    const STATUS_COLORS = {
      delivered:  "#1E7A46",
      processing: "#3B82F6",
      confirmed:  "#6366F1",
      pending:    "#F59E0B",
      shipped:    "#8B5CF6",
      cancelled:  "#EF4444",
      refunded:   "#9CA3AF",
      returned:   "#6B7280",
    };
    const statusMap = {};
    for (const o of allOrders) {
      const s = o.status || "pending";
      statusMap[s] = (statusMap[s] || 0) + 1;
    }
    const ordersByStatus = Object.entries(statusMap).map(([label, count]) => ({
      label,
      count,
      color: STATUS_COLORS[label] || "#9CA3AF",
    }));

    // ── Top products by revenue ─────────────────────────────────────────────
    const productRevMap = {};
    const productUnitsMap = {};
    for (const o of allOrders) {
      for (const item of (o.items || [])) {
        const key = item.name || item.productId;
        if (!key) continue;
        productRevMap[key] = (productRevMap[key] || 0) + (item.price || 0) * (item.qty || 1);
        productUnitsMap[key] = (productUnitsMap[key] || 0) + (item.qty || 1);
      }
    }
    const topProducts = Object.entries(productRevMap)
      .map(([name, revenue]) => ({
        name,
        revenue,
        units: productUnitsMap[name] || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json(
      {
        kpi: {
          totalRevenue,
          totalOrders,
          uniqueCustomers,
          avgOrderValue,
          todayRevenue,
          todayOrders: todayOrders.length,
          rangeRevenue: rangeOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0),
          rangeOrders: rangeOrders.length,
        },
        revenueChart,
        ordersByStatus,
        topProducts,
      },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500, headers: securityHeaders }
    );
  }
}
