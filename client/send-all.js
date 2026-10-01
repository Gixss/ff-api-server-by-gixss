// client/send-all.js
// Kirim like ke target UID pake SEMUA akun yang udah diregister.
// Pake LikeAPI dari ffapis + OB55 override.

import { LikeAPI } from 'ffapis';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ACCOUNTS_FILE = 'accounts.json';
const TARGET_UID = process.env.FF_TARGET_UID;
const REGION = process.env.FF_REGION || 'ID';
const LIKE_COUNT = Number(process.env.FF_LIKE_COUNT || 1);
const OB_VERSION = process.env.FF_OB_VERSION || 'OB55';
const DELAY_MS = Number(process.env.FF_DELAY || 1500);

if (!TARGET_UID) {
  console.error('FF_TARGET_UID wajib di-set. Contoh: FF_TARGET_UID=1234567890 node send-all.js');
  process.exit(1);
}

function loadAccounts() {
  if (!existsSync(ACCOUNTS_FILE)) {
    console.error(`File ${ACCOUNTS_FILE} nggak ada. Jalanin register.js dulu.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf-8'));
}

async function sendAll() {
  const accounts = loadAccounts();
  if (!accounts.length) {
    console.error('Nggak ada akun di accounts.json.');
    process.exit(1);
  }

  console.log(`=== FF Kirim Like Massal ===`);
  console.log(`Target UID: ${TARGET_UID}`);
  console.log(`Region: ${REGION}`);
  console.log(`OB Version: ${OB_VERSION}`);
  console.log(`Total akun: ${accounts.length}`);
  console.log(`Like target: ${LIKE_COUNT}\n`);

  const like = new LikeAPI({ obVersion: OB_VERSION });

  const results = {
    target_uid: TARGET_UID,
    region: REGION,
    ob_version: OB_VERSION,
    started_at: new Date().toISOString(),
    total_accounts: accounts.length,
    sent: 0,
    failed: 0,
    details: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    try {
      const res = await like.sendLikes(TARGET_UID, acc.region || REGION, LIKE_COUNT);
      results.sent++;
      results.details.push({ uid: acc.uid, status: 'sent', result: res, at: new Date().toISOString() });
      console.log(`[${i + 1}/${accounts.length}] OK ${acc.uid} -> like terkirim`);
    } catch (e) {
      results.failed++;
      results.details.push({ uid: acc.uid, status: 'failed', error: e.message, at: new Date().toISOString() });
      console.error(`[${i + 1}/${accounts.length}] FAIL ${acc.uid}: ${e.message}`);
    }
    if (i < accounts.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  results.finished_at = new Date().toISOString();

  const outFile = `like-results-${Date.now()}.json`;
  writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n=== Selesai ===`);
  console.log(`Terkirim: ${results.sent}`);
  console.log(`Gagal: ${results.failed}`);
  console.log(`Hasil disimpan: ${outFile}`);
}

sendAll().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
