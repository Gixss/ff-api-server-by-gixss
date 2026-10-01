// lib/protobuf.js
import protobuf from "protobufjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const protoPath = join(__dirname, "..", "proto", "FreeFire.proto");

let root = null;

export async function loadProto() {
  if (root) return root;
  root = await protobuf.load(protoPath);
  return root;
}

export async function encodeLoginReq({ open_id, login_token, orign_platform_type }) {
  const r = await loadProto();
  const LoginReq = r.lookupType("FreeFire.LoginReq");
  const payload = { open_id, login_token, orign_platform_type };
  const err = LoginReq.verify(payload);
  if (err) throw new Error("LoginReq verify: " + err);
  return LoginReq.encode(LoginReq.create(payload)).finish();
}

export async function decodeLoginRes(buffer) {
  const r = await loadProto();
  const LoginRes = r.lookupType("FreeFire.LoginRes");
  const msg = LoginRes.decode(new Uint8Array(buffer));
  return LoginRes.toObject(msg, {
    longs: String, enums: String, bytes: String, defaults: true
  });
}
