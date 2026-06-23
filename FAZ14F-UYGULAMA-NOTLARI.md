# Kantin Website — Faz 14F Tamamlama Paketi

## Tamamlanan kapsam

- Generic içerik ve `site_settings` mutasyonları transaction içi DB trigger audit katmanına taşındı.
- Tema ayarları iki ayrı upsert + sonradan audit yerine tek transaction RPC ile kaydediliyor.
- Kariyer başvurusu durum/not güncellemesi audit kaydıyla aynı RPC transaction'ında tamamlanıyor.
- Medya yükleme sırasında Storage başarılı, DB/audit başarısız olursa yüklenen nesne temizleniyor.
- Medya arşivleme ve geri alma işlemleri auditli RPC üzerinden atomik çalışıyor.
- `TEST_` medya kalıcı silme işlemi hazırlama → Storage silme → DB tamamlama / geri alma akışına taşındı.
- `media` ve `job_applications` tablolarında authenticated doğrudan INSERT/UPDATE/DELETE yetkileri kaldırıldı.
- Yeni RPC'ler generated TypeScript database tiplerine eklendi.
- Vitest ve pgTAP regresyonları eklendi.

## Değişen dosyalar

- `CHANGELOG.md`
- `src/lib/admin/application-actions.ts`
- `src/lib/admin/media-actions.ts`
- `src/lib/admin/resource-actions.ts`
- `src/lib/admin/theme-actions.ts`
- `src/lib/supabase/database.types.ts`
- `supabase/README.md`
- `supabase/migrations/20260623010000_transactional_content_audit.sql`
- `supabase/migrations/20260623020000_transactional_admin_mutations.sql`
- `supabase/tests/content_audit_triggers.test.sql`
- `supabase/tests/transactional_admin_mutations.test.sql`
- `tests/unit/admin/application-actions.test.ts`
- `tests/unit/admin/media-actions.test.ts`
- `tests/unit/admin/resource-actions.test.ts`
- `tests/unit/admin/theme-actions.test.ts`

## Bu ortamda doğrulananlar

- `npm run test:unit` → 28 test dosyası, 82 test başarılı
- `npm run lint` → başarılı
- `npx tsc --noEmit` → başarılı
- `npm run build` → başarılı
- Yeni migration ve pgTAP SQL dosyaları PostgreSQL parser kontrolünden geçti

## Henüz doğrulanamayanlar

Docker/local Supabase olmadığı için aşağıdakiler çalıştırılmadı:

- `npm run test:db`
- gerçek migration zinciri
- authenticated RPC davranışları
- Storage + DB entegrasyon testi

## Uygulama sırası

1. ZIP içeriğini proje köküne, klasör yapısını koruyarak kopyala.
2. Aşağıdaki kontrolleri çalıştır:

```bash
npm run test:unit
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short
```

3. Docker/local Supabase hazır olduğunda migration sırası:

```text
20260623010000_transactional_content_audit.sql
20260623020000_transactional_admin_mutations.sql
```

4. Ardından:

```bash
npm run test:db
```

## Kritik dağıtım notu

Uygulama kodu yeni RPC'leri çağırdığı için bu branch, migration'lar uygulanmadan Preview/Production'a çıkarılmamalı. Migration uygulanmadan admin tema, medya ve başvuru güncelleme ekranları hata verir.

DB testleri geçene kadar `faz-14f-audit` branch'ini `develop` ile birleştirme.

## Önerilen commit

```bash
git add .
git commit -m "security: complete Faz 14F transactional audit"
git push
```
