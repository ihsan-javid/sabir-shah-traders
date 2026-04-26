import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { uploadImage } from "@/lib/cloudinary";

// GET /api/products
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = category ? { category } : {};
    const products = await Product.find(query).sort({ popularity: -1 }).lean();
    console.log(`API: Found ${products.length} products for category: ${category || 'all'}`);
    return NextResponse.json({ products, requestedCategory: category });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products  (admin)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { imageBase64, ...data } = body;

    if (imageBase64) {
      const { url, publicId } = await uploadImage(imageBase64, "sabir-shah-ecom/products");
      data.image = url;
      data.imagePublicId = publicId;
    }

    // auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const product = await Product.create(data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
