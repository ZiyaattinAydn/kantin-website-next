export type EventAvailabilityInput = {
  contentType?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  publishStartAt?: unknown;
  publishEndAt?: unknown;
  publishedAt?: unknown;
  status?: unknown;
  active?: boolean;
};
export function parseEventDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value === "object") {
    const t = value as { seconds?: number; toDate?: () => Date };
    if (typeof t.toDate === "function") return parseEventDate(t.toDate());
    if (typeof t.seconds === "number") return parseEventDate(t.seconds * 1000);
  }
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
export function eventAvailability(
  input: EventAvailabilityInput,
  now: Date = new Date(),
) {
  const result = (state: string, label: string, visible = false) => ({
    state,
    label,
    visible,
    reason:
      state === "ended"
        ? "Etkinlik tarihi geçtiği için ziyaretçilere gösterilmiyor."
        : state === "publication_ended"
          ? "Yayın bitiş tarihi geçtiği için ziyaretçilere gösterilmiyor."
          : state === "scheduled"
            ? "Belirlenen yayın başlangıcı bekleniyor."
            : state === "draft"
              ? "Yayın ayarı taslak olduğu için ziyaretçilere gösterilmiyor."
              : state === "hidden"
                ? "Görünürlük kapalı olduğu için ziyaretçilere gösterilmiyor."
                : state === "archived"
                  ? "Kayıt arşivde."
                  : state === "invalid"
                    ? "Geçerli etkinlik ve yayın tarihleri gerekli."
                    : "Yayın ayarı ve tarih aralığı ziyaretçilere gösterilmeye uygun.",
  });
  if (input.status === "archived") return result("archived", "Arşivlendi");
  if (input.status !== "published") return result("draft", "Taslak");
  if (input.active === false) return result("hidden", "Gizli");
  const start = parseEventDate(input.startAt),
    end = parseEventDate(input.endAt),
    from = parseEventDate(input.publishStartAt),
    to = parseEventDate(input.publishEndAt),
    published = parseEventDate(input.publishedAt);
  if (
    [
      input.startAt,
      input.endAt,
      input.publishStartAt,
      input.publishEndAt,
      input.publishedAt,
    ].some(
      (v) => v !== null && v !== undefined && v !== "" && !parseEventDate(v),
    ) ||
    (from && to && to <= from) ||
    (start && end && end <= start)
  )
    return result("invalid", "Tarihleri kontrol edin");
  if (input.contentType !== "announcement" && (!start || (end ?? start) <= now))
    return result(
      start ? "ended" : "invalid",
      start ? "Sona erdi" : "Tarih gerekli",
    );
  if (to && to <= now) return result("publication_ended", "Yayın süresi doldu");
  if ((from && from > now) || (published && published > now))
    return result("scheduled", "Yayın bekliyor");
  if (input.contentType === "announcement")
    return result("published", "Yayında", true);
  return start! > now
    ? result("upcoming", "Yaklaşan", true)
    : result("live", "Canlı", true);
}
export function eventAvailabilityFromRow(
  row: Record<string, unknown>,
  now?: Date,
) {
  return eventAvailability(
    {
      contentType: row.content_type,
      startAt: row.start_at,
      endAt: row.end_at,
      publishStartAt: row.publish_start_at,
      publishEndAt: row.publish_end_at,
      publishedAt: row.published_at,
      status: row.status,
      active: row.is_active !== false,
    },
    now,
  );
}
