// lib/ff.js
// Singleton ffapis instance — pake OB55 override.
// Semua endpoint server pakai instance ini.

import { FreeFireAPI, LikeAPI } from 'ffapis';

const OB_VERSION = process.env.FF_OB_VERSION || 'OB55';

let _ffapi = null;
let _like = null;

export function getFF() {
  if (!_ffapi) {
    _ffapi = new FreeFireAPI(null, { obVersion: OB_VERSION });
  }
  return _ffapi;
}

export function getLike() {
  if (!_like) {
    _like = new LikeAPI({ obVersion: OB_VERSION });
  }
  return _like;
}

export const OB = OB_VERSION;

export const REGIONS = [
  'ID', 'IND', 'SG', 'MY', 'TH', 'VN',
  'PH', 'BR', 'US', 'RU', 'ME', 'TW', 'PK', 'CIS'
];
