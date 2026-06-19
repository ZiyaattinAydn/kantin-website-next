"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type UIEvent } from "react";
import { instagramPosts } from "@/data/instagram";
import { siteIdentity } from "@/data/site";
import styles from "./HomeInstagramStrip.module.css";

function prefersReducedMotion() {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export default function HomeInstagramStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToPost = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-instagram-card]"),
    );
    const target = cards[index];
    if (!target) return;

    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setActiveIndex(index);
  }, []);

  const move = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      instagramPosts.length - 1,
      Math.max(0, activeIndex + direction),
    );
    scrollToPost(nextIndex);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-instagram-card]"),
    );
    if (!cards.length) return;

    const currentLeft = track.scrollLeft;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - track.offsetLeft - currentLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndex) setActiveIndex(nearestIndex);
  };

  return (
    <section className={`${styles.shell} reveal`} aria-labelledby="instagram-strip-title">
      <div className={styles.header}>
        <div>
          <p className="eyebrow">Güncel saatler ve duyurular</p>
          <h3 id="instagram-strip-title">@kantinizmir</h3>
          <p className={styles.description}>Son beş gönderi, Kantin’den son kareler.</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.controls} aria-label="Instagram gönderileri kontrolleri">
            <button
              aria-label="Önceki Instagram gönderisi"
              disabled={activeIndex === 0}
              onClick={() => move(-1)}
              type="button"
            >
              ←
            </button>
            <button
              aria-label="Sonraki Instagram gönderisi"
              disabled={activeIndex === instagramPosts.length - 1}
              onClick={() => move(1)}
              type="button"
            >
              →
            </button>
          </div>

          <a
            className={styles.instagramButton}
            href={siteIdentity.instagramUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Instagram’a git <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div
        ref={trackRef}
        className={styles.track}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="Kantin Instagram gönderileri"
      >
        {instagramPosts.map((post, index) => (
          <article
            key={post.id}
            className={styles.card}
            data-instagram-card
            aria-label={`${index + 1}. gönderi: ${post.caption}`}
          >
            <a href={post.permalink} target="_blank" rel="noopener noreferrer">
              <div className={styles.media}>
                <Image
                  fill
                  alt={post.imageAlt}
                  src={post.image}
                  sizes="(max-width: 620px) 82vw, (max-width: 980px) 42vw, 300px"
                  quality={90}
                />
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className={styles.copy}>
                <span>{post.branch} · {post.publishedAt}</span>
                <strong>{post.caption}</strong>
                <small>Gönderiyi aç ↗</small>
              </div>
            </a>
          </article>
        ))}
      </div>

    </section>
  );
}
