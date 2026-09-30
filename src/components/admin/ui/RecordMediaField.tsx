"use client";
import { useState } from "react";
import MediaPicker from "../simple/MediaPicker";
import type { MediaChoice } from "@/lib/admin/media-choices";
export default function RecordMediaField({
  name,
  value,
  media,
}: {
  name: string;
  value: string;
  media: MediaChoice[];
}) {
  const [selected, setSelected] = useState(value);
  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <MediaPicker choices={media} value={selected} onChange={setSelected} />
    </div>
  );
}
