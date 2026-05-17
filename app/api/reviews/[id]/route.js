import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

// PUT /api/reviews/[id] — approve, reject, or update reply
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Validate allowed status transitions
    const allowedStatuses = ["pending", "approved", "rejected"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(id, body, { new: true });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ review });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
