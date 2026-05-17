import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getAuthUser, securityHeaders } from "@/lib/security";

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
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "No products provided for import" },
        { status: 400, headers: securityHeaders },
      );
    }

    const preparedProducts = [];
    const autoCreatedSubcats = [];

    for (const p of products) {
      if (p.category && p.subCategoryName) {
        const categoryDoc = await Category.findOne({ slug: p.category });
        if (categoryDoc) {
          const exists = (categoryDoc.children || []).some(
            sc => sc.slug === p.subCategory || sc.name.toLowerCase() === p.subCategoryName.toLowerCase()
          );
          if (!exists) {
            categoryDoc.children.push({
              name: p.subCategoryName,
              slug: p.subCategory,
              description: "",
              visible: true
            });
            await categoryDoc.save();
            autoCreatedSubcats.push(`${p.subCategoryName} (under ${categoryDoc.name})`);
          }
        }
      }

      let baseSlug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const sku = `SST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      preparedProducts.push({
        name: p.name,
        description: p.description || "",
        price: Number(p.price),
        category: p.category,
        subCategory: p.subCategory || "",
        stock: Number(p.stock) || 0,
        image: p.image || "",
        images: p.image ? [p.image] : [],
        slug: uniqueSlug,
        sku,
        active: true,
        popularity: 0,
      });
    }

    const inserted = await Product.insertMany(preparedProducts);

    return NextResponse.json(
      { success: true, count: inserted.length, autoCreatedSubcats },
      { headers: securityHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
