"use client";
import { useState } from "react";
import Link from "next/link";
import type { MediaChoice } from "@/lib/admin/media-choices";
import styles from "./SimpleAdmin.module.css";
export default function MediaPicker({
  choices,
  value,
  onChange,
}: {
  choices: MediaChoice[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = choices.find((m) => m.id === value);
  return (
    <div>
      <input type="hidden" name="selected_image" value={value} />
      <p>
        {selected ? `Seçili görsel: ${selected.label}` : "Görsel seçilmedi."}
      </p>
      {selected ? (
        <img
          alt={selected.label}
          src={selected.url}
          width={160}
          height={120}
          style={{ objectFit: "contain" }}
        />
      ) : null}
      <div className={styles.actions}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          Görsel değiştir
        </button>
        <button type="button" onClick={() => onChange("")}>
          Görseli kaldır
        </button>
        <Link className={styles.button} href="/admin/media" target="_blank">
          Görsel yükle
        </Link>
      </div>
      {open ? (
        <div>
          <label className={styles.field}>
            Görsel ara
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <div className={styles.media}>
            {choices
              .filter((m) =>
                m.label
                  .toLocaleLowerCase("tr")
                  .includes(search.toLocaleLowerCase("tr")),
              )
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={value === m.id}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                >
                  <img alt="" src={m.url} loading="lazy" />
                  <span>{m.label}</span>
                </button>
              ))}
          </div>
          {!choices.length ? (
            <p>Henüz yayınlanmış görsel yok. İlk görseli yükleyin.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
