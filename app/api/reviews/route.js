import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

// GET /api/reviews?productSlug=...&status=...
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productSlug = searchParams.get("productSlug");
    const status = searchParams.get("status"); // optional filter: 'pending'|'approved'

    const query = {};
    if (productSlug) query.productSlug = productSlug;
    if (status) query.status = status;

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

    // Enrich with product name for admin view
    const slugs = [...new Set(reviews.map((r) => r.productSlug).filter(Boolean))];
    const products = slugs.length
      ? await Product.find({ slug: { $in: slugs } }).select("slug name").lean()
      : [];
    const slugToName = {};
    for (const p of products) slugToName[p.slug] = p.name;

    const enriched = reviews.map((r) => ({
      ...r,
      productName: r.productSlug ? (slugToName[r.productSlug] || r.productSlug) : "Site-wide",
    }));

    return NextResponse.json({ reviews: enriched });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/reviews — new reviews start as pending
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // Force new reviews to approved directly without approval step needed
    const review = await Review.create({ ...body, status: "approved" });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
