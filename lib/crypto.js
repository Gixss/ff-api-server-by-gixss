// lib/crypto.js
// GANTI MAIN_KEY_B64 & MAIN_IV_B64 dengan nilai real dari:
// 0xMe/FreeFire-Api -> lib2.py baris 12-13
// kaifcodec/freefire-jwt-generator-api -> app/settings.py

import crypto from "node:crypto";

const MAIN_KEY_B64 = "R0FSRU5BX0tFWV9QTEFDRUhPTERFUl9YWFhYWFhYWA==";
const MAIN_IV_B64 = "R0FSRU5BX0lWX1BMQUNFSE9MREVSX1g=";

function getKey() { return Buffer.from(MAIN_KEY_B64, "base64"); }
function getIV() { return Buffer.from(MAIN_IV_B64, "base64"); }

function pkcs7Pad(buf, blockSize = 16) {
  const padLen = blockSize - (buf.length % blockSize);
  return Buffer.concat([buf, Buffer.alloc(padLen, padLen)]);
}

function pkcs7Unpad(buf) {
  if (!buf.length) return buf;
  const padLen = buf[buf.length - 1];
  if (padLen < 1 || padLen > 16) return buf;
  return buf.slice(0, buf.length - padLen);
}

export function aesCbcEncrypt(plaintext) {
  const cipher = crypto.createCipheriv("aes-128-cbc", getKey(), getIV());
  const padded = pkcs7Pad(Buffer.from(plaintext));
  return Buffer.concat([cipher.update(padded), cipher.final()]);
}

export function aesCbcDecrypt(ciphertext) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", getKey(), getIV());
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext)),
    decipher.final()
  ]);
  return pkcs7Unpad(decrypted);
}
