import crypto from "node:crypto";

// Constant-time string comparison for secret tokens, so token checks don't leak
// information through response timing. Returns false on any type/length mismatch.
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
