// api/like/send.js
// Kirim like via ffapis LikeAPI.

import { getLike, REGIONS } from '../../lib/ff.js';
import { ok, fail, methodNotAllowed, parseBody } from '../../lib/response.js';
import { rateLimit, getClientIp } from '../../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`like:${ip}`, 60, 60000);
  if (!rl.ok) {
    res.setHeader('Retry-After', Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
  }

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, 'Body bukan JSON valid');

  const { uid, region, count } = body;
  if (!uid || typeof uid !== 'string') {
    return fail(res, 400, 'INVALID_UID', 'uid target wajib string');
  }

  const reg = (region || 'ID').toUpperCase();
  if (!REGIONS.includes(reg)) {
    return fail(res, 400, 'INVALID_REGION', `Region tidak valid. Pilih: ${REGIONS.join(', ')}`);
  }

  const n = Math.max(1, Math.min(100, Number(count || 1)));

  try {
    const like = getLike();
    const result = await like.sendLikes(uid, reg, n);

    return ok(res, {
      target_uid: uid,
      region: reg,
      requested: n,
      result
    });
  } catch (e) {
    return fail(res, 502, 'LIKE_FAILED', e?.message || 'ffapis like error');
  }
}
