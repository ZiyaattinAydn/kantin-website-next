# Güncelleme paketini uygulama

1. Mevcut `C:\Users\ziyaa\kantin-website-next` klasörünü yedekle.
2. Bu paketin içeriğini mevcut proje klasörünün üzerine çıkar.
3. `node_modules`, `.next`, `.vercel` ve `.env.local` klasör/dosyalarını paketten bekleme; bunlar yerel veya Vercel ortamında üretilir.
4. Yerelde görmek için proje kökündeki `baslat.bat` dosyasına çift tıkla.
5. Kontrolden sonra GitHub Desktop'ta branch'in `develop` olduğunu doğrula.
6. Değişiklikleri commit et ve `Push origin` butonuna bas.
7. Vercel yeni korumalı Preview deployment'ını otomatik oluşturur.

## İlk açılış

`node_modules` yoksa `baslat.bat` otomatik olarak `npm install` çalıştırır. Bu yalnızca ilk açılışta biraz zaman alır.
