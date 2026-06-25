# Kritik admin kayıtları sürüm geçmişi ve geri yükleme

`20260625010000_admin_record_revisions.sql` migration'ı aşağıdaki kritik tablolar için otomatik snapshot üretir:

- `branches`
- `site_settings`
- `site_pages`
- `content_blocks`

Her gerçek alan değişikliği aynı veritabanı transaction'ı içinde `admin_record_revisions` tablosuna yazılır. Ana işlem başarısız olup geri alınırsa snapshot da oluşmaz.

`20260625020000_admin_record_revision_restore.sql` migration'ı ise yönetim panelinden seçilen bir update snapshot'ının değişiklik öncesi hâline güvenli dönüş sağlar.

## Güvenlik

- Snapshot tablosunu yalnız admin kullanıcılar okuyabilir.
- Admin dahil hiçbir istemci doğrudan snapshot ekleyemez, değiştiremez veya silemez.
- Geri yükleme RPC'si yalnız aktif admin oturumunda çalışır.
- RPC, seçilen snapshot'ın ekrandaki kayıt ve kayıt türüyle birebir eşleşmesini doğrular.
- Hedef kayıt `FOR UPDATE` ile kilitlenir; eşzamanlı değişiklik üzerine sessizce yazılmaz.
- Geri yükleme yalnız panelde normal olarak düzenlenebilen alanları döndürür.
- `key`, `slug`, `page_id`, `block_type`, şube kodu ve sıralama gibi sistem kimlikleri eski snapshot'tan geri yazılmaz.
- Geri yükleme normal bir update olduğu için mevcut hâl otomatik olarak yeni snapshot'a dönüşür. Böylece geri yükleme işlemi de tekrar geri alınabilir.

## Panel kullanımı

Kritik bir kayıt satırını açınca **Sürüm geçmişi** bölümü görünür. Son 20 değişiklik listelenir.

Bir update kaydında:

1. Değişen alanları ve önce/sonra değerlerini incele.
2. **Bu değişiklikten önceki hâle dön** düğmesine bas.
3. Açılan onay alanına tam olarak `GERİ YÜKLE` yaz.
4. İşlemden sonra panel aynı kaydı açar ve yeni snapshot'ı listede gösterir.

İlk oluşturma kaydı, silme kaydı veya yalnız sistem alanı değişikliği geri yükleme düğmesi göstermez.

## Doğrulama

Yerel Supabase üzerinde:

```bash
npm run test:db
```

Uzak projede migration uygulandıktan sonra SQL Editor içinde:

```text
supabase/verification/verify_admin_record_revision_restore.sql
```

çalıştırılabilir.

## Geri alma

Yalnız geri yükleme RPC'sini kaldırmak için:

```text
supabase/manual/rollback_admin_record_revision_restore.sql
```

kullanılır. Bu dosya snapshot tablosunu veya geçmiş kayıtlarını silmez.

Snapshot altyapısını tamamen kaldıran `rollback_admin_record_revisions.sql` ise birikmiş geçmişi kalıcı olarak sildiği için normal rollback sırasında kullanılmamalıdır.
