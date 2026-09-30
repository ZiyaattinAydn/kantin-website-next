"use client";
import { useEffect, useRef, useState } from "react";
import { eventAvailabilityFromRow } from "@/lib/event-availability";
export default function EventEffectiveState({
  record,
}: {
  record: Record<string, unknown>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(() => eventAvailabilityFromRow(record));
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const update = () => {
      const data = new FormData(form);
      const next = { ...record };
      for (const name of [
        "content_type",
        "start_at",
        "end_at",
        "publish_start_at",
        "publish_end_at",
        "published_at",
        "status",
      ])
        if (data.has(name)) next[name] = data.get(name);
      next.is_active = data.get("is_active") === "on";
      setState(eventAvailabilityFromRow(next));
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
    };
  }, [record]);
  return (
    <div ref={ref} role="status">
      <strong>Gerçek durum: {state.label}</strong>
      <p>{state.reason}</p>
      <small>
        Yayın ayarı kaydedilen tercihtir. Gerçek durum ayrıca tarih ve
        görünürlük koşullarına bağlıdır.
      </small>
    </div>
  );
}
