import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getAuthUser, securityHeaders } from "@/lib/security";
import {
  normalizeProductImagesInput,
  coerceProductPrimaryImage,
} from "@/lib/product-images";

import Review from "@/models/Review";

export const dynamic = "force-dynamic";

// GET /api/products (public)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = category && category !== "all" ? { category } : {};
    const minPrice = searchParams.get("minPrice") || searchParams.get("min") || searchParams.get("min_price");
    const maxPrice = searchParams.get("maxPrice") || searchParams.get("max") || searchParams.get("max_price");

    if ((minPrice && !isNaN(Number(minPrice))) || (maxPrice && !isNaN(Number(maxPrice)))) {
      const minVal = minPrice && !isNaN(Number(minPrice)) ? Number(minPrice) : -Infinity;
      const maxVal = maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : Infinity;

      const priceQuery = {
        $or: [
          // Case 1: Product has size variants and at least one size price is within range
          {
            sizes: {
              $elemMatch: {
                price: {
                  ...(minVal !== -Infinity ? { $gte: minVal } : {}),
                  ...(maxVal !== Infinity ? { $lte: maxVal } : {})
                }
              }
            }
          },
          // Case 2: Product has no size variants and base price is within range
          {
            $and: [
              { $or: [{ sizes: { $exists: false } }, { sizes: { $size: 0 } }] },
              {
                price: {
                  ...(minVal !== -Infinity ? { $gte: minVal } : {}),
                  ...(maxVal !== Infinity ? { $lte: maxVal } : {})
                }
              }
            ]
          }
        ]
      };

      query.$and = [...(query.$and || []), priceQuery];
    }

    const limitParam = searchParams.get("limit");
    const limitNum = limitParam ? parseInt(limitParam, 10) : 0; // 0 = no limit

    let dbQuery = Product.find(query).sort({ createdAt: -1 });
    if (limitNum > 0) dbQuery = dbQuery.limit(limitNum);

    const products = await dbQuery.lean();

    // Fetch all approved reviews to calculate true rating averages and counts
    const allApprovedReviews = await Review.find({ status: "approved" }).lean();
    const reviewsMapBySlug = {};
    for (const r of allApprovedReviews) {
      if (!r.productSlug) continue;
      if (!reviewsMapBySlug[r.productSlug]) {
        reviewsMapBySlug[r.productSlug] = [];
      }
      reviewsMapBySlug[r.productSlug].push(r);
    }

    // strip sizes and compare price from electronics for storefront, and inject true ratings
    const publicProducts = products.map((p) => {
      const copy = { ...p };
      const prodReviews = reviewsMapBySlug[p.slug] || [];
      const reviewsCount = prodReviews.length;
      const avgRating = reviewsCount > 0 ? (prodReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount) : 0;
      
      copy.rating = avgRating;
      copy.reviews = reviewsCount;

      if (copy.category === "electronics") {
        if (copy.sizes !== undefined) delete copy.sizes;
      }
      return copy;
    });

    return NextResponse.json({ products: publicProducts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products (admin)
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    await connectDB();
    const body = await req.json();
    const { images: rawImages, ...data } = body;

    if (rawImages !== undefined) {
      data.images = await normalizeProductImagesInput(rawImages);
      if (!data.image && data.images.length > 0) {
        data.image = data.images[0];
      }
    }

    if (data.image !== undefined) {
      const primary = await coerceProductPrimaryImage(data.image);
      if (primary === undefined) delete data.image;
      else data.image = primary;
    }

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const product = await Product.create(data);
    return NextResponse.json(
      { product },
      { status: 201, headers: securityHeaders },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders },
    );
  }
}
