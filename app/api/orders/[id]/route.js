import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// GET /api/orders/[id]
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/orders/[id]  — update status
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/orders/[id]
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
