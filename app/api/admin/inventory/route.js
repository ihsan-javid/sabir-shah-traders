import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAuth, securityHeaders, rateLimit } from "@/lib/security";

const INVENTORY_RATE_LIMIT = { maxRequests: 100, windowMs: 60 * 1000 };

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(`inventory_get:${ip}`, INVENTORY_RATE_LIMIT.maxRequests, INVENTORY_RATE_LIMIT.windowMs);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: securityHeaders });
  }

  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
    }

    await connectDB();
    const products = await Product.find({})
      .select("name sku stock sizes category image active")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ products }, { headers: securityHeaders });
  } catch (err) {
    console.error("Inventory GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: securityHeaders });
  }
}

export async function PUT(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rateLimitResult = rateLimit(`inventory_put:${ip}`, INVENTORY_RATE_LIMIT.maxRequests, INVENTORY_RATE_LIMIT.windowMs);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: securityHeaders });
  }

  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
    }

    const { id, stock, sizes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400, headers: securityHeaders });
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404, headers: securityHeaders });
    }

    if (sizes && Array.isArray(sizes)) {
      product.sizes = sizes;
      // Sync parent stock as sum of all variant stocks
      product.stock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    } else if (stock !== undefined) {
      product.stock = Number(stock) || 0;
    }

    await product.save();

    return NextResponse.json({ success: true, product }, { headers: securityHeaders });
  } catch (err) {
    console.error("Inventory PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: securityHeaders });
  }
}
