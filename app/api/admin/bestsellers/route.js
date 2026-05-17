import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Fetch all products
    const products = await Product.find().sort({ name: 1 }).lean();

    // Fetch all orders to count purchases
    const orders = await Order.find().lean();
    const orderCounts = {};

    for (const order of orders) {
      if (!order.items || !Array.isArray(order.items)) continue;
      for (const item of order.items) {
        if (!item.productId) continue;
        const pid = String(item.productId);
        orderCounts[pid] = (orderCounts[pid] || 0) + (item.qty || 1);
      }
    }

    // Map products to include stats
    const productsWithStats = products.map((p) => {
      const orderCount = orderCounts[String(p._id)] || 0;
      const popularity = p.popularity || 0;
      // suggestion score balances real orders and page popularity
      const suggestionScore = orderCount * 10 + popularity;
      return {
        ...p,
        orderCount,
        suggestionScore,
      };
    });

    // Generate suggestions (top 5 by score that are not currently bestseller)
    const suggestions = [...productsWithStats]
      .filter((p) => !p.bestseller)
      .sort((a, b) => b.suggestionScore - a.suggestionScore)
      .slice(0, 5);

    return NextResponse.json(
      {
        products: productsWithStats,
        suggestions,
      },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("Bestsellers API GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bestseller data" },
      { status: 500, headers: securityHeaders }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { productId, bestseller } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400, headers: securityHeaders }
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { bestseller: Boolean(bestseller) },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("Bestsellers API PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update bestseller state" },
      { status: 500, headers: securityHeaders }
    );
  }
}
