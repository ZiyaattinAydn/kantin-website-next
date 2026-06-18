# Mevcut Next.js projesine uygulama

Bu paket, `node_modules`, `.next`, `.git`, `package.json` ve `package-lock.json` içermeyen güvenli bir kaynak kodu taşıma paketidir.

1. Çalışan `kantin-website-next` klasörünü yedekle.
2. Yerel projendeki `src` ve `public` klasörlerini sil.
3. Bu paketteki `src` ve `public` klasörlerini yerel projenin köküne kopyala.
4. Kendi `package.json` ve `package-lock.json` dosyalarını koru.
5. Terminalde çalıştır:

```bash
npm run dev
```

Ardından kontrol et:

- `http://localhost:3000/`
- `http://localhost:3000/menu`
- `http://localhost:3000/events`
- `http://localhost:3000/admin`

Üretim kontrolü:

```bash
npm run build
```
