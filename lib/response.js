// lib/response.js
export function ok(res, data, status = 200, meta = undefined) {
  res.setHeader("Content-Type", "application/json");
  const body = { ok: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function fail(res, status, code, message, details = undefined) {
  res.setHeader("Content-Type", "application/json");
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

export function methodNotAllowed(res) {
  return fail(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");
}

export function parseBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); }
    catch { return { err: "INVALID_JSON" }; }
  }
  return { body: body || {} };
}

export function getBearer(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const t = auth.slice(7).trim();
  return t.length ? t : null;
}
