// api/auth/register.js
// Register guest account via ffapis.

import { getFF, REGIONS } from '../../lib/ff.js';
import { ok, fail, methodNotAllowed, parseBody } from '../../lib/response.js';
import { rateLimit, getClientIp } from '../../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const ip = getClientIp(req);
  const rl = rateLimit(`reg:${ip}`, 60, 60000);
  if (!rl.ok) {
    res.setHeader('Retry-After', Math.ceil((rl.reset - Date.now()) / 1000));
    return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
  }

  const { body, err } = parseBody(req);
  if (err) return fail(res, 400, err, 'Body bukan JSON valid');

  const { display_name, nickname, region } = body;
  const reg = (region || 'ID').toUpperCase();
  if (!REGIONS.includes(reg)) {
    return fail(res, 400, 'INVALID_REGION', `Region tidak valid. Pilih: ${REGIONS.join(', ')}`);
  }

  const name = display_name || nickname || undefined;

  try {
    const api = getFF();
    const data = await api.register(reg, name);

    // Normalisasi — handle beberapa bentuk output ffapis
    const result = {
      uid: String(data?.uid ?? ''),
      profile_id: String(data?.profile_id ?? data?.profileId ?? data?.uid ?? ''),
      display_name: data?.display_name ?? data?.nickname ?? name ?? null,
      password: data?.password ?? null,
      password_hash: data?.passwordHash ?? data?.password_hash ?? null,
      region: data?.region ?? reg,
      created_at: new Date().toISOString()
    };

    return ok(res, result, 201);
  } catch (e) {
    return fail(res, 502, 'REGISTER_FAILED', e?.message || 'ffapis register error');
  }
}
