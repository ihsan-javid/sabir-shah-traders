import { NextResponse } from "next/server";
import { getAuthUser, securityHeaders } from "@/lib/security";
import { v2 as cloudinary } from "cloudinary";
import { isCloudinaryConfigured } from "@/lib/cloudinaryUpload";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: securityHeaders },
  );
}

/** Ensure Cloudinary SDK is always configured with latest env values */
function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/** GET — List media files and folders directly from Cloudinary */
export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local" },
        { status: 503, headers: securityHeaders }
      );
    }

    configureCloudinary();

    const { searchParams } = new URL(req.url);
    const selectedFolder = searchParams.get("folder");

    // 1. Fetch resources from Cloudinary
    const options = {
      type: "upload",
      resource_type: "image",
      max_results: 500,
    };

    if (selectedFolder && selectedFolder !== "All") {
      options.prefix = selectedFolder + "/";
    }

    let resourcesRes;
    try {
      resourcesRes = await cloudinary.api.resources(options);
    } catch (cloudErr) {
      console.error("[Media API] Cloudinary resources fetch failed:", cloudErr.message);
      return NextResponse.json(
        { error: `Cloudinary error: ${cloudErr.message}` },
        { status: 502, headers: securityHeaders }
      );
    }

    const items = (resourcesRes.resources || []).map((r) => {
      const parts = r.public_id.split("/");
      const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "Root";
      return {
        _id: r.public_id,
        publicId: r.public_id,
        url: r.secure_url,
        name: parts[parts.length - 1],
        folder,
        sizeBytes: r.bytes,
        mimeType: `${r.resource_type}/${r.format}`,
        createdAt: r.created_at,
      };
    });

    // 2. Fetch folder list
    let foldersList = ["Root"];
    try {
      const rootFoldersRes = await cloudinary.api.root_folders();
      const rootNames = rootFoldersRes.folders.map((f) => f.name);
      foldersList = foldersList.concat(rootNames);

      // Fetch subfolders for each root folder
      for (const rootName of rootNames) {
        try {
          const subRes = await cloudinary.api.sub_folders(rootName);
          foldersList = foldersList.concat(
            subRes.folders.map((f) => `${rootName}/${f.name}`)
          );
        } catch {
          // skip subfolder errors gracefully
        }
      }
    } catch (folderErr) {
      console.warn("[Media API] Folder enumeration failed:", folderErr.message);
      // Derive folders from resources as fallback
    }

    // Add any folders implicit from resources
    items.forEach((item) => {
      if (item.folder && item.folder !== "Root") {
        foldersList.push(item.folder);
      }
    });

    const uniqueFolders = Array.from(new Set(foldersList.filter(Boolean)));

    return NextResponse.json(
      { items, folders: uniqueFolders },
      { headers: securityHeaders }
    );
  } catch (err) {
    console.error("[Media API] GET error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders }
    );
  }
}

