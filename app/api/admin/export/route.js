import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Review from "@/models/Review";
import { requireAuth, securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]).join(",");
  const lines = rows.map((row) =>
    Object.values(row)
      .map((v) => {
        const s = String(v ?? "").replace(/"/g, '""');
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
      })
      .join(",")
  );
  return [headers, ...lines].join("\n");
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // orders | customers | products | coupons | reviews

    let csv = "";
    let filename = `export_${new Date().toISOString().slice(0, 10)}`;

    if (type === "orders") {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      const rows = orders.map((o) => ({
        OrderNumber: o.orderNumber || "",
        Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
        Status: o.status || "",
        CustomerName: o.customer?.name || "",
        CustomerPhone: o.customer?.phone || "",
        CustomerEmail: o.customer?.email || "",
        City: o.shipping?.city || "",
        Address: o.shipping?.address || "",
        Items: (o.items || []).map((i) => `${i.name} x${i.qty}`).join(" | "),
        Subtotal: o.pricing?.subtotal || 0,
        Shipping: o.pricing?.shipping || 0,
        Discount: o.pricing?.discount || 0,
        Total: o.pricing?.total || 0,
        PaymentMethod: o.payment?.method || "",
        Notes: o.shipping?.notes || "",
      }));
      csv = toCSV(rows);
      filename = `Orders_Export_${new Date().toISOString().slice(0, 10)}`;
    } else if (type === "customers") {
      const orders = await Order.find().select("customer.name customer.phone customer.email shipping.city pricing.total createdAt").lean();
      // Group by phone
      const map = {};
      for (const o of orders) {
        const phone = o.customer?.phone || "unknown";
        if (!map[phone]) {
          map[phone] = {
            Name: o.customer?.name || "",
            Phone: phone,
            Email: o.customer?.email || "",
            City: o.shipping?.city || "",
            TotalOrders: 0,
            TotalSpent: 0,
            FirstOrder: o.createdAt,
            LastOrder: o.createdAt,
          };
        }
        map[phone].TotalOrders++;
        map[phone].TotalSpent += o.pricing?.total || 0;
        if (new Date(o.createdAt) < new Date(map[phone].FirstOrder)) map[phone].FirstOrder = o.createdAt;
        if (new Date(o.createdAt) > new Date(map[phone].LastOrder)) map[phone].LastOrder = o.createdAt;
      }
      const rows = Object.values(map).map((c) => ({
        ...c,
        FirstOrder: c.FirstOrder ? new Date(c.FirstOrder).toLocaleDateString() : "",
        LastOrder: c.LastOrder ? new Date(c.LastOrder).toLocaleDateString() : "",
      }));
      csv = toCSV(rows);
      filename = `Customers_Export_${new Date().toISOString().slice(0, 10)}`;
    } else if (type === "products") {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      const rows = products.map((p) => ({
        Name: p.name || "",
        Slug: p.slug || "",
        Category: p.category || "",
        SubCategory: p.subCategory || "",
        Brand: p.brand || "",
        Price: p.price || 0,
        Stock: p.stock || 0,
        Active: p.active ? "Yes" : "No",
        Bestseller: p.bestseller ? "Yes" : "No",
        Featured: p.featured ? "Yes" : "No",
        Rating: p.rating || 0,
        Reviews: p.reviews || 0,
        SKU: p.sku || "",
        CreatedAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      }));
      csv = toCSV(rows);
      filename = `Products_Export_${new Date().toISOString().slice(0, 10)}`;
    } else if (type === "coupons") {
      const coupons = await Coupon.find().lean();
      const rows = coupons.map((c) => ({
        Code: c.code || "",
        Type: c.type || "",
        Value: c.value || 0,
        MinOrder: c.minOrder || 0,
        MaxUses: c.maxUses || 0,
        Used: c.used || 0,
        UsageCount: c.usageCount || 0,
        MaxUsage: c.maxUsage || 0,
        Active: c.active ? "Yes" : "No",
        Expiry: c.expiry ? new Date(c.expiry).toLocaleDateString() : "",
        Description: c.description || "",
        CreatedAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      }));
      csv = toCSV(rows);
      filename = `Coupons_Export_${new Date().toISOString().slice(0, 10)}`;
    } else if (type === "reviews") {
      const reviews = await Review.find().sort({ createdAt: -1 }).lean();
      const rows = reviews.map((r) => ({
        Name: r.name || "",
        City: r.city || "",
        ProductSlug: r.productSlug || "site-wide",
        Rating: r.rating || 0,
        Status: r.status || "",
        Comment: r.comment || "",
        Reply: r.reply || "",
        CreatedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      }));
      csv = toCSV(rows);
      filename = `Reviews_Export_${new Date().toISOString().slice(0, 10)}`;
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        ...securityHeaders,
      },
    });
  } catch (err) {
    console.error("Export API error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
