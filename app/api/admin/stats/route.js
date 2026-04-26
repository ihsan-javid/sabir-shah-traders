import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";

// GET /api/admin/stats
export async function GET() {
  try {
    await connectDB();
    const [productCount, orderCount, reviewCount, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Order.find().select("total status").lean(),
    ]);

    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;

    return NextResponse.json({ productCount, orderCount, reviewCount, revenue, pending });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
