// lib/majorlogin.js
import { encodeLoginReq, decodeLoginRes } from "./protobuf.js";
import { aesCbcEncrypt, aesCbcDecrypt } from "./crypto.js";
import { getRegion } from "./regions.js";
import { config } from "./config.js";

export async function majorLogin({ regionCode, open_id, access_token }) {
  const region = getRegion(regionCode);
  if (!region) throw new Error(`Region tidak valid: ${regionCode}`);

  const protoBytes = await encodeLoginReq({
    open_id,
    login_token: access_token,
    orign_platform_type: 4
  });

  const encrypted = aesCbcEncrypt(protoBytes);

  const res = await fetch(region.majorLoginUrl, {
    method: "POST",
    headers: {
      "User-Agent": config.userAgent,
      "Connection": "Keep-Alive",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/octet-stream",
      "X-Unity-Version": config.unityVersion,
      "ReleaseVersion": config.releaseVersion
    },
    body: encrypted
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MajorLogin failed: ${res.status} ${text}`);
  }

  const resBuffer = Buffer.from(await res.arrayBuffer());
  const decrypted = aesCbcDecrypt(resBuffer);
  const decoded = await decodeLoginRes(decrypted);

  if (!decoded.jwt_token) throw new Error("MajorLogin response missing jwt_token");

  return {
    account_id: decoded.account_id,
    jwt_token: decoded.jwt_token,
    server_url: decoded.server_url || region.clientUrl,
    lock_region: decoded.lock_region || regionCode,
    nickname: decoded.nickname,
    level: decoded.level
  };
}
