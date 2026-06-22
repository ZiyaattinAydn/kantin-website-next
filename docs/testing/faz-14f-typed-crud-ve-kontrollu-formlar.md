# Faz 14F Tipli CRUD ve Kontrollü Formlar

Bu faz generic admin CRUD yazma sınırını uygulama katmanında doğrular. Veritabanı constraint'leri son savunma hattı olarak korunur; kullanıcı girdisi yalnız constraint hatasına bırakılmaz. Faz migration, paket kurulumu veya canlı veri işlemi gerektirmez.

## Mimari

- `resource-validation.ts`, `AdminResource` tanımındaki alanları tek noktada parse eder ve `AdminMutationPayload` üretir.
- `AdminResource` alan, liste, arama, sıralama ve durum kolonlarını seçilen tablonun generated Database tipleriyle derleme zamanında sınırlar.
- `AdminValidationError`, hata kodu ve alan adı taşır. Server action bunu güvenli mesaj ve `field` query parametresiyle editöre döndürür.
- `resource-repository.ts`, dinamik tablo adının Supabase generic tipleriyle çakıştığı noktayı tek veri erişim sınırında toplar.
- Repository yalnız doğrulanmış JSON uyumlu payload kabul eder; benzersizlik, FK ve check constraint hatalarını kullanıcıya ham DB mesajı göstermeden sınıflandırır.
- Generic CRUD ve kontrollü tema upsert akışlarında `as never` / `as unknown` dönüşümü kalmamıştır.

## Alan doğrulamaları

- Zorunlu alan, metin/textarea uzunluğu ve boş/null dönüşümü
- Küçük harf-sayı-tire biçiminde slug
- İçerik ve ayar anahtarlarında kontrollü identifier karakterleri
- E-posta ve yalnız HTTPS URL
- Sıfır veya üstü para; sıfır veya üstü tam sayı sıra/stok
- Statik select alanlarında izin verilen seçenek kümesi
- Foreign alanlarında UUID biçimi; kaydın gerçekten varlığı FK ile son kez doğrulanır
- String listelerinde öğe sayısı ve öğe uzunluğu sınırı
- İstanbul yerel tarih-saat değerinin ISO tarihe dönüştürülmesi

## JSON güvenliği ve kaynak şemaları

Tüm JSON girdileri 50 KB, 10 derinlik, nesne başına 100 anahtar ve liste başına 100 öğeyle sınırlandırılır. `__proto__`, `prototype` ve `constructor` anahtarları reddedilir.

Kaynak özel kurallar:

- Şube `opening_hours`: nesne; isteğe bağlı notice/note ve gün-saat çiftlerinden oluşan items listesi
- Site sayfası `metadata`: JSON nesnesi
- İçerik bloğu `content`: JSON nesnesi
- `theme.settings`: DB constraint'iyle aynı preset ve eksiksiz/benzersiz bölüm sırası
- `sections.visibility`: sekiz public bölüm için zorunlu boolean değerler
- `navigation.primary`: href/label içeren bağlantı listesi
- `navigation.footer`: başlık ve bağlantı listesi içeren grup listesi
- `site.identity`, `site.contact`, `footer.content`: JSON nesnesi

Bilinmeyen yeni `site_settings` anahtarları güvenli JSON sınırlarından geçer fakat key'e özel şema uygulanmaz. Yeni public ayar türü eklenirken doğrulama şeması da aynı değişiklikte eklenmelidir.

## Form davranışı

- Server doğrulama hatası hem sayfa uyarısında hem ilgili alanda gösterilir.
- Hatalı alan `aria-invalid` ve `aria-describedby` ile işaretlenir.
- JSON editörü yazarken sözdizimi durumunu gösterir ve yalnız geçerli JSON'u biçimlendirir.
- HTML `required`, `min`, `step`, `maxLength`, e-posta, URL ve slug pattern kontrolleri hızlı istemci geri bildirimi sağlar; server doğrulaması otoritedir.

## Test kapsamı

```bash
npm run test:unit
npm run test:unit:coverage
npm run lint
npx tsc --noEmit
```

Unit senaryoları para/tam sayı dönüşümü, UUID, select allow-list, JSON nesne şeması, prototype anahtarı, çalışma saatleri, tema constraint eşleşmesi, alan bazlı redirect ve JSON editörü davranışını kapsar.

Yerel Supabase mevcut olduğunda `npm run test:db`; yerel uygulama ve TEST admin hesabı mevcut olduğunda `npm run test:e2e` ayrıca çalıştırılmalıdır. Bu iki komut Preview/Production hedeflerini güvenlik kontrolüyle reddeder.

## Migration ve geri uyumluluk

Migration gerekmez. Mevcut DB constraint ve RLS politikaları değiştirilmez. Daha önce DB'de bulunan fakat yeni uygulama şemasına uymayan eski bir kayıt editörde kaydedilmek istendiğinde düzeltilmesi istenir; public okuma fallback davranışı değişmez.

Geri dönüş gerekirse server action tekrar eski parser'a alınabilir ve kontrollü JSON bileşeni textarea'ya çevrilebilir. DB şeması ve veri değişmediği için veri rollback'i yoktur.
