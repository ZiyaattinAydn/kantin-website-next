KANTİN SUPABASE YEDEKLEME ARACI — STEP 6C

Bu sürüm Supabase CLI `storage ls --output json` çıktısına güvenmez.
CLI 2.107.x Storage liste komutu düz metin döndürebildiği için uzak dosya
envanteri doğrudan production veritabanındaki `storage.buckets` ve
`storage.objects` tablolarından salt okunur sorguyla alınır.

Storage dosyaları envanterdeki kesin nesne yollarına göre tek tek indirilir.
Her dosyanın yolu ve mevcutsa byte boyutu yerel kopyayla karşılaştırılır.
Yalnız bütün dosyalar eşleşirse metadata/STATUS.txt COMPLETE olur.

Kurulumdan sonra:
  bash -n scripts/backup-supabase.sh
  node --check scripts/storage-inventory.mjs
  bash scripts/tests/test-supabase-backup-mock.sh
  npm run backup:supabase

Eski scripts/inspect-storage-listing.mjs ve scripts/verify-storage-copy.mjs
artık kullanılmaz; projede kalsalar da hiçbir komut onları çağırmaz.
