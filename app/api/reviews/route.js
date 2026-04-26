import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

// GET /api/reviews?productSlug=...
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productSlug = searchParams.get("productSlug");
    const query = productSlug ? { productSlug } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const review = await Review.create(body);
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
