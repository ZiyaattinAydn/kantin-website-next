"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { merchBundles, merchDoodles, merchProducts } from "@/content/home";

export default function HomeMerchDrop() {
  const [isOpen, setIsOpen] = useState(false);
  const doodleStageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const toggleDesign = () => setIsOpen((current) => !current);

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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 900) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = doodleStageRef.current;
    if (!stage) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      stage.style.setProperty("--parallax-x", `${(-normalizedX * 12).toFixed(1)}px`);
      stage.style.setProperty("--parallax-y", `${(-normalizedY * 9).toFixed(1)}px`);
    });
  };

  const resetParallax = () => {
    const stage = doodleStageRef.current;
    if (!stage) return;
    stage.style.setProperty("--parallax-x", "0px");
    stage.style.setProperty("--parallax-y", "0px");
  };

  return (
    <section className="section merch-drop-section home-merch-cartoon" id="merch-drop">
      <div
        className="merch-panel-shell home-merch-panel reveal"
        onPointerLeave={resetParallax}
        onPointerMove={handlePointerMove}
      >
        <div
          ref={doodleStageRef}
          aria-hidden="true"
          className="merch-doodle-stage home-merch-doodles"
        >
          {merchDoodles.map((doodle) => (
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
        </div>

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
                    <img
                      alt="Ön yüzünde küçük mavi k. logosu bulunan krem oversize tişört."
                      src="/assets/img/merch/tee-front.jpg"
                    />
                    <figcaption>
                      <span className="merch-face-label">Kapalı görünüm</span>
                      <strong>Oversize Tişört · ön yüz</strong>
                    </figcaption>
                  </figure>
                  <figure className="merch-face merch-face-back">
                    <img
                      alt="Arka yüzünde mavi karikatür baskısı bulunan krem oversize tişört."
                      src="/assets/img/merch/tee-back.jpg"
                    />
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
                  {merchProducts.map((product) => (
                    <article key={product.name} className="home-merch-product">
                      <img alt={product.imageAlt} src={product.image} />
                      <div>
                        <div className="home-merch-product-title">
                          <h4>{product.name}</h4>
                          <strong>{product.price}</strong>
                        </div>
                        <p>{product.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </article>

              <article className="home-merch-bundles">
                <p className="home-merch-card-kicker">Bundle fırsatları</p>
                <h3>Birlikte alınca daha iyi.</h3>
                <div className="home-merch-bundle-lines">
                  {merchBundles.map((bundle) => (
                    <div key={bundle.name}>
                      <span>{bundle.name}</span>
                      <strong>{bundle.price}</strong>
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
  );
}
