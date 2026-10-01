// client/update-all.js
// Cek status semua akun — login satu-satu, ambil profile, simpen hasilnya.

import { FreeFireAPI } from 'ffapis';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ACCOUNTS_FILE = 'accounts.json';
const OB_VERSION = process.env.FF_OB_VERSION || 'OB55';
const DELAY_MS = Number(process.env.FF_DELAY || 1500);

function loadAccounts() {
  if (!existsSync(ACCOUNTS_FILE)) {
    console.error(`File ${ACCOUNTS_FILE} nggak ada.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf-8'));
}

async function updateAll() {
  const accounts = loadAccounts();

  console.log(`=== FF Update All Accounts ===`);
  console.log(`OB Version: ${OB_VERSION}`);
  console.log(`Total akun: ${accounts.length}\n`);

  const api = new FreeFireAPI(null, { obVersion: OB_VERSION });
  const updated = [];
  let alive = 0;
  let dead = 0;

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    try {
      await api.login(acc.uid, acc.password);
      const profile = await api.getPlayerProfile(acc.uid);
      alive++;
      updated.push({
        ...acc,
        lastChecked: new Date().toISOString(),
        status: 'alive',
        profile: {
          nickname: profile?.basicinfo?.nickname || acc.nickname,
          level: profile?.basicinfo?.level || 0,
          region: profile?.basicinfo?.region || acc.region
        }
      });
      console.log(`[${i + 1}/${accounts.length}] OK ${acc.uid} | ${profile?.basicinfo?.nickname || '-'} | Lv ${profile?.basicinfo?.level || '-'}`);
    } catch (e) {
      dead++;
      updated.push({ ...acc, lastChecked: new Date().toISOString(), status: 'dead', error: e.message });
      console.error(`[${i + 1}/${accounts.length}] FAIL ${acc.uid}: ${e.message}`);
    }
    if (i < accounts.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const backupFile = `accounts-backup-${Date.now()}.json`;
  writeFileSync(backupFile, JSON.stringify(accounts, null, 2), 'utf-8');
  writeFileSync(ACCOUNTS_FILE, JSON.stringify(updated, null, 2), 'utf-8');

  console.log(`\n=== Selesai ===`);
  console.log(`Alive: ${alive}`);
  console.log(`Dead: ${dead}`);
  console.log(`Backup: ${backupFile}`);
  console.log(`Updated: ${ACCOUNTS_FILE}`);
}

updateAll().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
