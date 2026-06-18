export const menuMarkup = String.raw`
<section class="page-hero page-hero-menu dotted-paper">
<div class="container page-hero-grid">
<div class="reveal">
<p class="eyebrow">Menüler şubeye göre değişir</p>
<h1>Şubeni seç<span>.</span></h1>
<p>
            Alsancak ve Atakent’in ortak ürünleri olsa da kokteyl ve yiyecek
            seçenekleri aynı değildir. Aşağıdan gideceğin şubeyi seç.
          </p>
</div>
<div aria-hidden="true" class="page-hero-mark reveal reveal-delay-1">
<span>ALS—ATA</span>
<svg viewbox="0 0 320 270">
<path d="M65 198c36-45 70-68 102-68 34 0 62 24 88 70"></path>
<path d="M84 72h74l-14 126H98L84 72ZM173 88h79l-18 110h-45L173 88Z"></path>
<path d="M95 122c18 9 35 9 52 0M184 137c20 8 39 8 59 0"></path>
</svg>
</div>
</div>
</section>
<div class="branch-selector-wrap">
<div aria-label="Şube menüsü seçimi" class="container branch-selector" role="tablist">
<button aria-controls="panel-alsancak" aria-selected="true" class="branch-tab active" data-menu-branch="alsancak" id="tab-alsancak" role="tab" type="button">
<strong>Alsancak</strong>
<small>Self-servis · kokteyl yok</small>
</button>
<button aria-controls="panel-atakent" aria-selected="false" class="branch-tab" data-menu-branch="atakent" id="tab-atakent" role="tab" type="button">
<strong>Atakent</strong>
<small>Bubble kokteyl · grill</small>
</button>
</div>
</div>
<section aria-labelledby="tab-alsancak" class="branch-menu-panel alsancak-menu-panel" data-menu-panel="alsancak" id="panel-alsancak" role="tabpanel">
<div class="container">
<header class="branch-menu-intro reveal">
<p class="menu-kicker">Alsancak Menu.</p>
<h2>Bira +<br/>yanında<span>.</span></h2>
<p>
            Alsancak menüsünde kokteyl bulunmaz. Fıçı ve şişe bira, şarap,
            fritöz ürünleri, sandviçler ve deli tabakları servis edilir.
          </p>
</header>
<div class="alsancak-menu-grid">
<section class="menu-sheet-block reveal">
<div class="sheet-title"><h3>Fıçı Biralar</h3></div>
<p class="draft-beer-note">Tüm fıçı biralar Mexican hazırlanabilir.</p>
<div class="menu-price-head dark-head">
<span>Ürün</span><span>20 cl</span><span>50 cl</span><span>66 cl</span>
</div>
<div class="menu-price-row four-cols"><strong>Becks</strong><span>₺100</span><span>₺215</span><span>₺245</span></div>
<div class="menu-price-row four-cols"><strong>Belfast</strong><span>₺90</span><span>₺200</span><span>₺230</span></div>
<div class="menu-price-row four-cols"><strong>Efes Pilsen</strong><span>₺90</span><span>₺200</span><span>₺230</span></div>
</section>
<section class="menu-sheet-block reveal reveal-delay-1">
<div class="sheet-title"><h3>Şişe Biralar</h3></div>
<div class="bottle-grid bottle-grid-als">
<div class="compact-row"><span>Amsterdam <small>50 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Becks <small>33 cl / 50 cl</small></span><strong>₺230 / ₺250</strong></div>
<div class="compact-row"><span>Bomonti Filtresiz <small>50 cl</small></span><strong>₺240</strong></div>
<div class="compact-row"><span>Bud <small>33 cl / 50 cl</small></span><strong>₺250 / ₺275</strong></div>
<div class="compact-row"><span>Corona <small>35,5 cl</small></span><strong>₺275</strong></div>
<div class="compact-row"><span>Duvel <small>33 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Efes Pilsen <small>30 cl / 50 cl</small></span><strong>₺150 / ₺230</strong></div>
<div class="compact-row"><span>Efes Malt <small>50 cl</small></span><strong>₺230</strong></div>
<div class="compact-row"><span>Efes Glutensiz <small>50 cl</small></span><strong>₺250</strong></div>
<div class="compact-row"><span>Efes Özel Seri <small>50 cl</small></span><strong>₺230</strong></div>
<div class="compact-row"><span>Erdinger <small>33 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Miller <small>33 cl</small></span><strong>₺250</strong></div>
<div class="compact-row"><span>Hoegaarden <small>33 cl</small></span><strong>₺300</strong></div>
</div>
</section>
<div class="menu-sheet-column menu-sheet-column-left"><section class="menu-sheet-block reveal reveal-delay-1">
<div class="sheet-title"><h3>Deli + Salata</h3></div>
<article class="branch-food-item deli-feature-item">
<div>
<h4>Sanayi Tabağı</h4>
<p>5 adet küp tulum peyniri · 5 adet küp eski kaşar peyniri · 2 adet turşu şiş.</p>
</div>
<strong>₺185</strong>
<div aria-label="Küp peynir porsiyon seçenekleri" class="cheese-portion-panel">
<div class="cheese-portion-heading">
<div>
<span class="cheese-portion-kicker">Küp peynir porsiyonları</span>
<p>Tulum, eski kaşar veya yarım yarım karışık olarak hazırlanabilir.</p>
</div>
<div aria-label="Porsiyon fiyatları" class="cheese-portion-prices">
<span>Yarım <strong>₺50</strong></span>
<span>Tam <strong>₺100</strong></span>
</div>
</div>
<div class="cheese-portion-options">
<div class="cheese-option">
<b>Tulum Peyniri</b>
<small>Orta sertlikte · menşei Bergama</small>
<span>Yarım: 6 küp · Tam: 12 küp</span>
</div>
<div class="cheese-option">
<b>Eski Kaşar Peyniri</b>
<small>Antep Fıstığı Ezmesi · Stracciatella Peyniri · Mortadella · Roka</small>
<span>Yarım: 6 küp · Tam: 12 küp</span>
</div>
<div class="cheese-option cheese-option-mixed">
<b>Karışık Küp Peynir</b>
<small>Tulum + eski kaşar birlikte</small>
<span>Yarım: 3 tulum + 3 kaşar · Tam: 6 tulum + 6 kaşar</span>
</div>
</div>
</div>
</article>
<article class="branch-food-item"><div><h4>Chorizo Şiş</h4><p>Baby enginar · chorizo · top peyniri · şeker domates.</p></div><strong>₺200</strong></article>
<article class="branch-food-item"><div><h4>Peynir Şiş</h4><p>Top peyniri · şeker domates.</p></div><strong>₺120</strong></article>
<article class="branch-food-item"><div><h4>Turşu Şiş</h4><p>Biberli zeytin · kornişon turşu · peynir dolgulu kiraz biber · biber turşusu.</p></div><strong>₺75</strong></article>
<article class="branch-food-item"><div><h4>Kuru İncir Şiş</h4><p>Kuru incir · eski kaşar peyniri · siyah üzüm.</p></div><strong>₺140</strong></article>
<article class="branch-food-item beer-salad-preceding-item"><div><h4>Çerez</h4></div><strong>₺80</strong></article>
<div class="beer-salad-heading">
<div><p class="menu-kicker">Bira Salataları</p><h4>İki vegan seçenek.</h4></div>
<span class="vegan-badge">VEGAN</span>
</div>
<div class="cute-note salad-note">İki salatayı aynı tabakta yarım + yarım olarak seçebilirsin ♡</div>
<div class="beer-salad-grid">
<article class="beer-salad-card">
<div>
<h4>Pasta Fredda</h4>
<p>Fusilli makarna · biber · soğan · mısır · balzamik sos · turşu.</p>
</div>
<div aria-label="Pasta Fredda porsiyon fiyatları" class="portion-prices">
<span>Tam <strong>₺200</strong></span>
<span>Yarım <strong>₺100</strong></span>
</div>
</article>
<article class="beer-salad-card">
<div>
<h4>Patates Salata</h4>
<p>Patates · Dijon hardal · dereotu · taze soğan · hardal tohumu.</p>
</div>
<div aria-label="Patates Salata porsiyon fiyatları" class="portion-prices">
<span>Tam <strong>₺200</strong></span>
<span>Yarım <strong>₺100</strong></span>
</div>
</article>
</div>
</section></div><div class="menu-sheet-column menu-sheet-column-right"><section class="menu-sheet-block reveal">
<div class="sheet-title"><h3>Şaraplar</h3></div>
<article class="editorial-item editorial-dark">
<div>
<h4>LA Smyrna</h4>
<p>Beyaz · Rosé · Kırmızı</p>
</div>
<strong>Kadeh ₺300<br/><small>Karaf 75 cl ₺1200</small></strong>
</article>
</section><section class="menu-sheet-block reveal reveal-delay-1">
<div class="sheet-title"><h3>Fritöz</h3></div>
<article class="branch-food-item">
<div><h4>Tortilla Cips</h4><p>Yanında seçtiğin <b>1 sos ücretsiz</b>.</p></div><strong>₺125</strong>
</article>
<article class="branch-food-item">
<div><h4>Patates Kızartması</h4><p>Yanında seçtiğin <b>2 sos ücretsiz</b>. Tulum veya trüf dokunuşu +₺70.</p></div><strong>₺220</strong>
</article>
<article class="branch-food-item">
<div><h4>Tavuk Kızartması</h4><p>Coleslaw ile birlikte servis edilir.</p></div><strong>₺275</strong>
</article>
<article class="branch-food-item">
<div><h4>Çıtır Chili Tavuk <span class="spicy-badge">ACILI</span></h4><p>Çıtır ve belirgin acılı tavuk.</p></div><strong>₺285</strong>
</article>
<article class="branch-food-item">
<div><h4>Frankfurter</h4><p>Coleslaw ile servis edilir. Glutensiz seçeneği bulunur.</p></div><strong>₺250</strong>
</article>
</section><section class="menu-sheet-block reveal">
<div class="sheet-title"><h3>Fırın</h3></div>
<div class="cute-note">Paylaşmaya hazır: bütün sandviçler ikiye bölünerek servis edilir ♡</div>
<article class="branch-food-item">
<div><h4>Ege Sandviç</h4><p>Stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.</p></div><strong>₺260</strong>
</article>
<article class="branch-food-item">
<div><h4>Kasap Sandviç</h4><p>Hindi füme · stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.</p></div><strong>₺320</strong>
</article>
<article class="branch-food-item">
<div><h4>Ballı Jambon Sandviç</h4><p>Antep fıstığı ezmesi · stracciatella peyniri · mortadella · roka.</p></div><strong>₺380</strong>
</article>
<article class="branch-food-item"><div><h4>Pretzel</h4><p>Cheddar sos ile servis edilir.</p></div><strong>₺125</strong></article>
</section></div></div>
<aside class="sauce-bar reveal">
<div><p class="menu-kicker">Ekstra sos +₺30</p><h3>Sosunu seç.</h3></div>
<p>Kantin Sos · Dereotlu Mayonez · Acı Barbekü · Cheddar Dip · Acı Mayonez · Trüf Mayonez · Sweet Chili</p>
</aside>
<section class="coffee-bar-section dotted-paper reveal" id="kahve-bari">
<div class="coffee-bar-inner">
<header class="coffee-menu-intro">
<div class="coffee-intro-copy">
<p class="menu-kicker">Alsancak Coffee Bar</p>
<p>
                  Klasik kahveler, imza içecekler ve matcha seçenekleri gün boyunca hazırlanır.
                </p>
<div aria-label="Kahve barı bilgileri" class="coffee-menu-note">
<span>Sıcak / soğuk hazırlanabilir</span>
<span>Yalnızca Alsancak</span>
</div>
</div>
<h3>Kahve +<br/>diğer içecekler<span>.</span></h3>
</header>
<div class="coffee-menu-editorial-grid">
<section class="coffee-menu-column">
<div class="coffee-section-heading">
<h4>Kahve</h4>
<small>Sıcak / Soğuk</small>
</div>
<div class="coffee-editorial-list">
<div><span>Espresso</span><strong>₺180</strong></div>
<div><span>Americano</span><strong>₺180</strong></div>
<div><span>Cappuccino</span><strong>₺200</strong></div>
<div><span>Latte</span><strong>₺200</strong></div>
<div><span>Flat White</span><strong>₺200</strong></div>
<div><span>Macchiato</span><strong>₺200</strong></div>
<div><span>Mocha</span><strong>₺200</strong></div>
<div><span>Filtre Kahve</span><strong>₺180</strong></div>
<div><span>Cold Brew <small>18H</small></span><strong>₺220</strong></div>
</div>
</section>
<div class="coffee-menu-column-stack">
<section class="coffee-menu-column">
<div class="coffee-section-heading">
<h4>Spesiyaller</h4>
</div>
<div class="coffee-editorial-list">
<div><span>Mont Blanc Latte</span><strong>₺240</strong></div>
<div><span>Pink Brew</span><strong>₺240</strong></div>
<div><span>Black Sesame Hojicha</span><strong>₺330</strong></div>
<div><span>Matcha Berry</span><strong>₺330</strong></div>
<div><span>Lotus Latte</span><strong>₺260</strong></div>
</div>
</section>
<section class="coffee-menu-column">
<div class="coffee-section-heading">
<h4>Kahve Dışı</h4>
</div>
<div class="coffee-editorial-list">
<div><span>Matcha Latte</span><strong>₺280</strong></div>
<div><span>Cloud Matcha</span><strong>₺260</strong></div>
<div><span>Yuzu Cooler</span><strong>₺260</strong></div>
<div><span>Coco Matcha</span><strong>₺330</strong></div>
<div><span>Hojicha Latte</span><strong>₺280</strong></div>
</div>
</section>
</div>
</div>
<section aria-label="Tatlılar, ekstralar ve alternatif sütler" class="coffee-extras-line">
<div><span><b>Tatlılar</b> · Kantin Rolls</span><strong>₺230</strong></div>
<div><span><b>Ekstralar</b> · Karamel · Vanilya · Beyaz Çikolata</span><strong>₺30</strong></div>
<div><span><b>Alternatif sütler</b> · Badem · Soya · Yulaf · Hindistan Cevizi</span><strong>₺40</strong></div>
</section>
</div>
</section>
<section class="alsancak-merch-section reveal" id="merch-drop">
<div class="merch-panel-shell" data-merch-parallax="">
<div aria-hidden="true" class="merch-doodle-stage">
<img alt="" class="merch-doodle merch-doodle-table" src="/assets/img/merch/doodles/table-friends.png"/>
<img alt="" class="merch-doodle merch-doodle-look" src="/assets/img/merch/doodles/looking-up.png"/>
<img alt="" class="merch-doodle merch-doodle-bar" src="/assets/img/merch/doodles/bar-friends.png"/>
<img alt="" class="merch-doodle merch-doodle-jump" src="/assets/img/merch/doodles/jumping.png"/>
<img alt="" class="merch-doodle merch-doodle-cats" src="/assets/img/merch/doodles/cats-table.png"/>
<img alt="" class="merch-doodle merch-doodle-share" src="/assets/img/merch/doodles/sharing-drink.png"/>
<img alt="" class="merch-doodle merch-doodle-highfive" src="/assets/img/merch/doodles/high-five.png"/>
<img alt="" class="merch-doodle merch-doodle-hug" src="/assets/img/merch/doodles/hugging.png"/>
<svg class="merch-motion-path merch-motion-path-one" focusable="false" viewbox="0 0 280 130">
<path d="M8 92C72 16 124 132 184 54C219 10 242 49 272 25"></path>
</svg>
<svg class="merch-motion-path merch-motion-path-two" focusable="false" viewbox="0 0 250 110">
<path d="M7 32C48 91 98 4 151 67C183 105 211 70 243 92"></path>
</svg>
<span class="merch-spark merch-spark-one">✦</span>
<span class="merch-spark merch-spark-two">✦</span>
<span class="merch-spark merch-spark-three">✦</span>
</div>
<div class="merch-panel-intro">
<div>
<p class="eyebrow">Sadece Alsancak şubesinde</p>
<h3>Karakteri giy.</h3>
<p>
                  Oversize tişört, tote çanta ve baseball şapkadan oluşan sınırlı seri.
                  Tişörtün arkasındaki karikatür dünyası, noktalı zemin üzerinde hareket ederek bu alanın tamamına yayılıyor.
                </p>
</div>
<div class="merch-only-note">Sadece Alsancak · mağaza içi satış</div>
</div>
<div class="merch-menu-layout">
<article class="merch-feature-card merch-feature-card-panel" data-merch-toggle="">
<div class="merch-feature-copy">
<p class="menu-kicker">Tişört detayı</p>
<h4>Ön yüzden arka hikâyeye.</h4>
<p>
                    Minimal ön yüzde küçük k. logosu var. Kart açıldığında ise arka taraftaki karikatür kompozisyonu ortaya çıkıyor.
                  </p>
<button aria-expanded="false" class="button button-primary merch-toggle-button" data-merch-trigger="" type="button">
                    Tasarımı aç <span aria-hidden="true">↗</span>
</button>
</div>
<div aria-label="Tişörtün arka tasarımını göster" aria-live="polite" aria-pressed="false" class="merch-flip-card" data-merch-photo-toggle="" role="button" tabindex="0">
<div class="merch-flip-inner" data-merch-flip="">
<figure class="merch-face merch-face-front">
<img alt="Ön yüzünde küçük mavi k. logosu olan oversize merch tişört." src="/assets/img/merch/tee-front.jpg"/>
<figcaption>
<span class="merch-face-label">Kapalı görünüm</span>
<strong>Ön yüz</strong>
</figcaption>
</figure>
<figure class="merch-face merch-face-back">
<img alt="Arka yüzünde mavi çizgi karakterlerden oluşan karikatür baskısı olan merch tişört." src="/assets/img/merch/tee-back.jpg"/>
<figcaption>
<span class="merch-face-label">Açılan görünüm</span>
<strong>Arka karikatür baskı</strong>
</figcaption>
</figure>
</div>
</div>
</article>
<aside class="merch-price-card">
<div class="merch-price-headline">
<p class="eyebrow">Ürün listesi</p>
<h4>Fiyatlar + detaylar</h4>
</div>
<div class="merch-price-list">
<article>
<div class="merch-price-line"><strong>01. Oversize Tişört</strong><span>₺690</span></div>
<p>500 GSM pamuk single jersey kumaş, rahat ve oversize kesim unisex tişört.</p>
<small>Beden: S–XL · Materyal: %100 Organik Pamuk</small>
</article>
<article>
<div class="merch-price-line"><strong>02. Tote Çanta</strong><span>₺440</span></div>
<p>Orta boy, iç cepli, sağlam saplı, çok amaçlı pamuk kanvas tote çanta.</p>
<small>Beden: Tek beden · Materyal: %100 Pamuk Kanvas</small>
</article>
<article>
<div class="merch-price-line"><strong>03. Baseball Şapka</strong><span>₺420</span></div>
<p>Önde nakışlı, arkada metal tokalı ayarlanabilir kayışa sahip ikonik Kantin. mavi baseball şapka.</p>
<small>Beden: Tek beden · Materyal: %100 Organik Pamuk</small>
</article>
<div class="merch-bundle-box">
<h5>Bundle fırsatları</h5>
<div><span>Full Set · Tişört + Çanta + Şapka</span><strong>₺1350</strong></div>
<div><span>2’li Kombin · Tişört + Çanta veya Tişört + Şapka</span><strong>₺990</strong></div>
</div>
</div>
</aside>
</div>
</div>
</section>
</div>
</section>
<section aria-labelledby="tab-atakent" class="branch-menu-panel atakent-menu-panel" data-menu-panel="atakent" hidden="" id="panel-atakent" role="tabpanel">
<div class="atakent-drinks">
<div class="container">
<header class="branch-menu-intro branch-menu-intro-light reveal">
<p class="menu-kicker">Atakent Bubbles + Drinks</p>
<h2><span class="title-nowrap">Kokteyl +</span><br/>fıçı<span>.</span></h2>
<p>
              Bubble ve house kokteyller yalnızca Atakent menüsündedir.
              Bira, şarap ve kokteyllerin ardından aşağıda Atakent mutfağı yer alır.
            </p>
</header>
<div class="menu-editorial-grid">
<section class="menu-editorial-block reveal">
<div class="menu-editorial-title"><h3>Fıçıdan</h3></div>
<p class="draft-beer-note draft-beer-note-light">Tüm fıçı biralar Mexican hazırlanabilir.</p>
<div class="menu-price-head"><span>Ürün</span><span>33 cl</span><span>50 cl</span></div>
<div class="menu-price-row"><strong>Becks</strong><span>₺160</span><span>₺250</span></div>
<div class="menu-price-row"><strong>Stella Artois</strong><span>₺180</span><span>₺260</span></div>
<div class="menu-price-row"><strong>Efes Pilsen</strong><span>₺150</span><span>₺230</span></div>
</section>
<section class="menu-editorial-block reveal reveal-delay-1">
<div class="menu-editorial-title"><h3>Bubble Kokteyller</h3></div>
<article class="editorial-item"><div><h4>Garden Fizz</h4><p>Malfy Originale, zencefil, limonotu ve tropical mate çayı.</p></div><strong>₺480</strong></article>
<article class="editorial-item"><div><h4>Banana Oolong</h4><p>Havana Club Añejo 3, Malibu ve muz.</p></div><strong>₺480</strong></article>
<article class="editorial-item"><div><h4>Cherry Paloma</h4><p>Olmeca, vişne, greyfurt ve saline.</p></div><strong>₺480</strong></article>
</section>
<section class="menu-editorial-block menu-editorial-wide reveal">
<div class="menu-editorial-title"><h3>House Kokteyller</h3></div>
<div class="cocktail-grid">
<article class="editorial-item"><div><h4>Greenhouse</h4><p>Absolut, kavun ve lime.</p></div><strong>₺520</strong></article>
<article class="editorial-item"><div><h4>Peach Leaf</h4><p>Malfy Originale, şeftali, fesleğen ve Lillet Rosé.</p></div><strong>₺520</strong></article>
<article class="editorial-item"><div><h4>Palo Santo</h4><p>Olmeca Altos, salatalık, bianco vermut ve mürver çiçeği.</p></div><strong>₺520</strong></article>
<article class="editorial-item"><div><h4>Fig + Tonka</h4><p>Jameson Black Barrel, incir, tonka ve mahlep.</p></div><strong>₺520</strong></article>
<article class="editorial-item"><div><h4>Coffee Vermouth</h4><p>Martini Fiero, kahve ve Ramazzotti.</p></div><strong>₺520</strong></article>
</div>
</section>
<section class="menu-editorial-block reveal">
<div class="menu-editorial-title"><h3>Şişe Biralar</h3></div>
<div class="bottle-grid">
<div class="compact-row"><span>Amsterdam <small>50 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Becks <small>33 cl</small></span><strong>₺240</strong></div>
<div class="compact-row"><span>Bomonti Filtresiz <small>50 cl</small></span><strong>₺260</strong></div>
<div class="compact-row"><span>Bud <small>33 cl</small></span><strong>₺250</strong></div>
<div class="compact-row"><span>Bud <small>50 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Corona <small>35,5 cl</small></span><strong>₺300</strong></div>
<div class="compact-row"><span>Duvel <small>33 cl</small></span><strong>₺320</strong></div>
<div class="compact-row"><span>Efes Pilsen <small>30 cl</small></span><strong>₺170</strong></div>
<div class="compact-row"><span>Efes Malt <small>50 cl</small></span><strong>₺250</strong></div>
<div class="compact-row"><span>Efes Glutensiz <small>50 cl</small></span><strong>₺270</strong></div>
<div class="compact-row"><span>Efes Özel Seri <small>50 cl</small></span><strong>₺250</strong></div>
<div class="compact-row"><span>Erdinger <small>33 cl</small></span><strong>₺320</strong></div>
<div class="compact-row"><span>Miller <small>33 cl</small></span><strong>₺270</strong></div>
<div class="compact-row"><span>Hoegaarden <small>33 cl</small></span><strong>₺320</strong></div>
</div>
</section>
<section class="menu-editorial-block reveal reveal-delay-1">
<div class="menu-editorial-title"><h3>Şaraplar</h3></div>
<div class="menu-price-head wine-head"><span>Şarap</span><span>Kadeh</span><span>Şişe</span></div>
<div class="menu-price-row"><strong>LA Smyrna <small>Beyaz · Kırmızı · Rosé</small></strong><span>₺450</span><span>₺2000</span></div>
<div class="menu-price-row"><strong>Cinzano Prosecco</strong><span>₺580</span><span>₺2600</span></div>
<div class="menu-price-row"><strong>LA Monreve <small>Beyaz · Kırmızı</small></strong><span>—</span><span>₺2400</span></div>
</section>
</div>
</div>
</div>
<div class="atakent-food dotted-paper">
<div class="container">
<header class="branch-menu-intro reveal">
<p class="menu-kicker">Atakent Aperitifs + Grill</p>
<h2>Ortaya söyle<span>.</span></h2>
<p>Izgara şişleri 17:00’dan itibaren servis edilir.</p>
</header>
<div class="food-menu-layout">
<section class="food-column reveal">
<div class="food-section-heading"><h3>Sıcaklar</h3></div>
<article class="food-item">
<div><h4>Patates Kızartması</h4><p>Cajun baharatlı, trüf mayonez ve acı-tatlı BBQ sos ile.</p><small>Alerjenler: Yumurta.</small></div>
<div class="food-price"><strong>₺230</strong><span>Trüflü +₺70</span></div>
</article>
<article class="food-item">
<div><h4>Tavuk Pane</h4><p>Baharatlı çıtır tavuk ve ev yapımı coleslaw.</p><small>Alerjenler: Gluten, yumurta, süt ürünleri.</small></div>
<div class="food-price"><strong>₺270</strong></div>
</article>
<article class="food-item">
<div><h4>İstiridye Mantarı</h4><p>Tempura istiridye mantarı ve toum sos.</p><small>Alerjenler: Gluten, yumurta.</small></div>
<div class="food-price"><strong>₺230</strong></div>
</article>
</section>
<section class="food-column reveal reveal-delay-1">
<div class="food-section-heading"><h3>Izgara Şişleri</h3><small>17:00’dan itibaren</small></div>
<article class="food-item">
<div><h4>İncik &amp; Mısır</h4><p>Soya ve pirinç sirkesi ile marine edilmiş kemiksiz tavuk but, mısır püresi ile.</p><small>Alerjenler: Soya, süt ürünleri.</small></div>
<div class="food-price"><strong>₺210</strong><span>/ adet</span></div>
</article>
<article class="food-item">
<div><h4>Karides &amp; Ananas</h4><p>Sarımsak, biberiye ve kekik ile ızgaralanmış karides; ananas ve narenciye sos ile.</p><small>Alerjenler: Kabuklu deniz ürünleri, süt ürünleri, sülfitler.</small></div>
<div class="food-price"><strong>₺240</strong><span>/ adet</span></div>
</article>
<article class="food-item">
<div><h4>Köfte &amp; Humus</h4><p>Pekmezli misket köfte, kestane mantarı ve ev yapımı humus.</p><small>Alerjenler: Gluten, yumurta, susam.</small></div>
<div class="food-price"><strong>₺210</strong><span>/ adet</span></div>
</article>
</section>
</div>
<section class="dessert-line reveal">
<div><p class="menu-kicker">Tatlı</p><h3>Çikolata Mousse</h3><p>Yoğun çikolatalı mousse.</p><small>Alerjenler: Süt ürünleri, yumurta.</small></div>
<strong>₺225</strong>
</section>
</div>
</div>
</section>
<section class="menu-truth-note">
<div class="container reveal">
<p>Menüde bir ürün görünüyorsa yalnızca seçili şube için geçerlidir.</p>
<a class="text-link" href="#main">Şube seçimine dön ↑</a>
</div>
</section>
`;
