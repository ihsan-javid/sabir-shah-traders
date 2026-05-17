/**
 * Back-compat barrel — prefer `@/lib/cloudinaryUpload` (server) and `@/lib/cloudinaryUrls` (client).
 */
export * from "./cloudinaryUpload";
export { default } from "./cloudinaryUpload";
