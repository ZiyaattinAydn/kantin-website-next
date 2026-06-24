import type { Event as EventRecord, EventBranchId } from "@/types/domain";

export type EventBranch = EventBranchId;
export type EventContentType = "event" | "announcement";

export type RawEvent = Partial<
  Omit<EventRecord, "startAt" | "endAt" | "branchId">
> & {
  contentType?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  branch?: string;
  branchId?: string;
  ctaLabel?: unknown;
  publishStartAt?: unknown;
  publishEndAt?: unknown;
  createdAt?: string | null;
  sortOrder?: unknown;
};

export type KantinEvent = Omit<
  EventRecord,
  "id" | "contentType" | "startAt" | "endAt" | "branchId" | "status" | "publishStartAt" | "publishEndAt"
> & {
  id?: string;
  contentType: EventContentType;
  startAt: Date | null;
  endAt: Date | null;
  branch: EventBranch;
  status: "published";
  ctaLabel?: string;
  createdAt?: string;
  publishStartAt: Date | null;
  publishEndAt: Date | null;
  sortOrder: number;
};

type TimestampLike = {
  seconds?: number;
  toDate?: () => Date;
};

function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object") {
    const timestamp = value as TimestampLike;

    if (typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof timestamp.seconds === "number") {
      const date = new Date(timestamp.seconds * 1000);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function normaliseBranch(value?: string): EventBranch {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)
    ? normalized
    : "both";
}

function normaliseContentType(value: unknown): EventContentType {
  return value === "announcement" ? "announcement" : "event";
}

function textOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isVisibleAnnouncement(item: KantinEvent, now: Date): boolean {
  return (!item.publishStartAt || item.publishStartAt <= now)
    && (!item.publishEndAt || item.publishEndAt >= now);
}

function eventSortDate(item: KantinEvent): number {
  return (item.startAt ?? item.publishStartAt ?? item.publishEndAt ?? new Date(0)).getTime();
}

export function normalisePublishedEvents(items: RawEvent[]): KantinEvent[] {
  const now = new Date();

  return items
    .map((item): KantinEvent | null => {
      const contentType = normaliseContentType(item.contentType);
      const startAt = parseDate(item.startAt);
      const endAt = parseDate(item.endAt);
      const publishStartAt = parseDate(item.publishStartAt);
      const publishEndAt = parseDate(item.publishEndAt);

      if (item.status !== "published") return null;
      if (contentType === "event" && !startAt) return null;

      return {
        id: item.id,
        contentType,
        title: item.title?.trim() || "Kantin etkinliği",
        description: item.description?.trim() || (contentType === "announcement" ? "" : "Detaylar yakında."),
        startAt,
        endAt,
        branch: normaliseBranch(item.branchId ?? item.branch),
        status: "published",
        link: textOrUndefined(item.link),
        ctaLabel: textOrUndefined(item.ctaLabel),
        imageUrl: textOrUndefined(item.imageUrl),
        location: textOrUndefined(item.location),
        publishStartAt,
        publishEndAt,
        sortOrder: numberOrZero(item.sortOrder),
      };
    })
    .filter((item): item is KantinEvent => Boolean(item))
    .filter((item) => {
      if (item.contentType === "announcement") return isVisibleAnnouncement(item, now);
      return ((item.endAt || item.startAt) as Date) >= now;
    })
    .sort((first, second) => {
      if (first.contentType !== second.contentType) {
        return first.contentType === "announcement" ? -1 : 1;
      }
      if (first.contentType === "announcement") {
        return second.sortOrder - first.sortOrder || eventSortDate(second) - eventSortDate(first);
      }
      return eventSortDate(first) - eventSortDate(second);
    });
}

export function safeExternalUrl(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function safeImageUrl(value?: string): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  return safeExternalUrl(value);
}

export function formatEventDay(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit" }).format(date);
}

export function formatEventMonth(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { month: "short" })
    .format(date)
    .replace(".", "")
    .toLocaleUpperCase("tr-TR");
}

export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatEventFullDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatEventWeekday(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(date);
}
