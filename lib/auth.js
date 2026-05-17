// Re-export from security.js for backward compatibility
// All new code should import directly from security.js

import jwt from "jsonwebtoken";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./security.js";

// Legacy exports - maintain backward compatibility
export function signToken(payload) {
  return signAccessToken(payload);
}

export function verifyToken(token) {
  try {
    return verifyAccessToken(token);
  } catch (err) {
    throw err;
  }
}

// New enhanced exports
export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./security.js";
