# Faz 8 — Supabase Auth ve korumalı admin alanı

## Kurulan yapı

- `proxy.ts`, Next.js 16 Proxy mekanizmasıyla admin isteklerinde Supabase oturum cookie'lerini yeniler.
- `/admin/login`, yalnız e-posta ve şifre ile giriş sunar; kayıt olma ekranı yoktur.
- `/admin`, sunucu tarafında JWT claims, `profiles.is_active` ve `profiles.role = admin` kontrollerinden sonra açılır.
- Çıkış işlemi yerel Supabase oturumunu temizler ve login sayfasına yönlendirir.
- `viewer` ve `editor` hesapları admin route'una erişemez.
- Eski Firebase/demo admin script'i artık `/admin` sayfasında yüklenmez.

## İlk admin kurulumu

1. Supabase Dashboard > Authentication > Users üzerinden bir kullanıcı oluştur.
2. Kullanıcıyı doğrulanmış/confirmed oluştur ve güçlü, benzersiz şifre kullan.
3. `supabase/manual/promote_first_admin.sql` dosyasını aç.
4. `ADMIN_EMAIL_BURAYA` değerini kullanıcının e-postasıyla değiştir.
5. SQL Editor'da yalnız o kopyayı çalıştır. Kişisel e-posta yazılmış dosyayı Git'e kaydetme.
6. `supabase/verification/verify_faz_8_admin_auth.sql` sorgusunu çalıştır.
7. `/admin/login` üzerinden giriş yap.

## Güvenlik notları

- Publishable key kullanılmaya devam eder; secret/service role istemciye eklenmez.
- Rol bilgisi kullanıcı metadata'sından alınmaz. Tek doğruluk kaynağı RLS korumalı `public.profiles` tablosudur.
- Yeni Auth kullanıcıları trigger ile daima `viewer` olarak açılır.
- Admin rolü yalnız Dashboard SQL işlemi veya ileride admin kullanıcı yönetimi üzerinden verilir.
- Public kayıt ekranı bulunmadığı için Auth ayarlarında "Allow new users to sign up" kapatılmalıdır.
