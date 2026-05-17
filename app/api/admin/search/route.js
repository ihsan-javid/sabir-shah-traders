import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/security";

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [], orders: [], categories: [] });
    }

    await connectDB();

    const regex = new RegExp(query.trim(), "i");

    // Search Products
    const products = await Product.find({
      $or: [{ name: regex }, { brand: regex }, { category: regex }],
    })
      .limit(5)
      .select("name price image slug category");

    // Search Orders
    const orders = await Order.find({
      $or: [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.phone": regex },
      ],
    })
      .limit(5)
      .select("orderNumber customer status pricing.total");

    // Search Categories
    const categories = await Category.find({
      $or: [{ name: regex }, { slug: regex }],
    })
      .limit(5)
      .select("name slug");

    return NextResponse.json({ products, orders, categories });
  } catch (err) {
    console.error("Global search error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
