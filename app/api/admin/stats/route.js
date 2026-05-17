import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import { requireAuth, securityHeaders, rateLimit } from "@/lib/security";

// Rate limiting for stats API
const STATS_RATE_LIMIT = { maxRequests: 60, windowMs: 60 * 1000 }; // 60 requests per minute

// GET /api/admin/stats
export async function GET(req) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(
    `stats:${ip}`,
    STATS_RATE_LIMIT.maxRequests,
    STATS_RATE_LIMIT.windowMs,
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: securityHeaders },
    );
  }

  try {
    // Check authentication
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: securityHeaders },
      );
    }

    await connectDB();

    // Get date ranges for statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Fetch all statistics in parallel
    const [
      productCount,
      orderCount,
      reviewCount,
      todaysOrders,
      weeksOrders,
      monthsOrders,
      allOrders,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Order.find({ createdAt: { $gte: today } })
        .select("pricing.total status")
        .lean(),
      Order.find({ createdAt: { $gte: weekAgo } })
        .select("pricing.total status")
        .lean(),
      Order.find({ createdAt: { $gte: monthAgo } })
        .select("pricing.total status payment")
        .lean(),
      Order.find().select("pricing.total status payment").lean(),
      Order.countDocuments({ status: "pending" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber customer.name pricing.total status createdAt")
        .lean(),
    ]);

    // Calculate revenue statistics
    const calculateRevenue = (orders) =>
      orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const revenue = {
      total: calculateRevenue(allOrders),
      today: calculateRevenue(todaysOrders),
      week: calculateRevenue(weeksOrders),
      month: calculateRevenue(monthsOrders),
    };

    // Calculate order status breakdown
    const statusBreakdown = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate payment status breakdown
    const paymentBreakdown = allOrders.reduce((acc, order) => {
      const status = order.payment?.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate average order value
    const avgOrderValue =
      orderCount > 0 ? Math.round(revenue.total / orderCount) : 0;

    // Calculate conversion (orders today / visitors estimate)
    // This is a placeholder - you would typically get this from analytics
    const conversionRate = 2.5; // Mock value - replace with real analytics

    return NextResponse.json(
      {
        productCount,
        orderCount,
        reviewCount,
        pendingOrders,
        revenue,
        avgOrderValue,
        conversionRate,
        statusBreakdown,
        paymentBreakdown,
        recentOrders: recentOrders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.customer?.name,
          total: o.pricing?.total,
          status: o.status,
          createdAt: o.createdAt,
        })),
        today: {
          orders: todaysOrders.length,
          revenue: revenue.today,
        },
        week: {
          orders: weeksOrders.length,
          revenue: revenue.week,
        },
        month: {
          orders: monthsOrders.length,
          revenue: revenue.month,
        },
      },
      { headers: securityHeaders },
    );
  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500, headers: securityHeaders },
    );
  }
}
