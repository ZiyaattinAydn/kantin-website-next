"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./AdminOnboarding.module.css";

const steps = [
  {
    title: "Menü ve fiyatlar",
    description: "Ürün ekleyin, fiyatları değiştirin ve şube görünürlüğünü yönetin.",
    href: "/admin/menu",
    action: "Menüyü aç",
  },
  {
    title: "Görseller",
    description: "Yeni görsel yükleyin, mevcut görselleri değiştirin ve kullanım yerlerini bulun.",
    href: "/admin/media",
    action: "Görsellere git",
  },
  {
    title: "Site içeriği",
    description: "Ana sayfa, şubeler, Instagram ve footer metinlerini düzenleyin.",
    href: "/admin/site",
    action: "Site içeriğini aç",
  },
  {
    title: "Etkinlikler",
    description: "Etkinlik veya duyuru ekleyin, yayından kaldırın ya da tarihini değiştirin.",
    href: "/admin/manage/events",
    action: "Etkinlikleri aç",
  },
];

export default function AdminOnboarding({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href]',
        ) ?? [],
      );

    focusable()[0]?.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        aria-label={compact ? "Panel turunu aç" : undefined}
        className={`${styles.trigger}${compact ? ` ${styles.triggerCompact}` : ""}${
          light ? ` ${styles.triggerLight}` : ""
        }`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span aria-hidden="true">?</span>
        {compact ? <span className={styles.srOnly}>Panel turu</span> : "Panel turu"}
      </button>

      {open
        ? createPortal(
            <div className={styles.layer}>
              <button
                aria-label="Panel turunu kapat"
                className={styles.backdrop}
                onClick={() => setOpen(false)}
                type="button"
              />

              <div
                aria-labelledby="admin-onboarding-title"
                aria-modal="true"
                className={styles.dialog}
                ref={dialogRef}
                role="dialog"
              >
                <div className={styles.head}>
                  <div>
                    <p>Hızlı yardım</p>
                    <h2 id="admin-onboarding-title">Paneli 1 dakikada tanı.</h2>
                  </div>
                  <button
                    aria-label="Panel turunu kapat"
                    className={styles.close}
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    ×
                  </button>
                </div>

                <p className={styles.intro}>
                  En sık yapılan işlemler burada. İhtiyacın olan bölümü seçip
                  doğrudan yönetmeye başlayabilirsin.
                </p>

                <div className={styles.steps}>
                  {steps.map((step, index) => (
                    <article className={styles.step} key={step.href}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                        <Link href={step.href} onClick={() => setOpen(false)}>
                          {step.action} →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <div className={styles.tip}>
                  <strong>İpucu</strong>
                  <p>
                    Sol menüde ne aradığını bulamazsan üstteki “Panelde ara”
                    alanına yapmak istediğin işlemi yaz.
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
