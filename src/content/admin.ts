export const adminMarkup = String.raw`
<section class="container admin-setup" data-admin-setup="" hidden="">
<p class="eyebrow">Firebase henüz bağlı değil</p>
<h1>Yönetici panelini<br/>iki şekilde kullanabilirsin.</h1>
<div class="admin-option-grid">
<article>
<span>01</span>
<h2>Demo modu</h2>
<p>Etkinlikler yalnızca bu tarayıcıda saklanır. Tasarımı ve akışı denemek içindir.</p>
<button class="button button-primary" data-demo-start="" type="button">Demo panelini aç</button>
</article>
<article>
<span>02</span>
<h2>Canlı kullanım</h2>
<p>Firebase Authentication ve Firestore kurulduğunda eklenen etkinlikler tüm ziyaretçilere görünür.</p>
<a class="button button-ghost" href="/README.md">Kurulum adımlarını oku</a>
</article>
</div>
</section>
<section class="container admin-login" data-admin-login="" hidden="">
<div class="admin-login-card">
<p class="eyebrow">Yetkili girişi</p>
<h1>Etkinlik paneli<span>.</span></h1>
<form data-login-form="">
<label>E-posta<input autocomplete="username" name="email" required="" type="email"/></label>
<label>Şifre<input autocomplete="current-password" name="password" required="" type="password"/></label>
<button class="button button-primary" type="submit">Giriş yap</button>
<p class="form-message" data-login-message=""></p>
</form>
</div>
</section>
<section class="container admin-dashboard" data-admin-dashboard="" hidden="">
<div class="admin-dashboard-head">
<div>
<p class="eyebrow">Etkinlik yönetimi</p>
<h1>Takvimi güncelle<span>.</span></h1>
</div>
<button class="button button-primary" data-new-event="" type="button">Yeni etkinlik</button>
</div>
<div class="admin-layout">
<aside class="admin-event-list-panel">
<div class="admin-panel-title">
<h2>Etkinlikler</h2>
<span data-event-count="">0 kayıt</span>
</div>
<div class="admin-event-list" data-admin-event-list="">
<p class="admin-list-empty">Henüz etkinlik eklenmedi.</p>
</div>
</aside>
<section class="admin-form-panel">
<div class="admin-panel-title">
<h2 data-form-title="">Yeni etkinlik</h2>
<button class="admin-text-button danger" data-delete-event="" hidden="" type="button">Sil</button>
</div>
<form class="event-admin-form" data-event-form="">
<input name="id" type="hidden"/>
<label>
              Etkinlik adı
              <input maxlength="100" name="title" placeholder="Örn. Backyard Session" required="" type="text"/>
</label>
<label>
              Kısa açıklama
              <textarea maxlength="400" name="description" placeholder="Etkinlikte ne olacak?" required="" rows="4"></textarea>
</label>
<div class="admin-form-grid">
<label>
                Başlangıç
                <input name="startAt" required="" type="datetime-local"/>
</label>
<label>
                Bitiş
                <input name="endAt" required="" type="datetime-local"/>
</label>
</div>
<div class="admin-form-grid">
<label>
                Şube
                <select name="branch" required="">
<option value="alsancak">Alsancak</option>
<option value="atakent">Atakent</option>
<option value="both">İki şube</option>
</select>
</label>
<label>
                Durum
                <select name="status" required="">
<option value="draft">Taslak</option>
<option value="published">Yayında</option>
</select>
</label>
</div>
<label>
              Konum metni
              <input maxlength="160" name="location" placeholder="Boş bırakılırsa şube adresi kullanılır" type="text"/>
</label>
<label>
              Bilet / kayıt bağlantısı
              <input name="link" placeholder="https://..." type="url"/>
</label>
<label>
              Görsel bağlantısı
              <input name="imageUrl" placeholder="https://..." type="url"/>
</label>
<div class="admin-form-actions">
<button class="button button-primary" type="submit">Kaydet</button>
<button class="button button-ghost" data-form-reset="" type="button">Temizle</button>
</div>
<p class="form-message" data-form-message=""></p>
</form>
</section>
</div>
</section>
`;
