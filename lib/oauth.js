// lib/oauth.js
import { config } from "./config.js";

export async function oauthGuestGrant({ uid, password }) {
  const params = new URLSearchParams();
  params.append("uid", uid);
  params.append("password", password);
  params.append("response_type", "token");
  params.append("client_type", "2");
  params.append("client_secret", config.oauthClientSecret);
  params.append("client_id", config.oauthClientId);

  const res = await fetch(config.oauthUrl, {
    method: "POST",
    headers: {
      "User-Agent": config.userAgent,
      "Connection": "Keep-Alive",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OAuth failed: ${res.status} ${text}`);
  }

  const json = await res.json();

  if (!json.access_token || !json.open_id) {
    throw new Error("OAuth response missing access_token / open_id");
  }

  return { access_token: json.access_token, open_id: json.open_id };
}
