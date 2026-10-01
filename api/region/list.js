// api/region/list.js
import { getRegionList } from "../../lib/regions.js";
import { config } from "../../lib/config.js";
import { ok, methodNotAllowed } from "../../lib/response.js";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  return ok(res, {
    game_version: config.gameVersion,
    client_version: config.clientVersion,
    major_login_url: config.majorLoginUrl,
    oauth_url: config.oauthUrl,
    regions: getRegionList()
  });
}
