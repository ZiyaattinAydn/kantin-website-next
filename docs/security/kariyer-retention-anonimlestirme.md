# Kariyer Retention ve Anonimleştirme

Bu belge Faz 14D ile eklenen teknik kişisel veri yaşam döngüsünü açıklar. Hukuki danışmanlık değildir; 180 günlük süre işletmenin onaylı KVKK politikasıyla ayrıca doğrulanmalıdır.

## Retention politikası

- Yeni başvurunun `retention_until` değeri varsayılan olarak oluşturulma tarihinden 180 gün sonradır.
- Migration mevcut başvurular için tarihi `created_at + 180 days` olarak hesaplar.
- Tarihin dolması otomatik silme yapmaz; admin ekranı kaydı inceleme için işaretler.
- Erken anonimleştirme, aday talebi veya işleme amacının sona ermesi halinde admin tarafından yapılabilir.

## Ön koşullar

1. Başvuru sonucu ve gerekli admin notları tamamlanır.
2. Başvuru durumu `Arşiv` yapılır.
3. Admin isterse önce dry-run kontrolü çalıştırır; bu kontrol DB veya Storage yazmaz.
4. Admin anonimleştirme formuna `ANONIMLESTIR` yazar.
5. Tarayıcı onayında geri döndürülemez işlem tekrar kabul edilir.

## Dry-run kontrolü

Admin ekranındaki dry-run kontrolü yalnız salt-okunur ön doğrulama yapar. Başvurunun varlığını, arşiv durumunu ve varsa CV medya kaydının `storage` + `document` + `career-cvs` bucket yapısına uygunluğunu kontrol eder. Bu işlem:

- `begin_job_application_anonymization` RPC'sini çağırmaz.
- Storage dosyası silmez.
- Başvuru, medya veya audit kaydı yazmaz.
- Gerçek silme/anonimleştirme kanıtı değildir; yalnız işlem öncesi güvenli bağlantı kontrolüdür.

## İki aşamalı teknik akış

```text
active + archived
       |
       v
anonymization_pending  -- Storage hatası --> active (hata kaydı)
       |
       | private career-cvs nesnesi silinir
       v
DB nesnenin yokluğunu doğrular
       |
       v
anonymized + CV media kaydı silinmiş
```

`begin_job_application_anonymization` başvuru satırını kilitler ve yalnız arşiv kaydında işlemi başlatır. Uygulama yalnız RPC'nin döndürdüğü `career-cvs` yolunu Storage API ile siler. `complete_job_application_anonymization`, `storage.objects` kaydının yokluğunu doğrulamadan kişisel alanları değiştirmez.

Storage silme başarısızsa `cancel_job_application_anonymization` kaydı tekrar `active` durumuna getirir. Storage silinip son DB adımı geçici olarak başarısız olursa kayıt `anonymization_pending` kalır ve aynı admin eylemi güvenle yeniden çalıştırılabilir.

## Anonimleştirilen alanlar

- Ad, telefon ve e-posta geri döndürülemez placeholder değerlere dönüştürülür.
- Şube tercihi, uygun günler, deneyim, tanıtım metni ve admin notu temizlenir.
- Submission token yenilenir.
- Submission fingerprint, IP hash ve user-agent hash temizlenir.
- `cv_media_id` boşaltılır ve CV medya DB kaydı silinir.
- CV private Storage nesnesi uygulama tarafından silinir.
- Departman, çalışma türü, vardiya, consent zamanı/sürümü ve oluşturulma tarihi kimliksiz istatistik ve işlem kanıtı olarak korunur.

## Audit ve yetki

- RPC'ler yalnız authenticated role açıktır ve içeride `is_admin()` kontrolü yapar.
- Başlatma, iptal ve tamamlama audit kayıtları RPC transaction'ı içinde yazılır.
- Audit etiketleri aday adı veya iletişim bilgisi içermez.
- Anonimleştirilmiş veya bekleyen başvurunun CV signed URL endpoint'i `410` ile kapanır.

## Migration ve geri dönüş

Migration otomatik CV veya başvuru silmez. Uygulanmadan önce yerel Supabase'de pgTAP ve TEST_ başvurusu ile denenmelidir. Migration uygulandıktan ve gerçek bir anonimleştirme tamamlandıktan sonra aday verisi/CV geri getirilemez; geri dönüş yalnız kod ve şema içindir, silinmiş kişisel veri için değildir.
