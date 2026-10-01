// lib/validate.js
export function isNumericId(v, minLen = 9, maxLen = 10) {
  if (typeof v !== "string") return false;
  if (!/^\d+$/.test(v)) return false;
  if (v.length < minLen || v.length > maxLen) return false;
  if (v[0] === "0") return false;
  return true;
}

export function isPassword(v) {
  return typeof v === "string" && v.length >= 6 && v.length <= 64;
}

export function isDisplayName(v) {
  return typeof v === "string" && v.length >= 1 && v.length <= 20;
}
