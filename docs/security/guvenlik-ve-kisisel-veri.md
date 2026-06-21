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
- İşleme amacı ve saklama süresi sona erdiğinde başvuru ve CV için silme/anonimleştirme prosedürü uygulanmalıdır.

## Operasyon

- Admin hesaplarında güçlü parola ve iki faktörlü owner hesapları kullanılmalıdır.
- Rol değişiklikleri ve kritik admin işlemleri kayıt altındadır.
- Test verileri gerçek aday bilgisi içermemelidir.
- Proje devrinde owner, admin, Vercel, GitHub ve Supabase erişimleri yeni sahibine geçirilip eski erişimler kaldırılmalıdır.
