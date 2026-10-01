// lib/jwt.js
import jwt from "jsonwebtoken";
import { store } from "./store.js";

export function signSessionForAccount(account) {
  return jwt.sign(
    { uid: account.uid, profile_id: account.profile_id, region: account.region, type: "access" },
    account.token_secret
  );
}

export function signRefreshForAccount(account) {
  return jwt.sign({ uid: account.uid, type: "refresh" }, account.token_secret);
}

export function verifySession(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.uid || decoded.type !== "access") return null;
  const account = store.getByUid(decoded.uid);
  if (!account) return null;
  try { return jwt.verify(token, account.token_secret); }
  catch { return null; }
}

export function verifyRefresh(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.uid || decoded.type !== "refresh") return null;
  const account = store.getByUid(decoded.uid);
  if (!account) return null;
  try { return jwt.verify(token, account.token_secret); }
  catch { return null; }
}
