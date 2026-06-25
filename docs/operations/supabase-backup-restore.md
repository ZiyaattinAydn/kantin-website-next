# Supabase yedekleme ve test projesine geri yükleme

## Güvenlik

- Backup production veritabanını ve Storage'ı yalnız okur.
- `career-cvs` özel kişisel veri içerebilir; `supabase-backups/` Git'e veya açık buluta yüklenmez.
- Restore yalnız yeni ve boş bir test projesine izin verir; kaynak project ref hedef olarak reddedilir.

## Storage doğrulama modeli

Supabase CLI `storage ls` çıktısı sürüme göre düz metin dönebildiğinden JSON olarak ayrıştırılmaz.
CLI komutu yalnız bucket erişimini kontrol eder. Kesin uzak envanter, salt okunur PostgreSQL
sorgusuyla `storage.buckets` ve `storage.objects` üzerinden alınır. Dosyalar bu envanterdeki
tam nesne yollarına göre tek tek indirilir; yol ve byte boyutu eşleşmeden yedek tamamlanmaz.

## Yedek alma

Docker Desktop açıkken:

```bash
npm run backup:supabase
```

Başarı ölçütleri:

- Terminalde `Sonuç: BAŞARILI`
- `metadata/STATUS.txt` içeriği `COMPLETE`
- `VERIFY_REPORT.md` sonucu `BAŞARILI`
- `metadata/storage-inventory.json` mevcut

## Yerel güvenli test

Production'a bağlanmadan yedekleme akışını sınamak için:

```bash
bash scripts/tests/test-supabase-backup-mock.sh
```

## Restore provası

Yalnız yeni ve boş test projesinde:

```bash
bash scripts/restore-supabase-to-test-project.sh /tam/yol/supabase-backups/<tarih>
```

Araç exact-path yükleme yaptıktan sonra hedef `storage.objects` envanterini kaynak envanterle karşılaştırır.
