// api/health.js
import { ok, methodNotAllowed } from '../lib/response.js';
import { OB, REGIONS } from '../lib/ff.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);
  return ok(res, {
    service: 'ff-api-server',
    backend: 'ffapis',
    ob_version: OB,
    regions: REGIONS,
    time: new Date().toISOString()
  });
}
