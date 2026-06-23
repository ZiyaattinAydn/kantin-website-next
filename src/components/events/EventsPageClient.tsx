"use client";

import { useMemo, useState } from "react";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import EventCard, { EventsZeroState } from "@/components/cards/EventCard";
import styles from "./EventsPageClient.module.css";
import {
  normalisePublishedEvents,
  type EventContentType,
  type KantinEvent,
  type RawEvent,
} from "@/lib/events";

type ContentFilter = "all" | EventContentType;
type BranchFilter = "all" | string;
type BranchMap = Record<string, string>;

export function matchesEventFilters(
  event: KantinEvent,
  contentFilter: ContentFilter,
  branchFilter: BranchFilter,
): boolean {
  const matchesContent = contentFilter === "all" || event.contentType === contentFilter;
  const matchesBranch = branchFilter === "all" || event.branch === branchFilter || event.branch === "both";
  return matchesContent && matchesBranch;
}

function emptyMessage(contentFilter: ContentFilter, branchFilter: BranchFilter) {
  if (branchFilter !== "all") {
    if (contentFilter === "announcement") return "Bu şube için yayınlanmış duyuru bulunmuyor.";
    if (contentFilter === "event") return "Bu şube için yayınlanmış etkinlik bulunmuyor.";
    return "Bu şube için yayınlanmış etkinlik veya duyuru bulunmuyor.";
  }
  if (contentFilter === "announcement") return "Yayınlanmış duyuru bulunmuyor.";
  if (contentFilter === "event") return "Yayınlanmış etkinlik bulunmuyor.";
  return "Yayınlanmış içerik bulunmuyor.";
}

export default function EventsPageClient({
  initialEvents,
  branchLabels,
  branchAddresses,
  instagramUrl,
}: {
  initialEvents: RawEvent[];
  branchLabels: BranchMap;
  branchAddresses: BranchMap;
  instagramUrl: string;
}) {
  const [activeContentFilter, setActiveContentFilter] = useState<ContentFilter>("all");
  const [activeBranchFilter, setActiveBranchFilter] = useState<BranchFilter>("all");
  const events = useMemo(
    () => normalisePublishedEvents(initialEvents),
    [initialEvents],
  );
  const contentFilters = useMemo(
    () => [
      { value: "all" as const, label: "Tümü" },
      { value: "event" as const, label: "Etkinlikler" },
      { value: "announcement" as const, label: "Duyurular" },
    ],
    [],
  );
  const branchFilters = useMemo(
    () => [
      { value: "all", label: "Tüm şubeler" },
      ...Object.entries(branchLabels)
        .filter(([slug]) => slug !== "both")
        .map(([value, label]) => ({ value, label })),
    ],
    [branchLabels],
  );
  const visibleEvents = useMemo(
    () => events.filter((event) => matchesEventFilters(event, activeContentFilter, activeBranchFilter)),
    [activeBranchFilter, activeContentFilter, events],
  );

  return (
    <>
      <section className="page-hero page-hero-events dotted-paper">
        <AmbientDoodles />
        <div className="container page-hero-grid">
          <div className="reveal">
            <p className="eyebrow">Her hafta etkinlik varmış gibi davranmıyoruz</p>
            <h1>
              Etkinlikler<span>.</span>
            </h1>
            <p>
              Takvim ve duyuru panosu yalnızca gerçekten yayınlanan içerikle dolar.
              Tarih, şube ve duyuru bilgileri yönetici panelinden eklenir.
            </p>
          </div>

          <div aria-hidden="true" className="page-hero-mark reveal reveal-delay-1">
            <span>LIVE-WHEN LIVE</span>
            <svg viewBox="0 0 320 270">
              <rect height="178" rx="18" width="232" x="44" y="52" />
              <path d="M44 100h232M96 34v36M224 34v36M91 136h30M145 136h30M199 136h30M91 178h30M145 178h30M199 178h30" />
            </svg>
          </div>
        </div>
      </section>

      <section className={`section ${styles.page}`}>
        <div className="container">
          <div className={styles.filterStack}>
            <div aria-label="İçerik tipine göre filtrele" className={`${styles.filterBar} reveal`}>
              {contentFilters.map((filter) => {
                const active = filter.value === activeContentFilter;

                return (
                  <button
                    key={filter.value}
                    aria-pressed={active}
                    className={`${styles.filterButton}${active ? ` ${styles.active}` : ""}`}
                    onClick={() => setActiveContentFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div aria-label="Şubeye göre filtrele" className={`${styles.filterBar} ${styles.branchBar} reveal`}>
              {branchFilters.map((filter) => {
                const active = filter.value === activeBranchFilter;

                return (
                  <button
                    key={filter.value}
                    aria-pressed={active}
                    className={`${styles.filterButton}${active ? ` ${styles.active}` : ""}`}
                    onClick={() => setActiveBranchFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div aria-live="polite" className={`${styles.list} dynamic-events-list`}>
            {events.length === 0 ? (
              <EventsZeroState instagramUrl={instagramUrl} variant="all" />
            ) : visibleEvents.length ? (
              visibleEvents.map((event, index) => (
                <EventCard
                  key={event.id || `${event.title}-${index}`}
                  event={event}
                  variant="list"
                  branchLabels={branchLabels}
                  branchAddresses={branchAddresses}
                  instagramUrl={instagramUrl}
                />
              ))
            ) : (
              <p className={styles.empty}>{emptyMessage(activeContentFilter, activeBranchFilter)}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
