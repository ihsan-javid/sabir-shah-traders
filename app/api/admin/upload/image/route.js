import { NextResponse } from "next/server";
import { getAuthUser, securityHeaders } from "@/lib/security";
import {
  isCloudinaryConfigured,
  uploadImageBufferToCloudinary,
  destroyImageByDeliveryUrl,
  resolveAdminUploadFolder,
  MAX_IMAGE_UPLOAD_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/cloudinaryUpload";

export const dynamic = "force-dynamic";

/**
 * POST multipart: field "file", optional "folder" (products|media|banners|branding).
 * Returns { url, publicId } from Cloudinary.
 */
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 503, headers: securityHeaders },
      );
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with field \"file\"" },
        { status: 400, headers: securityHeaders },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const folderKey = form.get("folder");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Missing file field" },
        { status: 400, headers: securityHeaders },
      );
    }

    const mime = file.type || "image/jpeg";
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Invalid type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400, headers: securityHeaders },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `File too large (max ${MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024} MB)`,
        },
        { status: 400, headers: securityHeaders },
      );
    }

    const cloudinaryFolder = resolveAdminUploadFolder(
      typeof folderKey === "string" ? folderKey : "products",
    );

    const { url, publicId } = await uploadImageBufferToCloudinary(
      buf,
      mime,
      cloudinaryFolder,
    );

    return NextResponse.json(
      { url, publicId },
      { headers: { ...securityHeaders, "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500, headers: securityHeaders },
    );
  }
}

/**
 * DELETE ?url= — remove asset from Cloudinary (admin cleanup).
 */
export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: securityHeaders },
      );
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { error: "Missing url query parameter" },
        { status: 400, headers: securityHeaders },
      );
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ ok: true }, { headers: securityHeaders });
    }

    await destroyImageByDeliveryUrl(url);
    return NextResponse.json({ ok: true }, { headers: securityHeaders });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500, headers: securityHeaders },
    );
  }
}
