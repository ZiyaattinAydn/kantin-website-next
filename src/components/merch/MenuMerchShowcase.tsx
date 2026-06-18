"use client";

import { useCallback, useEffect, useState } from "react";
import { merchDoodles } from "@/content/home";

const menuMerchProducts = [
  {
    index: "01",
    name: "Oversize Tişört",
    price: "₺690",
    description:
      "500 GSM pamuk single jersey kumaş, rahat ve oversize kesim unisex tişört.",
    detail: "Beden: S–XL · Materyal: %100 Organik Pamuk",
  },
  {
    index: "02",
    name: "Tote Çanta",
    price: "₺440",
    description:
      "Orta boy, iç cepli, sağlam saplı, çok amaçlı pamuk kanvas tote çanta.",
    detail: "Beden: Tek beden · Materyal: %100 Pamuk Kanvas",
  },
  {
    index: "03",
    name: "Baseball Şapka",
    price: "₺420",
    description:
      "Önde nakışlı, arkada metal tokalı ayarlanabilir kayışa sahip ikonik Kantin. mavi baseball şapka.",
    detail: "Beden: Tek beden · Materyal: %100 Organik Pamuk",
  },
] as const;

export default function MenuMerchShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <section className="alsancak-merch-section reveal" id="merch-drop">
      <div className="merch-panel-shell">
        <div aria-hidden="true" className="merch-doodle-stage">
          {merchDoodles.slice(0, 8).map((doodle) => (
            <img key={doodle.src} alt="" className={`merch-doodle ${doodle.className}`} src={doodle.src} />
          ))}
          <svg className="merch-motion-path merch-motion-path-one" focusable="false" viewBox="0 0 280 130">
            <path d="M8 92C72 16 124 132 184 54C219 10 242 49 272 25" />
          </svg>
          <svg className="merch-motion-path merch-motion-path-two" focusable="false" viewBox="0 0 250 110">
            <path d="M7 32C48 91 98 4 151 67C183 105 211 70 243 92" />
          </svg>
          <span className="merch-spark merch-spark-one">✦</span>
          <span className="merch-spark merch-spark-two">✦</span>
          <span className="merch-spark merch-spark-three">✦</span>
        </div>

        <div className="merch-panel-intro">
          <div>
            <p className="eyebrow">Sadece Alsancak şubesinde</p>
            <h3>Karakteri giy.</h3>
            <p>
              Oversize tişört, tote çanta ve baseball şapkadan oluşan sınırlı seri.
              Tişörtün arkasındaki karikatür dünyası, noktalı zemin üzerinde hareket ederek bu alanın tamamına yayılıyor.
            </p>
          </div>
          <div className="merch-only-note">Sadece Alsancak · mağaza içi satış</div>
        </div>

        <div className="merch-menu-layout">
          <article className={`merch-feature-card merch-feature-card-panel${isOpen ? " is-open" : ""}`}>
            <div className="merch-feature-copy">
              <p className="menu-kicker">Tişört detayı</p>
              <h4>Ön yüzden arka hikâyeye.</h4>
              <p>Minimal ön yüzde küçük k. logosu var. Kart açıldığında ise arka taraftaki karikatür kompozisyonu ortaya çıkıyor.</p>
              <button aria-expanded={isOpen} className="button button-primary merch-toggle-button" onClick={toggle} type="button">
                {isOpen ? "Ön yüze dön" : "Tasarımı aç"} <span aria-hidden="true">{isOpen ? "↺" : "↗"}</span>
              </button>
            </div>

            <div
              aria-label={isOpen ? "Tişörtün ön yüzünü göster" : "Tişörtün arka tasarımını göster"}
              aria-pressed={isOpen}
              className="merch-flip-card"
              onClick={toggle}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggle();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="merch-flip-inner">
                <figure className="merch-face merch-face-front">
                  <img alt="Ön yüzünde küçük mavi k. logosu olan oversize merch tişört." src="/assets/img/merch/tee-front.jpg" />
                  <figcaption><span className="merch-face-label">Kapalı görünüm</span><strong>Ön yüz</strong></figcaption>
                </figure>
                <figure className="merch-face merch-face-back">
                  <img alt="Arka yüzünde mavi çizgi karakterlerden oluşan karikatür baskısı olan merch tişört." src="/assets/img/merch/tee-back.jpg" />
                  <figcaption><span className="merch-face-label">Açılan görünüm</span><strong>Arka karikatür baskı</strong></figcaption>
                </figure>
              </div>
            </div>
          </article>

          <aside className="merch-price-card">
            <div className="merch-price-headline"><p className="eyebrow">Ürün listesi</p><h4>Fiyatlar + detaylar</h4></div>
            <div className="merch-price-list">
              {menuMerchProducts.map((product) => (
                <article key={product.name}>
                  <div className="merch-price-line"><strong>{product.index}. {product.name}</strong><span>{product.price}</span></div>
                  <p>{product.description}</p><small>{product.detail}</small>
                </article>
              ))}
              <div className="merch-bundle-box">
                <h5>Bundle fırsatları</h5>
                <div><span>Full Set · Tişört + Çanta + Şapka</span><strong>₺1350</strong></div>
                <div><span>2’li Kombin · Tişört + Çanta veya Tişört + Şapka</span><strong>₺990</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
