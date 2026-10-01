// api/me.js
import { verifySession } from "../lib/jwt.js";
import { store } from "../lib/store.js";
import { getRegion } from "../lib/regions.js";
import { ok, fail, methodNotAllowed, getBearer } from "../lib/response.js";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  const token = getBearer(req);
  if (!token) return fail(res, 401, "MISSING_TOKEN", "Missing Bearer token");

  const payload = verifySession(token);
  if (!payload) return fail(res, 401, "INVALID_TOKEN", "Token invalid");

  const acc = store.getByUid(payload.uid);
  if (!acc) return fail(res, 404, "NOT_FOUND", "Akun tidak ditemukan");

  res.setHeader("Cache-Control", "private, max-age=10");
  const region = getRegion(acc.region);

  return ok(res, {
    uid: acc.uid,
    profile_id: acc.profile_id,
    display_name: acc.display_name,
    region: acc.region,
    region_name: region?.name || acc.region,
    lock_region: acc.lock_region,
    server_url: acc.server_url,
    created_at: acc.created_at,
    last_login: acc.last_login
  });
}
