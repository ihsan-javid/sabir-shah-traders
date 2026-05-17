/**
 * Client-safe Cloudinary delivery URL helpers (no SDK, no secrets).
 * Use for transforms in ProductCard, PDP, and admin previews.
 */

const UPLOAD_MARKER = "/upload/";

/** True for https://res.cloudinary.com/.../image/upload/... */
export function isCloudinaryDeliveryUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.trim());
    return (
      u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      u.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

/**
 * Extract public_id from a delivery URL.
 * Strips leading version and transformation segments when possible.
 */
export function publicIdFromDeliveryUrl(url) {
  if (!isCloudinaryDeliveryUrl(url)) return null;
  try {
    const u = new URL(url);
    let rest = u.pathname.split("/upload/")[1];
    if (!rest) return null;
    rest = rest.split("?")[0];
    const segments = rest.split("/").filter(Boolean);
    let start = 0;
    while (start < segments.length) {
      const s = segments[start];
      if (s.match(/^v\d+$/)) {
        start += 1;
        break;
      }
      if (
        s.includes(",") ||
        /^[fqcagd]_/i.test(s) ||
        /^w_\d/.test(s) ||
        /^h_\d/.test(s)
      ) {
        start += 1;
        continue;
      }
      break;
    }
    const pathParts = segments.slice(start);
    if (!pathParts.length) return null;
    const last = pathParts[pathParts.length - 1];
    pathParts[pathParts.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, "");
    return pathParts.join("/");
  } catch {
    return null;
  }
}

function firstSegmentLooksLikeTransform(seg) {
  if (!seg) return false;
  if (seg.includes(",")) return true;
  return /^[fqcagd]_|^w_\d|^h_\d|^ar_/i.test(seg);
}

/**
 * Insert Cloudinary transformation chain immediately after /upload/.
 * Skips if a transformation segment is already present.
 */
export function withDeliveryTransforms(url, transformSegment) {
  if (!url || !transformSegment || !isCloudinaryDeliveryUrl(url)) return url;
  const i = url.indexOf(UPLOAD_MARKER);
  if (i === -1) return url;
  const prefix = url.slice(0, i + UPLOAD_MARKER.length);
  const rest = url.slice(i + UPLOAD_MARKER.length);
  const first = rest.split("/")[0] || "";
  if (firstSegmentLooksLikeTransform(first)) return url;
  return `${prefix}${transformSegment}/${rest}`;
}

const PRESETS = {
  /** Product grid / cards */
  card: "f_auto,q_auto,w_480,c_limit",
  /** PDP main image */
  hero: "f_auto,q_auto,w_1600,c_limit",
  /** Thumbnails / admin grids */
  thumb: "f_auto,q_auto,w_220,c_limit",
};

export function withDeliveryTransformPreset(url, preset = "card") {
  if (!url || typeof url !== "string") return "";
  const t = PRESETS[preset] || PRESETS.card;
  return withDeliveryTransforms(url, t);
}

export function productImageUrlCard(url) {
  if (!url || typeof url !== "string") return "";
  return withDeliveryTransformPreset(url, "card");
}

export function productImageUrlHero(url) {
  if (!url || typeof url !== "string") return "";
  return withDeliveryTransformPreset(url, "hero");
}

export function productImageUrlThumb(url) {
  if (!url || typeof url !== "string") return "";
  return withDeliveryTransformPreset(url, "thumb");
}
