/**
 * Unified server-side Cloudinary pipeline (upload + delete).
 * Import only from Route Handlers, Server Actions, or server-only lib modules.
 *
 * Client UIs must use `uploadImageViaAdminApi` from `@/lib/cloudinaryClientUpload`.
 */
import { v2 as cloudinary } from "cloudinary";
import { publicIdFromDeliveryUrl } from "@/lib/cloudinaryUrls";

export const ROOT_FOLDER = "sabir-shah-ecom";

/** Target folders under Cloudinary (single source of truth). */
export const CLOUDINARY_FOLDERS = {
  products: `${ROOT_FOLDER}/products`,
  media: `${ROOT_FOLDER}/media`,
  banners: `${ROOT_FOLDER}/banners`,
  branding: `${ROOT_FOLDER}/branding`,
};

/** @deprecated Use CLOUDINARY_FOLDERS.products */
export const PRODUCT_IMAGE_FOLDER = CLOUDINARY_FOLDERS.products;

export const MAX_IMAGE_UPLOAD_BYTES = 12 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Map admin form folder key → Cloudinary folder path.
 * @param {string} [key] one of: products | media | banners | branding
 */
export function resolveAdminUploadFolder(key) {
  const k = typeof key === "string" ? key.trim().toLowerCase() : "products";
  return CLOUDINARY_FOLDERS[k] || CLOUDINARY_FOLDERS.products;
}

/**
 * Upload a data URI image. Applies auto quality/format on delivery via stored asset metadata where supported.
 */
export async function uploadImageDataUri(dataUri, folder = CLOUDINARY_FOLDERS.products) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

/** @alias */
export const uploadImage = uploadImageDataUri;

/**
 * Upload raw image bytes (e.g. multipart file).
 */
export async function uploadImageBufferToCloudinary(
  buffer,
  mimeType,
  folder = CLOUDINARY_FOLDERS.products,
) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType || "image/jpeg"};base64,${base64}`;
  return uploadImageDataUri(dataUri, folder);
}

/** @alias */
export const uploadImageBuffer = uploadImageBufferToCloudinary;

export async function destroyImageByPublicId(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/** @alias */
export const deleteImage = destroyImageByPublicId;

export async function destroyImageByDeliveryUrl(url) {
  const pid = publicIdFromDeliveryUrl(url);
  if (pid) await destroyImageByPublicId(pid);
}

/** @alias */
export const deleteImageByUrl = destroyImageByDeliveryUrl;

export async function destroyImagesByDeliveryUrls(urls) {
  if (!Array.isArray(urls)) return;
  const unique = [...new Set(urls.filter(Boolean))];
  for (const url of unique) {
    await destroyImageByDeliveryUrl(url).catch(() => {});
  }
}

/** @alias */
export const deleteImagesByUrls = destroyImagesByDeliveryUrls;

// --- Back-compat ---
/** @deprecated use publicIdFromDeliveryUrl */
export function publicIdFromCloudinaryUrl(url) {
  return publicIdFromDeliveryUrl(url);
}

export { cloudinary };
export default cloudinary;

// URL helpers (server or client); re-export for single import path `@/lib/cloudinaryUpload`
export {
  isCloudinaryDeliveryUrl,
  withDeliveryTransforms,
  withDeliveryTransformPreset,
  productImageUrlCard,
  productImageUrlHero,
  productImageUrlThumb,
} from "@/lib/cloudinaryUrls";
