// api/auth/login.js
// Login pake uid + password via ffapis.

import { getFF } from '../../lib/ff.js';
import { ok, fail, methodNotAllowed, parseBody } from '../../lib/response.js';
import { rateLimit, getClientIp } from '../../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, 60, 60000);
  if (!rl.ok) {
    res.setHeader('Retry-After', Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
  }

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, 'Body bukan JSON valid');

  const { uid, password } = body;
  if (!uid || typeof uid !== 'string') {
    return fail(res, 400, 'INVALID_UID', 'uid wajib string numerik');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return fail(res, 400, 'INVALID_PASSWORD', 'password wajib min 6 karakter');
  }

  try {
    const api = getFF();
    const session = await api.login(uid, password);

    return ok(res, {
      uid,
      session,
      logged_at: new Date().toISOString()
    });
  } catch (e) {
    return fail(res, 401, 'LOGIN_FAILED', e?.message || 'ffapis login error');
  }
}