/** POST — Upload files or create folders */
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured." },
        { status: 503, headers: securityHeaders }
      );
    }

    configureCloudinary();

    const body = await req.json();
    const { action } = body;

    // ── CREATE FOLDER ────────────────────────────────────────────────────────
    if (action === "create_folder") {
      const { folder } = body;
      if (!folder || !folder.trim()) {
        return NextResponse.json(
          { error: "Folder name is required" },
          { status: 400, headers: securityHeaders }
        );
      }

      try {
        const res = await cloudinary.api.create_folder(folder.trim());
        return NextResponse.json({ ok: true, result: res }, { headers: securityHeaders });
      } catch (err) {
        console.error("[Media API] create_folder error:", err.message);
        return NextResponse.json(
          { error: `Failed to create folder: ${err.message}` },
          { status: 502, headers: securityHeaders }
        );
      }
    }

    // ── UPLOAD ───────────────────────────────────────────────────────────────
    if (action === "upload") {
      const { file, folder } = body;
      if (!file) {
        return NextResponse.json(
          { error: "File data (base64 Data URI) is required" },
          { status: 400, headers: securityHeaders }
        );
      }

      const targetFolder =
        folder && folder !== "All" && folder !== "Root"
          ? folder
          : "sabir-shah-ecom/media";

      try {
        const uploadResult = await cloudinary.uploader.upload(file, {
          folder: targetFolder,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        });

        const parts = uploadResult.public_id.split("/");
        const parsedFolder =
          parts.length > 1 ? parts.slice(0, -1).join("/") : "Root";

        const item = {
          _id: uploadResult.public_id,
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          name: parts[parts.length - 1],
          folder: parsedFolder,
          sizeBytes: uploadResult.bytes,
          mimeType: `${uploadResult.resource_type}/${uploadResult.format}`,
          createdAt: uploadResult.created_at,
        };

        return NextResponse.json({ ok: true, item }, { headers: securityHeaders });
      } catch (err) {
        console.error("[Media API] upload error:", err.message);
        return NextResponse.json(
          { error: `Upload failed: ${err.message}` },
          { status: 502, headers: securityHeaders }
        );
      }
    }

    // ── MOVE ─────────────────────────────────────────────────────────────────
    if (action === "move") {
      const { publicId, destFolder } = body;
      if (!publicId || !destFolder) {
        return NextResponse.json(
          { error: "publicId and destFolder are required" },
          { status: 400, headers: securityHeaders }
        );
      }

      try {
        const newPublicId = `${destFolder}/${publicId.split("/").pop()}`;
        // FIX: was cloudinary.api.rename (wrong namespace) → correct is cloudinary.uploader.rename
        await cloudinary.uploader.rename(publicId, newPublicId);
        return NextResponse.json(
          { ok: true, message: "Image moved successfully", publicId: newPublicId },
          { headers: securityHeaders }
        );
      } catch (err) {
        console.error("[Media API] move error:", err.message);
        return NextResponse.json(
          { error: `Move failed: ${err.message}` },
          { status: 502, headers: securityHeaders }
        );
      }
    }

    // ── COPY ─────────────────────────────────────────────────────────────────
    if (action === "copy") {
      const { publicId, url, destFolder } = body;
      if (!publicId || !destFolder) {
        return NextResponse.json(
          { error: "publicId and destFolder are required" },
          { status: 400, headers: securityHeaders }
        );
      }

      try {
        const newPublicId = `${destFolder}/${publicId.split("/").pop()}`;
        const uploadResult = await cloudinary.uploader.upload(url, {
          public_id: newPublicId,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        });

        return NextResponse.json(
          { ok: true, message: "Image copied successfully", publicId: uploadResult.public_id },
          { headers: securityHeaders }
        );
      } catch (err) {
        console.error("[Media API] copy error:", err.message);
        return NextResponse.json(
          { error: `Copy failed: ${err.message}` },
          { status: 502, headers: securityHeaders }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400, headers: securityHeaders }
    );
  } catch (err) {
    console.error("[Media API] POST error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders }
    );
  }
}

/** DELETE — Delete single or multiple items from Cloudinary */
export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 503, headers: securityHeaders }
      );
    }

    configureCloudinary();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    const errors = [];

    if (id) {
      try {
        await cloudinary.uploader.destroy(id, { resource_type: "image" });
      } catch (err) {
        console.error(`[Media API] destroy ${id} failed:`, err.message);
        errors.push(`Failed to delete ${id}: ${err.message}`);
      }
    } else if (idsParam) {
      const publicIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      for (const pid of publicIds) {
        try {
          await cloudinary.uploader.destroy(pid, { resource_type: "image" });
        } catch (err) {
          console.error(`[Media API] destroy ${pid} failed:`, err.message);
          errors.push(`Failed to delete ${pid}: ${err.message}`);
        }
      }
    } else {
      return NextResponse.json(
        { error: "Missing id or ids query parameter" },
        { status: 400, headers: securityHeaders }
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, errors },
        { status: 207, headers: securityHeaders }
      );
    }

    return NextResponse.json({ ok: true }, { headers: securityHeaders });
  } catch (err) {
    console.error("[Media API] DELETE error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: securityHeaders }
    );
  }
}
