import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth, securityHeaders } from "@/lib/security";

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
    }

    await connectDB();

    // Aggregate unique customers from orders
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer.phone",
          name: { $first: "$customer.name" },
          email: { $first: "$customer.email" },
          phone: { $first: "$customer.phone" },
          city: { $first: "$shipping.city" },
          joined: { $min: "$createdAt" },
          orders: { $sum: 1 },
          spent: { $sum: "$pricing.total" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          email: 1,
          phone: 1,
          city: 1,
          joined: 1,
          orders: 1,
          spent: 1,
          lastOrder: 1,
          status: { $literal: "Active" } // In this simplified system, all are active
        }
      },
      { $sort: { lastOrder: -1 } }
    ]);

    return NextResponse.json({ customers }, { headers: securityHeaders });
  } catch (err) {
    console.error("Customers API error:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500, headers: securityHeaders });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAuth(req, "super_admin");
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: securityHeaders });
    }

    await connectDB();
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400, headers: securityHeaders });
    }

    // Deleting a customer means deleting all their orders in this simplified extraction model
    await Order.deleteMany({ "customer.phone": phone });

    return NextResponse.json({ message: "Customer and their orders deleted successfully" }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500, headers: securityHeaders });
  }
}
