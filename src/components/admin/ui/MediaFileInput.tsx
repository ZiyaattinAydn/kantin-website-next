"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export default function MediaFileInput({
  currentUrl,
  label = "Yeni görsel",
}: {
  currentUrl?: string | null;
  label?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const objectRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (objectRef.current) URL.revokeObjectURL(objectRef.current);
    },
    [],
  );
  return (
    <div className={styles.imagePicker}>
      {currentUrl ? (
        <figure>
          <strong>Mevcut görsel</strong>
          <Image
            unoptimized
            src={currentUrl}
            alt="Mevcut görsel"
            width={220}
            height={150}
          />
        </figure>
      ) : null}
      <label className={styles.field}>
        {label}
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          name="file"
          required
          type="file"
          onChange={(e) => {
            if (objectRef.current) URL.revokeObjectURL(objectRef.current);
            const next = e.target.files?.[0] ?? null;
            objectRef.current = next ? URL.createObjectURL(next) : null;
            setUrl(objectRef.current);
            setFile(next);
          }}
        />
      </label>
      {file && url ? (
        <figure>
          <strong>Yeni seçilen görsel ✓</strong>
          <Image
            unoptimized
            src={url}
            alt="Yeni seçilen görsel"
            width={220}
            height={150}
          />
          <figcaption>{file.name}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
