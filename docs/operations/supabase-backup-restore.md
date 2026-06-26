# Supabase yedekleme ve test projesine geri yükleme

## Güvenlik

- Backup production veritabanını ve Storage’ı yalnız okur.
- `career-cvs` özel kişisel veri içerebilir; `supabase-backups/` Git’e veya açık buluta yüklenmez.
- Restore yalnız yeni ve boş bir test projesine izin verir; kaynak project ref hedef olarak reddedilir.

## Storage doğrulama modeli

Supabase CLI `storage ls` çıktısı sürüme göre düz metin dönebildiğinden JSON olarak ayrıştırılmaz. CLI komutu yalnız bucket erişimini kontrol eder. Kesin uzak envanter, salt okunur PostgreSQL sorgusuyla `storage.buckets` ve `storage.objects` üzerinden alınır.

Dosyalar envanterdeki tam nesne yollarına göre tek tek indirilir. Yol, nesne sayısı ve mevcutsa byte boyutu eşleşmeden yedek tamamlanmaz.

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

25 Haziran 2026 production yedeği bu kriterlerle başarıyla doğrulandı: 6 bucket ve 4 Storage nesnesi.

## Yerel güvenli test

Production’a bağlanmadan yedekleme akışını sınamak için:

```bash
bash scripts/tests/test-supabase-backup-mock.sh
```

## Restore provası

Yalnız yeni ve boş test projesinde:

```bash
npm run restore:supabase:test -- /tam/yol/supabase-backups/<tarih-saat>
```

Araç exact-path yükleme yaptıktan sonra hedef `storage.objects` envanterini kaynak envanterle karşılaştırır.

Gerçek production yedeği henüz uzak boş bir test projesine restore edilmemiştir. Mock restore testi başarılıdır; tam disaster-recovery kabulü için gerçek prova önerilir.
