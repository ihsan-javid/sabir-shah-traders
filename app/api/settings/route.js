import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { getAuthUser } from "@/lib/security";
import { sanitizeSettingsForStorefront } from "@/lib/settings-runtime";

export const dynamic = "force-dynamic";

async function getOrCreateSettings() {
  await connectDB();
  let doc = await Settings.findOne().lean();
  if (!doc) {
    doc = (await Settings.create({})).toObject();
  }
  return doc;
}

const FALLBACK_SETTINGS = {
  storeName: "Sabir Shah Traders",
  deliveryFee: 400,
  freeDeliveryThreshold: 0,
  shipping: { freeShippingGlobal: true, expressEnabled: false, expressRate: 0 },
  tax: { enabled: false, rate: 0, label: "GST", inclusive: false },
  uiLabels: { addToCart: "Add to Cart", buyNow: "Buy Now", checkout: "Checkout", shopNow: "Shop Now" },
  maintenanceMode: false,
  announcementBar: "",
  showAnnouncement: false,
};

export async function GET(req) {
  try {
    const settings = await getOrCreateSettings();
    const user = await getAuthUser(req);
    const payload = user ? settings : sanitizeSettingsForStorefront(settings);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err) {
    // DB unreachable — return safe defaults so the storefront still loads
    console.error("[settings GET] DB error, returning fallback:", err.message);
    return NextResponse.json(FALLBACK_SETTINGS, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

async function requireAdmin(req) {
  const user = await getAuthUser(req);
  if (!user) return null;
  return user;
}

async function updateSettings(req) {
  const user = await requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { _id, __v, createdAt, updatedAt, ...rest } = body || {};

  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: rest },
    { new: true, upsert: true, runValidators: true },
  ).lean();

  return NextResponse.json(settings);
}

export async function POST(req) {
  try {
    await connectDB();
    return await updateSettings(req);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    return await updateSettings(req);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
