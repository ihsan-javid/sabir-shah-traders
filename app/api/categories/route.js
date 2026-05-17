import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({
      createdAt: 1,
    });
    
    let result = categories.map((cat) => ({
      ...cat.toObject(),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("categories GET error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
