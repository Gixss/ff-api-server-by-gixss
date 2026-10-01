// client/register.js
// Mass register guest account Free Fire OB55 pake ffapis.
// OB55 override via constructor: new FreeFireAPI(null, { obVersion: 'OB55' })

import { FreeFireAPI } from 'ffapis';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const OUTPUT_FILE = 'accounts.json';
const REGION = process.env.FF_REGION || 'ID';
const COUNT = Number(process.env.FF_COUNT || 10);
const DELAY_MS = Number(process.env.FF_DELAY || 2000);
const OB_VERSION = process.env.FF_OB_VERSION || 'OB55';

function loadExisting() {
  if (!existsSync(OUTPUT_FILE)) return [];
  try { return JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8')); }
  catch { return []; }
}

function saveAccounts(accounts) {
  writeFileSync(OUTPUT_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
}

async function massRegister() {
  console.log(`=== FF Guest Mass Register ===`);
  console.log(`Region: ${REGION}`);
  console.log(`OB Version: ${OB_VERSION}`);
  console.log(`Target: ${COUNT} akun`);
  console.log(`Delay: ${DELAY_MS}ms\n`);

  const api = new FreeFireAPI(null, { obVersion: OB_VERSION });

  const accounts = loadExisting();
  let success = 0;
  let failed = 0;

  for (let i = 0; i < COUNT; i++) {
    try {
      const acc = await api.register(REGION);
      accounts.push({
        uid: acc.uid,
        password: acc.password,
        passwordHash: acc.passwordHash,
        region: acc.region,
        nickname: acc.nickname,
        createdAt: new Date().toISOString(),
        obVersion: OB_VERSION
      });
      saveAccounts(accounts);
      success++;
      console.log(`[${i + 1}/${COUNT}] OK UID: ${acc.uid} | Region: ${acc.region} | Nick: ${acc.nickname || '-'}`);
    } catch (e) {
      failed++;
      console.error(`[${i + 1}/${COUNT}] FAIL: ${e.message}`);
    }
    if (i < COUNT - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\n=== Selesai ===`);
  console.log(`Sukses: ${success}`);
  console.log(`Gagal: ${failed}`);
  console.log(`Total akun tersimpan: ${accounts.length}`);
  console.log(`File: ${OUTPUT_FILE}`);
}

massRegister().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
