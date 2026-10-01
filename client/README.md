# FF Client (OB55)

Client package pake `ffapis` v3.0.1 buat register guest, kirim like, dan update akun.

## Install
npm install ffapis

## Register Massal
FF_REGION=ID FF_COUNT=50 FF_DELAY=2000 FF_OB_VERSION=OB55 node register.js

## Kirim Like pake Semua Akun
FF_TARGET_UID=1234567890 FF_REGION=ID FF_OB_VERSION=OB55 node send-all.js

## Update Status Semua Akun
FF_OB_VERSION=OB55 node update-all.js

## Environment Variables
| Variable | Default | Fungsi |
|---|---|---|
| FF_REGION | ID | Region akun |
| FF_COUNT | 10 | Jumlah akun yang diregister |
| FF_DELAY | 2000 | Delay antar request (ms) |
| FF_OB_VERSION | OB55 | OB version override |
| FF_TARGET_UID | - | Target UID buat like |
| FF_LIKE_COUNT | 1 | Jumlah like per akun per target |

## OB55 Override
`ffapis` v3.0.1 default OB54, tapi support override tanpa update library:

```javascript
// 3 cara override:
// 1. Per-request
await api.register('ID', null, 'OB55');

// 2. Per-instance
const api55 = new FreeFireAPI(null, { obVersion: 'OB55' });

// 3. Per-environment
FF_OB_VERSION=OB55 node register.js
```

Priority: request > instance > env > config/settings.yaml.

```

---

**`README.md` (root)**

```markdown
# FF API Server (OB55)

Backend API server + client package buat manajemen akun guest Free Fire OB55.

## Endpoint OB55
- OAuth: https://ffmconnect.live.gop.garenanow.com/oauth/guest/token/grant
- MajorLogin: https://loginbp.ppmainecoonghj.com/MajorLogin
- Host: loginbp.ggpolarbear.com
- Client global: https://clientbp.ggpolarbear.com/
- Client India: https://client.ind.freefiremobile.com/
- Client US: https://client.us.freefiremobile.com/
- Release version: OB55
- Client version: 1.132.3

## WAJIB SEBELUM JALAN (server)
Isi MAIN_KEY_B64 dan MAIN_IV_B64 di lib/crypto.js dengan nilai real dari:
- github.com/0xMe/FreeFire-Api -> lib2.py baris 12-13
- github.com/kaifcodec/freefire-jwt-generator-api -> app/settings.py
- github.com/kaifcodec/freefire-like-and-guest-api

Kalau nggak butuh server, langsung pake client ffapis (nggak perlu key manual).

## Run Server
npm install
npx vercel dev

## Run Client
cd client
npm install
FF_REGION=ID FF_COUNT=50 node register.js
FF_TARGET_UID=1234567890 node send-all.js

## Deploy Server
npx vercel --prod
```

---

CARA JALANIN

```bash
# Server
cd ff-api-server
npm install

# Client
cd client
npm install

# Register 50 akun guest OB55
FF_REGION=ID FF_COUNT=50 FF_DELAY=2000 FF_OB_VERSION=OB55 node register.js

# Kirim like pake semua akun
FF_TARGET_UID=1234567890 FF_OB_VERSION=OB55 node send-all.js

# Cek status semua akun
FF_OB_VERSION=OB55 node update-all.js
