// api/auth/refresh.js
import { verifyRefresh, signSessionForAccount } from "../../lib/jwt.js";
import { store } from "../../lib/store.js";
import { ok, fail, methodNotAllowed, parseBody } from "../../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, "Body bukan JSON valid");

  const { refresh_token } = body;
  if (typeof refresh_token !== "string" || !refresh_token.length) {
    return fail(res, 400, "INVALID_REFRESH_TOKEN", "refresh_token wajib");
  }

  const payload = verifyRefresh(refresh_token);
  if (!payload) return fail(res, 401, "INVALID_REFRESH_TOKEN", "Refresh token invalid");

  const acc = store.getByUid(payload.uid);
  if (!acc) return fail(res, 404, "NOT_FOUND", "Akun tidak ditemukan");

  const session_token = signSessionForAccount(acc);

  return ok(res, { session_token, token_type: "Bearer" });
}
