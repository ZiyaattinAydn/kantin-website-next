# Kantin canlı admin yazma kabul testi

Bu araç canlı yönetici panelinde yalnız kendi oluşturduğu `TEST_QA_` önekli geçici kayıtlarla aşağıdaki akışı dener:

- yönetici girişi
- kategori oluşturma
- tekrarlanan URL adı doğrulaması
- kategoriyi iki şubeye bağlama
- ürün oluşturma
- iki şube fiyatı oluşturma
- iki varyant oluşturma
- birleşik Fiyat Yönetimi ekranında iki şube ve varyantı tek işlemde güncelleme
- en yüksek varyant fiyatı/etiketi özeti
- işlem geçmişi
- ürünü ve alt fiyat/varyant kayıtlarını güvenli kalıcı silme
- kategoriyi ve kategori–şube ilişkilerini temizleme

## Kurulum

ZIP içindeki `qa-live-write` klasörünü proje köküne kopyala:

```text
C:\Users\ziyaa\kantin-website-next\qa-live-write
```

## Çalıştırma

Git Bash ile proje kökünde:

```bash
bash qa-live-write/run.sh
```

Tarayıcıyı görünür çalıştırmak için:

```bash
QA_HEADLESS=0 bash qa-live-write/run.sh
```

Tarayıcı eksikse:

```bash
npx playwright install chromium
```

## Sonuçlar

Araç şu klasörü üretir:

```text
qa-live-write-results/<tarih-saat>/
```

İçinde `REPORT.md`, `report.json` ve ekran görüntüleri bulunur. Tarih-saat klasörünü ZIP/RAR yapıp sohbete yükle.

## Güvenlik

- Araç yalnız oluşturduğu `TEST_QA_` kayıtları üzerinde çalışır.
- Gerçek ürün, kategori veya fiyatları seçmez.
- Şifreyi, çerezi veya erişim anahtarını rapora yazmaz.
- Temizlik başarısız olursa raporda kalan kayıt öneki açıkça gösterilir; panelde bu önekle aratılarak manuel temizlenebilir.
- `qa-live-write` ve `qa-live-write-results` klasörlerini GitHub'a commit etme.
