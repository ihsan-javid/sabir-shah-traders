import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema);

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    await connectDB();
    
    // Check if already exists
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    await Newsletter.create({ email });
    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
