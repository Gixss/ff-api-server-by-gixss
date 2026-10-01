// api/auth/login.js
import { signSessionForAccount, signRefreshForAccount } from "../../lib/jwt.js";
import { store } from "../../lib/store.js";
import { rateLimit, getClientIp } from "../../lib/ratelimit.js";
import { getRegion } from "../../lib/regions.js";
import { ok, fail, methodNotAllowed, parseBody } from "../../lib/response.js";
import { config } from "../../lib/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, config.rateLimitMax, config.rateLimitWindowMs);
  if (!rl.ok) {
    res.setHeader("Retry-After", Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, "RATE_LIMITED", "Too many requests");
  }

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, "Body bukan JSON valid");

  const { uid } = body;
  if (!uid || typeof uid !== "string") {
    return fail(res, 400, "INVALID_UID", "uid wajib string");
  }

  const acc = store.getByUid(uid);
  if (!acc) return fail(res, 401, "INVALID_CREDENTIALS", "UID tidak ditemukan");

  const now = new Date().toISOString();
  store.updateLastLogin(uid, now);

  const session_token = signSessionForAccount(acc);
  const refresh_token = signRefreshForAccount(acc);
  store.saveRefresh(refresh_token, acc.uid);

  const region = getRegion(acc.region);

  return ok(res, {
    uid: acc.uid,
    profile_id: acc.profile_id,
    display_name: acc.display_name,
    session_token,
    refresh_token,
    token_type: "Bearer",
    region: acc.region,
    region_name: region?.name || acc.region,
    lock_region: acc.lock_region,
    server_url: acc.server_url,
    last_login: now
  });
}
