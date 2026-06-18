# Kantin Website

Kantin Alsancak ve Atakent için geliştirilen Next.js, React ve TypeScript tabanlı web sitesi.

## Yerel çalışma

```bash
npm install
npm run dev
```

Tarayıcı: `http://localhost:3000`

## Kontroller

```bash
npm run lint
npm run build
```

## Sayfalar

- `/` — Ana sayfa
- `/menu` — Şube menüleri
- `/events` — Etkinlikler
- `/admin` — Geçici etkinlik yönetimi

## Yayın düzeni

- `develop` branch'i Vercel Preview ortamına gider.
- `main` production branch'idir ve şimdilik kullanılmaz.
- `.env*`, `.vercel`, `.next` ve `node_modules` GitHub'a gönderilmez.

Etkinlik yönetimi şu anda demo/Firebase uyumluluk katmanını kullanır. Supabase tabanlı yönetici sistemi sonraki backend aşamasında eklenecektir.
