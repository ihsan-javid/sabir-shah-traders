import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser, securityHeaders } from "@/lib/security";

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { _id, __v, createdAt, updatedAt, productCount, ...updateData } =
      body;

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404, headers: securityHeaders },
      );
    }

    return NextResponse.json(category, { headers: securityHeaders });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: securityHeaders });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const { id } = await params;
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ ok: true }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: securityHeaders });
  }
}