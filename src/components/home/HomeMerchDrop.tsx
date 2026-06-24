"use client";

import Link from "next/link";
import MerchCard from "@/components/cards/MerchCard";
import DoodleParallaxStage from "@/components/effects/DoodleParallaxStage";
import MerchImageLightbox from "@/components/merch/MerchImageLightbox";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";
import type { MerchBundle, MerchDoodle } from "@/types/content";
import { formatTry } from "@/lib/formatters";
import type { MerchProductContent } from "@/types/content";

export default function HomeMerchDrop({
  products = fallbackHomeData.merchProducts,
  bundles = fallbackHomeData.merchBundles,
  doodles = fallbackHomeData.merchDoodles,
}: {
  products?: MerchProductContent[];
  bundles?: MerchBundle[];
  doodles?: MerchDoodle[];
}) {
  const merchSideProducts = products.filter((product) => product.id !== "oversize-tshirt");
  const shirt = products.find((product) => product.id === "oversize-tshirt");
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<{
    product: MerchProductContent;
    trigger: HTMLButtonElement;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleDesign = () => setIsOpen((current) => !current);
  const openPreview = useCallback(
    (product: MerchProductContent, trigger: HTMLButtonElement) => {
      setPreview({ product, trigger });
    },
    [],
  );
  const closePreview = useCallback(() => setPreview(null), []);

  const handlePhotoKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleDesign();
  };

  const handleStoryKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !isOpen) return;
    event.preventDefault();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  if (!products.length && !bundles.length) return null;

  return (
    <>
      <section className="section merch-drop-section home-merch-cartoon" id="merch-drop">
      <div className="merch-panel-shell home-merch-panel reveal">
        <DoodleParallaxStage className="merch-doodle-stage home-merch-doodles">
          {doodles.map((doodle) => (
            <img
              key={doodle.src}
              alt=""
              className={`merch-doodle ${doodle.className}`}
              src={doodle.src}
            />
          ))}

          <svg
            className="merch-motion-path merch-motion-path-one"
            focusable="false"
            viewBox="0 0 280 130"
          >
            <path d="M8 92C72 16 124 132 184 54C219 10 242 49 272 25" />
          </svg>
          <svg
            className="merch-motion-path merch-motion-path-two"
            focusable="false"
            viewBox="0 0 250 110"
          >
            <path d="M7 32C48 91 98 4 151 67C183 105 211 70 243 92" />
          </svg>
          <span className="merch-spark merch-spark-one">✦</span>
          <span className="merch-spark merch-spark-two">✦</span>
          <span className="merch-spark merch-spark-three">✦</span>
        </DoodleParallaxStage>

        <div className="container home-merch-content home-merch-v12">
          <header className="home-merch-header">
            <div>
              <p className="home-merch-eyebrow">Sadece Alsancak şubesinde</p>
              <h2>Merch Drop.</h2>
            </div>
            <span className="home-merch-stock">2025 · sınırlı stok</span>
          </header>

          <div className="home-merch-grid">
            <article
              className={`home-merch-story${isOpen ? " is-open" : ""}`}
              onKeyDown={handleStoryKeyDown}
            >
              <div className="home-merch-story-copy">
                <p className="home-merch-card-kicker">Kantin. giyilebilir hali</p>
                <h3>
                  Önde sade,
                  <br />
                  arkada karakterli.
                </h3>
                <p className="home-merch-description">
                  Oversize tişörtün arkasındaki karikatür serisini tasarımın merkezine aldık.
                  Kart ilk bakışta ön yüzü gösterir; üzerine geldiğinde ya da dokunduğunda arka
                  baskı açılır.
                </p>
                <ul className="home-merch-list">
                  <li>Oversize tişört · tote çanta · baseball şapka</li>
                  <li>Yalnızca Alsancak şubesinde mağaza içi satış</li>
                  <li>Full set ve 2’li kombin avantajı</li>
                </ul>
                <button
                  ref={triggerRef}
                  aria-expanded={isOpen}
                  className="button button-primary merch-toggle-button home-merch-open"
                  onClick={toggleDesign}
                  type="button"
                >
                  {isOpen ? (
                    <>
                      Ön yüze dön <span aria-hidden="true">↺</span>
                    </>
                  ) : (
                    <>
                      Tasarımı aç <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>
              </div>

              <div
                aria-label={isOpen ? "Tişörtün ön yüzünü göster" : "Tişörtün arka tasarımını göster"}
                aria-live="polite"
                aria-pressed={isOpen}
                className="merch-flip-card home-merch-shirt"
                onClick={toggleDesign}
                onKeyDown={handlePhotoKeyDown}
                role="button"
                tabIndex={0}
              >
                <div className="merch-flip-inner">
                  <figure className="merch-face merch-face-front">
                    {shirt?.image ? (
                      <img
                        alt={shirt.imageAlt || "Oversize tişörtün ön yüzü."}
                        src={shirt.image}
                      />
                    ) : (
                      <div className="merch-face-empty" role="img" aria-label="Ön yüz görseli henüz yayınlanmadı.">
                        Görsel hazırlanıyor
                      </div>
                    )}
                    <figcaption>
                      <span className="merch-face-label">Kapalı görünüm</span>
                      <strong>Oversize Tişört · ön yüz</strong>
                    </figcaption>
                  </figure>
                  <figure className="merch-face merch-face-back">
                    {shirt?.backImage ? (
                      <img
                        alt={shirt.backImageAlt || "Oversize tişörtün arka yüzü."}
                        src={shirt.backImage}
                      />
                    ) : (
                      <div className="merch-face-empty" role="img" aria-label="Arka yüz görseli henüz yayınlanmadı.">
                        Görsel hazırlanıyor
                      </div>
                    )}
                    <figcaption>
                      <span className="merch-face-label">Açılan görünüm</span>
                      <strong>Karikatür baskı · arka yüz</strong>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </article>

            <div className="home-merch-side">
              <article className="home-merch-products">
                <div className="home-merch-products-heading">
                  <p className="home-merch-card-kicker home-merch-card-kicker-blue">Ürünler</p>
                  <h3>Üç parçalık drop.</h3>
                </div>

                <div className="home-merch-product-list">
                  {merchSideProducts.map((product) => (
                    <MerchCard
                      key={product.id}
                      onPreview={openPreview}
                      product={product}
                      variant="visual"
                    />
                  ))}
                </div>
              </article>

              <article className="home-merch-bundles">
                <p className="home-merch-card-kicker">Bundle fırsatları</p>
                <h3>Birlikte alınca daha iyi.</h3>
                <div className="home-merch-bundle-lines">
                  {bundles.map((bundle) => (
                    <div key={bundle.name}>
                      <span>{bundle.name}</span>
                      <strong>{formatTry(bundle.price)}</strong>
                    </div>
                  ))}
                </div>
                <Link className="home-merch-more" href="/menu?sube=alsancak#merch-drop">
                  Tüm detayları gör <span aria-hidden="true">↗</span>
                </Link>
              </article>
            </div>
          </div>
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
