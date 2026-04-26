import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

// GET /api/products/[id]  (by _id or slug)
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product =
      (await Product.findById(id).lean().catch(() => null)) ||
      (await Product.findOne({ slug: id }).lean());
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { imageBase64, ...data } = body;

    const existing = await Product.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (imageBase64) {
      // delete old image
      if (existing.imagePublicId) await deleteImage(existing.imagePublicId);
      const { url, publicId } = await uploadImage(imageBase64, "sabir-shah-ecom/products");
      data.image = url;
      data.imagePublicId = publicId;
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (product.imagePublicId) await deleteImage(product.imagePublicId);
    await product.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
