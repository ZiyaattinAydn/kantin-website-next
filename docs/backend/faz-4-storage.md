# Faz 4 — Supabase Storage

Bu aşama, Kantin Website için dosya saklama sınırlarını ve Storage RLS modelini oluşturur.

## Bucket yapısı

| Bucket | Erişim | Türler | Sınır |
|---|---|---|---:|
| `menu-images` | Public | JPEG, PNG, WebP, AVIF | 8 MiB |
| `event-images` | Public | JPEG, PNG, WebP, AVIF | 8 MiB |
| `merch-images` | Public | JPEG, PNG, WebP, AVIF | 8 MiB |
| `gallery-images` | Public | JPEG, PNG, WebP, AVIF | 8 MiB |
| `instagram-media` | Public | JPEG, PNG, WebP, AVIF | 8 MiB |
| `career-cvs` | Private | PDF, DOC, DOCX | 5 MiB |

SVG kabul edilmez. SVG dosyaları aktif içerik taşıyabildiği için marka görselleri yalnız raster formatlarla sınırlandırılmıştır.

## Yetki modeli

- Public medya dosyaları ziyaretçilere sunulabilir.
- Public medya yükleme, güncelleme ve silme işlemleri yalnız aktif `editor` veya `admin` rolüne açıktır.
- `career-cvs` hiçbir zaman public bucket değildir.
- CV dosyalarını yalnız aktif `admin` rolü okuyabilir, yükleyebilir, değiştirebilir veya silebilir.
- Faz 4 sonunda anonim CV yükleme kapalıdır.

Anonim kariyer başvurusu yükleme yolu; formun sunucu doğrulaması, spam önleme, tekrar gönderim koruması ve veritabanı kaydı birlikte hazırlandığında açılacaktır. Böylece yalnız bucket adına dayalı geniş bir anonim yükleme izni verilmez.

## Dosya yolu standardı

Orijinal dosya adı Storage yolunda kullanılmaz. Önerilen düzen:

```text
<kayit-uuid>/<rastgele-uuid>.<uzanti>
```

Örnek:

```text
b6e5e55a-9c54-4f58-a0b5-63f34f91d113/1c197ecf-e821-46c5-b645-55fd2e4248f2.pdf
```

Bu yaklaşım dosya adında kişisel bilgi sızıntısını ve kolay tahmin edilebilir URL üretimini azaltır.

## Önemli uygulama kuralı

`storage.objects` kayıtlarını doğrudan `insert`, `update` veya `delete` ile değiştirmeyin. Gerçek dosya işlemleri Supabase Storage API üzerinden yapılmalıdır. SQL migration yalnız bucket tanımlarını ve RLS politikalarını yönetir.
