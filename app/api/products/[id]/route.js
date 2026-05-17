import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getAuthUser, securityHeaders } from "@/lib/security";
import {
  normalizeProductImagesInput,
  coerceProductPrimaryImage,
} from "@/lib/product-images";
import { deleteImagesByUrls, deleteImage } from "@/lib/cloudinaryUpload";

export const dynamic = "force-dynamic";

// GET /api/products/[id]  (by _id or slug) — public
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product =
      (await Product.findById(id).lean().catch(() => null)) ||
      (await Product.findOne({ slug: id }).lean());
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const copy = { ...product };
    if (copy.category === "electronics") {
      if (copy.sizes !== undefined) delete copy.sizes;
    }

    return NextResponse.json({ product: copy });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/products/[id] — admin
export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { images: rawImages, ...data } = body;

    const existing = await Product.findById(id);
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

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

    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ product }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders },
    );
  }
}

// DELETE /api/products/[id] — admin
export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const urls = [product.image, ...(product.images || [])].filter(Boolean);
    await deleteImagesByUrls(urls);

    if (product.imagePublicId) {
      await deleteImage(product.imagePublicId).catch(() => {});
    }

    await product.deleteOne();
    return NextResponse.json({ success: true }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders },
    );
  }
}
