# FF API Server (OB55)

Website wrapper tipis di atas `ffapis`. Nggak ada OAuth manual, nggak ada
protobuf, nggak ada AES, nggak ada MAIN_KEY / MAIN_IV.
Semua di-handle library `ffapis` v3.0.1.

## Endpoint

| Method | Path | Fungsi |
|---|---|---|
| GET  | /api/health | health + daftar region |
| GET  | /api/region/list | daftar region + OB version |
| POST | /api/auth/register | register guest account |
| POST | /api/auth/login | login pake uid + password |
| GET  | /api/auth/profile | profile via ?uid= atau ?nickname= |
| POST | /api/like/send | kirim like ke target |

## Contoh Request

### Register
curl -X POST https://<domain>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"display_name":"TwinKeren","region":"ID"}'

### Login
curl -X POST https://<domain>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"uid":"8472910563","password":"rahasia123"}'

### Profile
curl "https://<domain>/api/auth/profile?nickname=TwinKeren"

### Like
curl -X POST https://<domain>/api/like/send \
  -H "Content-Type: application/json" \
  -d '{"uid":"1234567890","region":"ID","count":1}'

## Env (optional)
- FF_OB_VERSION=OB55

## Run
npm install
npx vercel dev

## Deploy
npx vercel --prod
