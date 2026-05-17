import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdminNotification from "@/models/AdminNotification";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Settings from "@/models/Settings";
import { getAuthUser, securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const username = user?.username || "admin";

    const settings = (await Settings.findOne().lean()) || {};
    const prefs = settings.notifications || {};
    const lowStockThreshold =
      prefs.lowStockThreshold != null ? Number(prefs.lowStockThreshold) : 5;

    // Auto-generate notifications for recent events if they don't exist
    if (prefs.newOrder !== false) {
      const pendingOrders = await Order.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      for (const order of pendingOrders) {
        const exists = await AdminNotification.findOne({
          relatedId: `order-${order._id}`,
        });
        if (!exists) {
          await AdminNotification.create({
            type: "order",
            icon: "ShoppingCart",
            message: `New order ${order.orderNumber} placed`,
            href: `/admin/orders?search=${order.orderNumber}`,
            relatedId: `order-${order._id}`,
            createdAt: order.createdAt,
          });
        }
      }
    }

    if (prefs.lowStock !== false) {
      const lowStockProducts = await Product.find({
        stock: { $lt: lowStockThreshold, $gte: 0 },
      }).lean();
      for (const product of lowStockProducts) {
        const exists = await AdminNotification.findOne({
          relatedId: `stock-${product._id}`,
        });
        if (!exists) {
          await AdminNotification.create({
            type: "stock",
            icon: "Package",
            message: `${product.name} is low on stock (${product.stock} left)`,
            href: `/admin/products?search=${encodeURIComponent(product.name)}`,
            relatedId: `stock-${product._id}`,
            createdAt: product.updatedAt || new Date(),
          });
        }
      }
    }

    if (prefs.newReview !== false) {
      const recentReviews = await Review.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []);
      for (const review of recentReviews) {
        const exists = await AdminNotification.findOne({
          relatedId: `review-${review._id}`,
        });
        if (!exists) {
          await AdminNotification.create({
            type: "review",
            icon: "Star",
            message: `New ${review.rating}-star review from ${review.name || "a customer"}`,
            href: `/admin/reviews`,
            relatedId: `review-${review._id}`,
            createdAt: review.createdAt,
          });
        }
      }
    }

    const dbNotifications = await AdminNotification.find({
      clearedBy: { $nin: [username] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Map to frontend format
    const notifications = dbNotifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      icon: n.icon,
      message: n.message,
      time: n.createdAt,
      href: n.href,
      read: n.readBy?.includes(username) || n.isRead || false,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const username = user?.username || "admin";

    const body = await req.json();
    const { action, id } = body;

    if (action === "mark_all_read") {
      await AdminNotification.updateMany(
        { readBy: { $ne: username } },
        { $addToSet: { readBy: username }, $set: { isRead: true } },
      );
    } else if (action === "mark_read" && id) {
      await AdminNotification.findByIdAndUpdate(id, {
        $addToSet: { readBy: username },
        $set: { isRead: true },
      });
    } else if (action === "clear_all") {
      await AdminNotification.updateMany(
        { clearedBy: { $ne: username } },
        { $addToSet: { clearedBy: username }, $set: { isCleared: true } },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
