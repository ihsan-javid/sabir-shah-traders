// File upload utilities for payment screenshots
// In production, replace with Cloudinary/AWS S3 upload

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

/**
 * Validate file before upload
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 5MB.",
    };
  }

  return { valid: true };
}

/**
 * Convert file to base64 for storage
 * Note: In production, upload to Cloudinary/S3 instead
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload payment screenshot
 * Returns object with url and publicId (for Cloudinary in production)
 */
export async function uploadPaymentProof(file) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // For development: convert to base64
  // In production: upload to Cloudinary/AWS S3
  const base64 = await fileToBase64(file);

  return {
    url: base64,
    publicId: null, // Would be Cloudinary public_id in production
    uploadedAt: new Date(),
  };
}

/**
 * Check if payment method requires proof upload
 */
export function requiresPaymentProof(paymentMethod) {
  return ["EASYPAISA", "JAZZCASH", "CARD"].includes(paymentMethod);
}
