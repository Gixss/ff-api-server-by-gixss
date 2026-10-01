// api/region/list.js
import { REGIONS, OB } from '../../lib/ff.js';
import { ok, methodNotAllowed } from '../../lib/response.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);
  return ok(res, {
    ob_version: OB,
    regions: REGIONS
  });
}
