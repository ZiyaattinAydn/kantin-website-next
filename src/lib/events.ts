import type { Event as EventRecord, EventBranchId } from "@/types/domain";

export const EVENT_DEMO_STORAGE_KEY = "kantin_demo_events_v1";

export type EventBranch = EventBranchId;

export type RawEvent = Partial<
  Omit<EventRecord, "startAt" | "endAt" | "branchId">
> & {
  startAt?: unknown;
  endAt?: unknown;
  branch?: string;
  branchId?: string;
};

export type KantinEvent = Omit<
  EventRecord,
  "id" | "startAt" | "endAt" | "branchId" | "status"
> & {
  id?: string;
  startAt: Date;
  endAt: Date | null;
  branch: EventBranch;
  status: "published";
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
  return value === "alsancak" || value === "atakent" || value === "both"
    ? value
    : "both";
}

export function normalisePublishedEvents(items: RawEvent[]): KantinEvent[] {
  const now = new Date();

  return items
    .map((item): KantinEvent | null => {
      const startAt = parseDate(item.startAt);
      const endAt = parseDate(item.endAt);

      if (!startAt || item.status !== "published") return null;

      return {
        id: item.id,
        title: item.title?.trim() || "Kantin etkinliği",
        description: item.description?.trim() || "Detaylar yakında.",
        startAt,
        endAt,
        branch: normaliseBranch(item.branchId ?? item.branch),
        status: "published",
        link: item.link?.trim() || undefined,
        imageUrl: item.imageUrl?.trim() || undefined,
        location: item.location?.trim() || undefined,
      };
    })
    .filter((item): item is KantinEvent => Boolean(item))
    .filter((item) => (item.endAt || item.startAt) >= now)
    .sort((first, second) => first.startAt.getTime() - second.startAt.getTime());
}

export async function loadPublishedEvents(): Promise<KantinEvent[]> {
  if (typeof window !== "undefined") {
    try {
      const demo = JSON.parse(
        window.localStorage.getItem(EVENT_DEMO_STORAGE_KEY) || "[]",
      ) as RawEvent[];

      if (demo.length) return normalisePublishedEvents(demo);
    } catch (error) {
      console.warn("Demo etkinlikleri okunamadı:", error);
    }
  }

  try {
    const response = await fetch("/data/events.json", { cache: "no-store" });
    if (!response.ok) throw new Error("events.json okunamadı");

    return normalisePublishedEvents((await response.json()) as RawEvent[]);
  } catch (error) {
    console.warn("Yerel etkinlik verisi okunamadı:", error);
    return [];
  }
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
