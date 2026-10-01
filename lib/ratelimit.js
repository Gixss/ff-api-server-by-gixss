// lib/ratelimit.js
const buckets = new Map();

export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = buckets.get(key) || [];
  const fresh = arr.filter((t) => now - t < windowMs);
  if (fresh.length >= max) {
    buckets.set(key, fresh);
    return { ok: false, remaining: 0, reset: fresh[0] + windowMs };
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return { ok: true, remaining: max - fresh.length, reset: now + windowMs };
}

export function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
