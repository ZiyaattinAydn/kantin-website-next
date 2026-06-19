"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { MemoryPhoto } from "@/data/memories";
import styles from "./MemoryPhotoLightbox.module.css";

type MemoryPhotoLightboxProps = {
  photo: MemoryPhoto | null;
  trigger: HTMLElement | null;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function MemoryPhotoLightbox({
  photo,
  trigger,
  onClose,
}: MemoryPhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!photo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose, photo, trigger]);

  if (!photo || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <button
          ref={closeRef}
          aria-label="Fotoğrafı kapat"
          className={styles.close}
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className={styles.media}>
          <div className={styles.imageWrap}>
            <Image
              fill
              alt={photo.alt}
              sizes="(max-width: 760px) 100vw, 68vw"
              src={photo.src}
              quality={94}
            />
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>Anılarımız · {photo.label}</p>
          <h2 id={titleId}>{photo.caption}</h2>
          <p id={descriptionId} className={styles.description}>
            {photo.alt}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
