# 24 Haziran 2026 — Medyayı yerinde değiştirme ve otomatik bağlantı temizleme

## Amaç

Admin kullanıcısının bir görselin nerelerde bağlı olduğunu teknik olarak takip etmeden:

- aynı medya kaydı üzerinde yeni dosya yükleyebilmesi,
- mevcut içerik bağlantılarını koruyabilmesi,
- arşivlenmiş görseli kalıcı silerken bağlı kayıtların otomatik temizlenmesi,
- düzenleme formuna hızlı ve anlaşılır biçimde ulaşabilmesi

sağlandı.

## Kullanıcı akışı

### Görsel değiştirme

1. `/admin/media` listesinden **Düzenle / değiştir** seçilir.
2. Sayfa `#media-editor` hedefine yumuşak geçiş yapar.
3. Sağ editör alanındaki **Yerine başka görsel koy** bölümünden yeni dosya seçilir.
4. Yeni dosya Storage'a yüklenir.
5. `replace_admin_media_file` RPC'si aynı medya UUID'sini koruyarak dosya kaynağını günceller.
6. Menü, etkinlik, merch ve Instagram gibi UUID tabanlı bağlantılar değişmeden çalışmaya devam eder.
7. `content_blocks` içindeki eski yerel yol, object path veya public URL referansları yeni public URL ile transaction içinde güncellenir.
8. Eski Storage nesnesi temizlenir. Bu son temizlik başarısız olursa yeni görsel aktif kalır ve admin kullanıcıya uyarı gösterilir.

### Kalıcı silme

1. Görsel önce arşivlenir.
2. Admin güçlü onay metnini yazar.
3. `begin_admin_media_delete` kaydı silme için kilitler.
4. Storage kaynağıysa fiziksel dosya silinir.
5. `complete_admin_media_delete` aynı transaction içinde:
   - `menu_items.image_media_id`,
   - `events.image_media_id`,
   - `merch_products.image_media_id`,
   - `instagram_posts.image_media_id`,
   - varsa ilgili CV medya bağlantısı,
   - `content_blocks` içindeki UUID/yol/URL referansları

   için bağlantıları temizler ve medya kaydını siler.
6. İşlem ayrıntıları `admin_activity_logs` tablosuna yazılır.

Local dosya kaynağında admin paneli repository içindeki fiziksel dosyayı silmez. Veritabanı kaydı ve public bağlantılar kaldırılır; paket içindeki artık kullanılmayan fiziksel dosya daha sonra kod temizliği sırasında güvenle ele alınabilir.

## Public görünürlük güvenliği

Public adaptörler yalnız `status = published` ve `is_active = true` medya kayıtlarını çözer. Merch ön/arka yüz görselleri de artık medya tablosundaki aktif kayıtlardan gelir. Eski sabit `tee-front.jpg` / `tee-back.jpg` yollarına public bileşenlerde geri dönüş yapılmaz. Görsel arşivlenmiş veya silinmişse kırık URL yerine kontrollü placeholder gösterilir.

## Responsive ve hızlı kullanım

- 1280 px ve üzerindeki ekranlarda medya listesi solda, sticky editör sağdadır.
- Daha dar ekranlarda editör listenin üstüne taşınır.
- **Düzenle / değiştir** bağlantısı editöre anchor ile gider; global smooth-scroll davranışı kullanılır.
- Hızlı bağlantılar: yeni görsel, yayındakiler, arşiv/pasif ve tüm görseller.
- Seçilen kayıt listede vurgulanır.
- Mobilde tablo kart görünümüne dönüşür.

## Migration

Bu davranış için şu migration zorunludur:

```text
supabase/migrations/20260624020000_media_replace_and_auto_detach.sql
```

Önceki medya migration'ından sonra uygulanmalıdır. Production'a migration uygulanmadan yeni replace/delete RPC'lerini kullanan kod yayınlanmamalıdır.

## Doğrulama

Kod tarafında doğrulananlar:

- replacement aynı medya UUID'sini kullanır,
- replacement RPC hatasında yeni Storage nesnesi temizlenir,
- bağlantılı arşiv medya kalıcı silme akışına girebilir,
- local medya Storage çağrısı yapmadan silinebilir,
- editör responsive ve anchor kontratı,
- merch ön/arka görsellerinde hardcoded public fallback bulunmaması.

Docker olmadığı için migration gerçek PostgreSQL üzerinde pgTAP ile çalıştırılmadı. Production smoke testi yalnız `TEST_` kayıtlarıyla yapılmalıdır.
