import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getAuthUser, securityHeaders } from "@/lib/security";

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const categories = await Category.find().sort({ createdAt: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat.slug,
        });
        return { ...cat.toObject(), productCount };
      }),
    );

    return NextResponse.json(categoriesWithCount, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500, headers: securityHeaders });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const body = await req.json();
    
    // Auto-generate slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201, headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: securityHeaders });
  }
}

export async function PUT(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400, headers: securityHeaders });
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(category, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: securityHeaders });
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: securityHeaders });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400, headers: securityHeaders });
    }

    // Check if category has products
    const cat = await Category.findById(id);
    if (cat) {
      const count = await Product.countDocuments({ category: cat.slug });
      if (count > 0) {
        return NextResponse.json({ error: `Cannot delete category with ${count} products` }, { status: 400, headers: securityHeaders });
      }
      await Category.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: securityHeaders });
  }
}
