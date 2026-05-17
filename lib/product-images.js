import {
  uploadImageDataUri,
  isCloudinaryDeliveryUrl,
  CLOUDINARY_FOLDERS,
} from "@/lib/cloudinaryUpload";

/**
 * Normalize product `images` from client payload for persistence:
 * - data: URIs → upload to Cloudinary (legacy; prefer admin upload API first)
 * - HTTPS Cloudinary delivery URLs → kept as-is
 * Site-relative paths are not accepted (Cloudinary-only rule).
 */
export async function normalizeProductImagesInput(rawImages) {
  if (!Array.isArray(rawImages)) return [];
  const out = [];
  for (const item of rawImages) {
    if (typeof item !== "string" || !item.trim()) continue;
    const t = item.trim();
    if (t.startsWith("data:")) {
      const { url } = await uploadImageDataUri(t, CLOUDINARY_FOLDERS.products);
      out.push(url);
    } else if (isCloudinaryDeliveryUrl(t)) {
      out.push(t);
    }
  }
  return out;
}

/**
 * Coerce primary `image` field: empty string, Cloudinary URL, or data URI (uploaded).
 * Returns `undefined` if the value must be dropped (invalid / non-Cloudinary path).
 */
export async function coerceProductPrimaryImage(value) {
  if (value === undefined) return undefined;
  if (value === null) return "";
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return "";
  if (t.startsWith("data:")) {
    const { url } = await uploadImageDataUri(t, CLOUDINARY_FOLDERS.products);
    return url;
  }
  if (isCloudinaryDeliveryUrl(t)) return t;
  return undefined;
}
