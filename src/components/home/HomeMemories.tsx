"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { memoriesSection, memoryPhotos, type MemoryPhoto } from "@/data/memories";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import MemoryPhotoLightbox from "./MemoryPhotoLightbox";
import styles from "./HomeMemories.module.css";

type ActiveMemory = {
  photo: MemoryPhoto;
  trigger: HTMLElement;
} | null;

export default function HomeMemories() {
  const [activeMemory, setActiveMemory] = useState<ActiveMemory>(null);
  const closeLightbox = useCallback(() => setActiveMemory(null), []);

  const openLightbox = (
    photo: MemoryPhoto,
    trigger: HTMLElement,
  ) => setActiveMemory({ photo, trigger });

  return (
    <section className={`section dotted-paper ${styles.section}`} id="anilarimiz">
      <AmbientDoodles className="home-memories-doodles" preset="memories" />
      <AmbientDoodles className="home-memories-doodles-secondary" preset="memories" />

      <div className={`container ${styles.container}`}>
        <header className={`${styles.header} reveal`}>
          <div>
            <p className="eyebrow">{memoriesSection.eyebrow}</p>
            <h2>{memoriesSection.title}<span>.</span></h2>
          </div>
          <p className={styles.introduction}>{memoriesSection.introduction}</p>
        </header>

        <div className={styles.storyGrid}>
          <figure className={`${styles.statementPhoto} reveal`}>
            <button
              aria-label={`${memoryPhotos[0].caption} fotoğrafını büyüt`}
              className={styles.photoButton}
              onClick={(event) => openLightbox(memoryPhotos[0], event.currentTarget)}
              type="button"
            >
              <Image
                fill
                priority={false}
                sizes="(max-width: 900px) 100vw, 58vw"
                src={memoryPhotos[0].src}
                alt={memoryPhotos[0].alt}
                quality={92}
              />
              <span className={styles.zoomHint} aria-hidden="true">Büyüt ↗</span>
            </button>
            <figcaption>
              <span>{memoryPhotos[0].label}</span>
              <strong>{memoryPhotos[0].caption}</strong>
            </figcaption>
          </figure>

          <aside className={`${styles.statementCard} reveal reveal-delay-1`}>
            <span className={styles.statementMark}>“</span>
            <blockquote>{memoriesSection.statement}</blockquote>
            <p>{memoriesSection.closingLine}</p>
          </aside>
        </div>

        <div className={styles.chapters}>
          {memoriesSection.chapters.map((chapter, index) => (
            <article
              key={chapter.title}
              className={`${styles.chapter} reveal${index ? " reveal-delay-1" : ""}`}
            >
              <span>{chapter.label}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.gallery} aria-label="Kantin’den anılar fotoğraf galerisi">
          {memoryPhotos.slice(1).map((photo, index) => (
            <figure
              key={photo.src}
              className={`${styles.photoCard} ${styles[photo.layout]} reveal${
                index % 3 === 1 ? " reveal-delay-1" : index % 3 === 2 ? " reveal-delay-2" : ""
              }`}
            >
              <button
                aria-label={`${photo.caption} fotoğrafını büyüt`}
                className={styles.photoButton}
                onClick={(event) => openLightbox(photo, event.currentTarget)}
                type="button"
              >
                <Image
                  fill
                  sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw"
                  src={photo.src}
                  alt={photo.alt}
                  quality={92}
                />
                <span className={styles.zoomHint} aria-hidden="true">Büyüt ↗</span>
              </button>
              <figcaption>
                <span>{photo.label}</span>
                <strong>{photo.caption}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <MemoryPhotoLightbox
        photo={activeMemory?.photo ?? null}
        trigger={activeMemory?.trigger ?? null}
        onClose={closeLightbox}
      />
    </section>
  );
}
