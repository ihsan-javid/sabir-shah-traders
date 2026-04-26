import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// GET /api/orders  (admin)
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/orders  (customer checkout)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const order = await Order.create(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
