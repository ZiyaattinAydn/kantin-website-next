export const eventsMarkup = String.raw`
<section class="page-hero page-hero-events dotted-paper">
<div class="container page-hero-grid">
<div class="reveal">
<p class="eyebrow">Her hafta etkinlik varmış gibi davranmıyoruz</p>
<h1>Etkinlikler<span>.</span></h1>
<p>
            Takvim yalnızca gerçekten planlanan bir etkinlik yayınlandığında dolar.
            Tarih, saat ve şube bilgisi yönetici panelinden eklenir.
          </p>
</div>
<div aria-hidden="true" class="page-hero-mark reveal reveal-delay-1">
<span>LIVE—WHEN LIVE</span>
<svg viewbox="0 0 320 270">
<rect height="178" rx="18" width="232" x="44" y="52"></rect>
<path d="M44 100h232M96 34v36M224 34v36M91 136h30M145 136h30M199 136h30M91 178h30M145 178h30M199 178h30"></path>
</svg>
</div>
</div>
</section>
<section class="section events-page">
<div class="container">
<div aria-label="Etkinlikleri şubeye göre filtrele" class="filter-bar reveal">
<button aria-pressed="true" class="filter-button active" data-event-filter="all" type="button">Tümü</button>
<button aria-pressed="false" class="filter-button" data-event-filter="alsancak" type="button">Alsancak</button>
<button aria-pressed="false" class="filter-button" data-event-filter="atakent" type="button">Atakent</button>
</div>
<div aria-live="polite" class="event-list dynamic-events-list" data-events-list="">
<article class="events-zero-state">
<div class="events-zero-mark">00</div>
<div>
<p class="eyebrow">Şu an yayınlanmış etkinlik yok</p>
<h2>Takvim sakin.<br/>Bu da gayet normal.</h2>
<p>Yeni bir etkinlik eklendiğinde tarih, saat ve şube bilgisi burada görünecek.</p>
</div>
<a class="button button-primary" href="https://www.instagram.com/kantinizmir/" rel="noopener" target="_blank">Instagram’ı takip et ↗</a>
</article>
</div>
<p class="empty-state" data-event-empty="" hidden="">Bu şube için yayınlanmış etkinlik bulunmuyor.</p>
</div>
</section>
`;
