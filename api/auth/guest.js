// api/auth/guest.js
import crypto from "node:crypto";
import { oauthGuestGrant } from "../../lib/oauth.js";
import { majorLogin } from "../../lib/majorlogin.js";
import { signSessionForAccount, signRefreshForAccount } from "../../lib/jwt.js";
import { isPassword } from "../../lib/validate.js";
import { store } from "../../lib/store.js";
import { rateLimit, getClientIp } from "../../lib/ratelimit.js";
import { getRegion, getRegionList } from "../../lib/regions.js";
import { ok, fail, methodNotAllowed, parseBody } from "../../lib/response.js";
import { config } from "../../lib/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`guest:${ip}`, config.rateLimitMax, config.rateLimitWindowMs);
  if (!rl.ok) {
    res.setHeader("Retry-After", Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, "RATE_LIMITED", "Too many requests");
  }

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, "Body bukan JSON valid");

  const { uid, password, region: regionInput } = body;

  if (!uid || typeof uid !== "string") {
    return fail(res, 400, "INVALID_UID", "uid wajib string numerik 9-10 digit");
  }
  if (!isPassword(password)) {
    return fail(res, 400, "INVALID_PASSWORD", "password wajib 6-64 karakter");
  }

  const regionCode = (regionInput || config.defaultRegion).toUpperCase();
  const region = getRegion(regionCode);
  if (!region) {
    return fail(res, 400, "INVALID_REGION", `Region tidak valid. Pilih: ${getRegionList().map(r => r.code).join(", ")}`);
  }

  let oauthResult;
  try {
    oauthResult = await oauthGuestGrant({ uid, password });
  } catch (e) {
    return fail(res, 401, "OAUTH_FAILED", e.message);
  }

  let majorResult;
  try {
    majorResult = await majorLogin({
      regionCode,
      open_id: oauthResult.open_id,
      access_token: oauthResult.access_token
    });
  } catch (e) {
    return fail(res, 502, "MAJORLOGIN_FAILED", e.message);
  }

  const localUid = String(majorResult.account_id);
  let profile_id = localUid;
  if (profile_id.length < 9) profile_id = profile_id.padStart(9, "0");
  profile_id = profile_id.slice(0, 10);

  const token_secret = crypto.randomBytes(32).toString("hex");
  const now = new Date().toISOString();

  const account = {
    uid: localUid,
    profile_id,
    display_name: majorResult.nickname || `Guest_${localUid.slice(-4)}`,
    region: regionCode,
    lock_region: majorResult.lock_region,
    server_url: majorResult.server_url,
    garena_jwt: majorResult.jwt_token,
    token_secret,
    created_at: now,
    last_login: now
  };
  store.saveAccount(account);

  const session_token = signSessionForAccount(account);
  const refresh_token = signRefreshForAccount(account);
  store.saveRefresh(refresh_token, localUid);

  return ok(res, {
    uid: account.uid,
    profile_id: account.profile_id,
    display_name: account.display_name,
    session_token,
    refresh_token,
    token_type: "Bearer",
    region: account.region,
    region_name: region.name,
    lock_region: account.lock_region,
    server_url: account.server_url,
    garena_jwt: majorResult.jwt_token,
    game_version: config.gameVersion,
    created_at: account.created_at,
    last_login: account.last_login
  }, 201);
}
