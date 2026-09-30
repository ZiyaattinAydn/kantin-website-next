"use client";
import { loadMediaChoicePage } from "@/lib/admin/media-choice-actions";
import Image from "next/image";
import { useState, useTransition } from "react";
import Link from "next/link";
import type { MediaChoice } from "@/lib/admin/media-choices";
import { safeImageUrl } from "@/lib/events";
import styles from "./SimpleAdmin.module.css";
export default function ContentImagePicker({
  media,
  original,
  value,
  label,
  onChange,
}: {
  media: MediaChoice[];
  original: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const [loadedChoices, setChoices] = useState<MediaChoice[]>([]);
  const choices = [...media, ...loadedChoices].filter(
    (m, i, all) => all.findIndex((other) => other.id === m.id) === i,
  );
  const [page, setPage] = useState(0),
    [hasMore, setHasMore] = useState(true),
    [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function load(nextPage: number, term = search) {
    start(async () => {
      const r = await loadMediaChoicePage(nextPage, term);
      if (!r.ok) {
        setMessage(r.message);
        return;
      }
      setMessage("");
      setPage(nextPage);
      setHasMore(r.media.length === 24);
      setChoices((prev) => (nextPage ? [...prev, ...r.media] : r.media));
    });
  }
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const url = (value: string) =>
    value.startsWith("media:")
      ? (choices.find((m) => m.id === value.slice(6))?.url ?? null)
      : safeImageUrl(value);
  const name = (value: string) =>
    choices.find((m) => m.url === value || `media:${m.id}` === value)?.label ||
    value.split("/").at(-1)?.split("?")[0] ||
    "Görsel yok";
  return (
    <div className={styles.imagePicker}>
      <input type="hidden" name={`image-${label}`} value={value} />
      <small>Kullanıldığı alan: {label}</small>
      <div className={styles.grid}>
        <figure>
          <strong>Mevcut görsel</strong>
          {url(original) ? (
            <Image
              unoptimized
              src={url(original)!}
              alt="Mevcut görsel"
              width={220}
              height={150}
            />
          ) : (
            <p>Görsel yok</p>
          )}
          <figcaption>{name(original)}</figcaption>
        </figure>
        {value !== original ? (
          <figure>
            <strong>
              {value ? "Yeni seçilen görsel ✓" : "Görsel kaldırılacak"}
            </strong>
            {url(value) ? (
              <Image
                unoptimized
                src={url(value)!}
                alt="Yeni seçilen görsel"
                width={220}
                height={150}
              />
            ) : null}
            <figcaption>{name(value)}</figcaption>
          </figure>
        ) : null}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            if (!open && !choices.length) load(0);
          }}
          aria-expanded={open}
        >
          Görsel değiştir
        </button>
        <button type="button" onClick={() => onChange("")}>
          Görseli kaldır
        </button>
        {value !== original ? (
          <button type="button" onClick={() => onChange(original)}>
            Seçimi geri al
          </button>
        ) : null}
        <Link href="/admin/media" target="_blank">
          Görsel yükle
        </Link>
      </div>
      {open ? (
        <div>
          <input
            type="search"
            aria-label="Görsel ara"
            placeholder="Görsel ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" disabled={pending} onClick={() => load(0)}>
            Ara
          </button>
          {message ? <p role="alert">{message}</p> : null}
          {pending ? <p role="status">Görseller yükleniyor…</p> : null}
          <div className={styles.media}>
            {choices
              .filter((m) =>
                m.label
                  .toLocaleLowerCase("tr")
                  .includes(search.toLocaleLowerCase("tr")),
              )
              .map((m) => (
                <button
                  type="button"
                  key={m.id}
                  aria-pressed={value === `media:${m.id}`}
                  onClick={() => {
                    onChange(`media:${m.id}`);
                    setOpen(false);
                  }}
                >
                  <Image
                    unoptimized
                    src={m.url}
                    alt=""
                    loading="lazy"
                    width={160}
                    height={120}
                  />
                  <span>{m.label}</span>
                </button>
              ))}
          </div>
          {hasMore ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => load(page + 1)}
            >
              Daha fazla görsel
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
