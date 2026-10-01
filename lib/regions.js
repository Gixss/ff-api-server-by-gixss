// lib/regions.js
import { config } from "./config.js";

export const REGIONS = {
  IND: { name: "India", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlInd },
  SG: { name: "Singapore", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  ID: { name: "Indonesia", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlInd },
  BR: { name: "Brazil", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  US: { name: "United States", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlUs },
  RU: { name: "Russia", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  ME: { name: "Middle East", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  TH: { name: "Thailand", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  VN: { name: "Vietnam", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  TW: { name: "Taiwan", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  PK: { name: "Pakistan", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal },
  CIS: { name: "CIS Region", oauthUrl: config.oauthUrl, majorLoginUrl: config.majorLoginUrl, clientUrl: config.clientUrlGlobal }
};

export function isValidRegion(code) {
  if (typeof code !== "string") return false;
  return Object.prototype.hasOwnProperty.call(REGIONS, code.toUpperCase());
}

export function getRegion(code) {
  if (!isValidRegion(code)) return null;
  return REGIONS[code.toUpperCase()];
}

export function getRegionList() {
  return Object.entries(REGIONS).map(([code, r]) => ({
    code,
    name: r.name,
    client_url: r.clientUrl
  }));
}
