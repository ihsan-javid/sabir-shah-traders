import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

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
