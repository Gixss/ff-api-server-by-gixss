// lib/store.js
import crypto from "node:crypto";

const accountsByUid = new Map();
const uidByProfileId = new Map();
const refreshTokens = new Map();

export const store = {
  saveAccount(acc) {
    accountsByUid.set(acc.uid, acc);
    uidByProfileId.set(acc.profile_id, acc.uid);
  },
  getByUid(uid) { return accountsByUid.get(uid) || null; },
  getByProfileId(pid) {
    const uid = uidByProfileId.get(pid);
    return uid ? accountsByUid.get(uid) || null : null;
  },
  profileIdExists(pid) { return uidByProfileId.has(pid); },
  uidExists(uid) { return accountsByUid.has(uid); },
  updateLastLogin(uid, ts) {
    const acc = accountsByUid.get(uid);
    if (acc) acc.last_login = ts;
  },
  rotateTokenSecret(uid) {
    const acc = accountsByUid.get(uid);
    if (!acc) return null;
    acc.token_secret = crypto.randomBytes(32).toString("hex");
    return acc.token_secret;
  },
  saveRefresh(token, uid) { refreshTokens.set(token, uid); },
  getRefreshUid(token) { return refreshTokens.get(token) || null; },
  revokeRefresh(token) { refreshTokens.delete(token); }
};
