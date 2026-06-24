"use client";

import { useCallback, useEffect, useState } from "react";
import MerchCard from "@/components/cards/MerchCard";
import DoodleParallaxStage from "@/components/effects/DoodleParallaxStage";
import MerchImageLightbox from "@/components/merch/MerchImageLightbox";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";
import type { MerchBundle, MerchDoodle, MerchProductContent } from "@/types/content";
import { formatTry } from "@/lib/formatters";

export default function MenuMerchShowcase({
  products = fallbackHomeData.merchProducts,
  bundles = fallbackHomeData.merchBundles,
  doodles = fallbackHomeData.merchDoodles,
}: {
  products?: MerchProductContent[];
  bundles?: MerchBundle[];
  doodles?: MerchDoodle[];
}) {
  const merchBundleOffers = bundles.filter((bundle) => !bundle.name.startsWith("Oversize Tişört"));
  const shirt = products.find((product) => product.id === "oversize-tshirt");
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<{
    product: MerchProductContent;
    trigger: HTMLButtonElement;
  } | null>(null);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);
  const openPreview = useCallback(
    (product: MerchProductContent, trigger: HTMLButtonElement) => {
      setPreview({ product, trigger });
    },
    [],
  );
  const closePreview = useCallback(() => setPreview(null), []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <section className="alsancak-merch-section reveal" id="merch-drop">
      <div className="merch-panel-shell">
        <DoodleParallaxStage className="merch-doodle-stage">
          {doodles.slice(0, 8).map((doodle) => (
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
        </DoodleParallaxStage>

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
                  {shirt?.image ? (
                    <img alt={shirt.imageAlt || "Oversize tişörtün ön yüzü."} src={shirt.image} />
                  ) : (
                    <div className="merch-face-empty" role="img" aria-label="Ön yüz görseli henüz yayınlanmadı.">
                      Görsel hazırlanıyor
                    </div>
                  )}
                  <figcaption><span className="merch-face-label">Kapalı görünüm</span><strong>Ön yüz</strong></figcaption>
                </figure>
                <figure className="merch-face merch-face-back">
                  {shirt?.backImage ? (
                    <img alt={shirt.backImageAlt || "Oversize tişörtün arka yüzü."} src={shirt.backImage} />
                  ) : (
                    <div className="merch-face-empty" role="img" aria-label="Arka yüz görseli henüz yayınlanmadı.">
                      Görsel hazırlanıyor
                    </div>
                  )}
                  <figcaption><span className="merch-face-label">Açılan görünüm</span><strong>Arka karikatür baskı</strong></figcaption>
                </figure>
              </div>
            </div>
          </article>

          <aside className="merch-price-card">
            <div className="merch-price-headline"><p className="eyebrow">Ürün listesi</p><h4>Fiyatlar + detaylar</h4></div>
            <div className="merch-price-list">
              {products.map((product) => (
                <MerchCard
                  key={product.id}
                  onPreview={product.id === "oversize-tshirt" ? undefined : openPreview}
                  product={product}
                  variant="detail"
                />
              ))}
              <div className="merch-bundle-box">
                <h5>Bundle fırsatları</h5>
                {merchBundleOffers.map((bundle) => (
                  <div key={bundle.name}>
                    <span>{bundle.name}</span>
                    <strong>{formatTry(bundle.price)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      </section>

      <MerchImageLightbox
        onClose={closePreview}
        product={preview?.product ?? null}
        trigger={preview?.trigger ?? null}
      />
    </>
  );
}
