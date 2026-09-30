"use client";
import { useEffect, useState } from "react";
import { loadSelectedMediaChoice } from "@/lib/admin/media-choice-actions";
import type { MediaChoice } from "@/lib/admin/media-choices";
import ContentImagePicker from "./ContentImagePicker";
export default function MediaPicker({
  choices,
  value,
  onChange,
}: {
  choices: MediaChoice[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [original] = useState(value);
  const [selected, setSelected] = useState<MediaChoice[]>([]);
  useEffect(() => {
    let active = true;
    if (value && !choices.some((m) => m.id === value))
      void loadSelectedMediaChoice(value).then((media) => {
        if (active) setSelected(media);
      });
    return () => {
      active = false;
    };
  }, [choices, value]);
  return (
    <ContentImagePicker
      media={[...choices, ...selected]}
      original={original ? `media:${original}` : ""}
      value={value ? `media:${value}` : ""}
      label="Ürün görseli"
      onChange={(value) =>
        onChange(value.startsWith("media:") ? value.slice(6) : "")
      }
    />
  );
}
