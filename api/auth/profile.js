// api/auth/profile.js
// Ambil profile player via ffapis.
// Query: ?uid=xxx ATAU ?nickname=xxx

import { getFF } from '../../lib/ff.js';
import { ok, fail, methodNotAllowed } from '../../lib/response.js';
import { rateLimit, getClientIp } from '../../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`prof:${ip}`, 120, 60000);
  if (!rl.ok) {
    res.setHeader('Retry-After', Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
  }

  const uid = req.query?.uid;
  const nickname = req.query?.nickname;

  if (!uid && !nickname) {
    return fail(res, 400, 'MISSING_QUERY', 'Sertakan ?uid=xxx atau ?nickname=xxx');
  }

  try {
    const api = getFF();

    if (uid) {
      const profile = await api.getPlayerProfile(String(uid));
      return ok(res, profile);
    }

    const found = await api.searchAccount(String(nickname));
    return ok(res, found);
  } catch (e) {
    return fail(res, 502, 'PROFILE_FAILED', e?.message || 'ffapis profile error');
  }
}
