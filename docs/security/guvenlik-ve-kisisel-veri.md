# Güvenlik ve Kişisel Veri Notları

Bu belge teknik çalışma notudur; hukuki danışmanlık yerine geçmez.

## Anahtarlar

- Browser yalnız Supabase publishable key kullanır.
- `service_role`, `sb_secret_...` ve database password frontend, Git veya Vercel public değişkenlerine yazılmaz.
- `.env.local` paylaşılmaz ve ZIP'e eklenmez.

## RLS

- Public kullanıcı yalnız aktif/yayınlanmış içeriği okuyabilir.
- İçerik yazma işlemleri aktif editor/admin rolüne bağlıdır.
- Kariyer başvuruları ve CV kayıtları public SELECT'e kapalıdır.
- UI kontrolü güvenlik değildir; server ve RLS birlikte kullanılmalıdır.

## CV ve başvuru verileri

- CV bucket private kalmalıdır.
- CV indirme yalnız kısa süreli signed URL ile yapılır.
- Ham IP ve user-agent saklanmaz; spam kontrolünde hash kullanılır.
- Gereksiz kişisel veri admin notlarına yazılmamalıdır.
- Varsayılan retention inceleme süresi 180 gündür; bu tarih otomatik silme yapmaz.
- İşleme amacı veya saklama süresi sona erdiğinde [iki aşamalı CV silme ve anonimleştirme prosedürü](kariyer-retention-anonimlestirme.md) uygulanır.

## Operasyon

- Admin hesaplarında güçlü parola ve iki faktörlü owner hesapları kullanılmalıdır.
- Rol değişiklikleri ve kritik admin işlemleri kayıt altındadır.
- Test verileri gerçek aday bilgisi içermemelidir.
- Proje devrinde owner, admin, Vercel, GitHub ve Supabase erişimleri yeni sahibine geçirilip eski erişimler kaldırılmalıdır.
