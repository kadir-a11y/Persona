# hayalet — Claude Code Talimatları

> Genel kurallar `D:\GitHub\CLAUDE.md` dosyasındadır (otomatik okunur).

---

## Proje Tanımı
Hayalet projesi. Next.js tabanlı web uygulaması. Cloudflare R2 medya depolama, Gemini AI entegrasyonu.

## Tech Stack
- **Framework:** Next.js — Port: 3333
- **DB:** PostgreSQL (harici sunucu: 46.225.216.104:5436)
- **Cache:** Redis (harici sunucu: 46.225.216.104:6381)
- **Auth:** Auth.js (AUTH_SECRET)
- **AI:** Google Gemini
- **Storage:** Cloudflare R2

## Credentials & Ortam
`.env` dosyasını doğrudan oku:
- `DATABASE_URL` — PostgreSQL bağlantısı
- `REDIS_URL` — Redis cache
- `AUTH_SECRET` / `AUTH_URL` — Auth yapılandırması
- `GEMINI_API_KEY` — Google Gemini AI
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` — Cloudflare R2

## Notion Referansları
- Notion kartı yok (henüz)

## Ortak Çalışma
- Başka geliştirici: Hayır
- CLAUDE.md git'e dahil: Evet
