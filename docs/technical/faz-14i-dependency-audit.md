# Faz 14I — Kontrollü bağımlılık denetimi

## Başlangıç durumu

`npm audit` taramasında iki `moderate` bulgu görüldü. Her iki bulgu da Next.js 16.2.9 tarafından transitif olarak getirilen `postcss@8.4.31` zincirine dayanıyordu.

Doğrudan uygulama bağımlılıklarında `high` veya `critical` bulgu yoktu.

## Uygulanan güvenli düzeltme

`package.json` içine aşağıdaki kontrollü override eklendi:

```json
"overrides": {
  "postcss": "8.5.15"
}
```

Bu seçim:

- Next.js veya React major sürümünü değiştirmez.
- Uygulama API yüzeyini değiştirmez.
- Savunmasız transitif PostCSS sürümünü güvenli sürümle değiştirir.
- Vitest/Vite zincirindeki PostCSS sürümünü de aynı sürümde tekilleştirir.

## Doğrulama

Aşağıdaki kontroller temiz sonuç vermelidir:

```bash
npm ci
npm audit
npm run test:unit
npm run lint
npx tsc --noEmit
npm run build
```

Beklenen bağımlılık ağacı:

```text
next@16.2.9 -> postcss@8.5.15 overridden
vite -> postcss@8.5.15 deduped
```

Beklenen güvenlik sonucu:

```text
0 vulnerabilities
```

## Bilinçli olarak ertelenen yükseltmeler

Sunum öncesinde kırılma riski yaratmamak için aşağıdaki major yükseltmeler uygulanmadı:

- ESLint 9 -> 10
- TypeScript 5 -> 6
- `@types/node` 20 -> 26

React/React DOM patch yükseltmeleri güvenlik bulgusuyla ilişkili olmadığı için bu fazın kapsamına alınmadı.

## Geri alma

Beklenmeyen bir uyumsuzlukta:

1. `package.json` içindeki `overrides.postcss` kaydını kaldır.
2. `package-lock.json` dosyasını önceki committen geri al.
3. `npm ci` çalıştır.

Bu geri alma işlemi uygulama veya veritabanı verisini etkilemez.
