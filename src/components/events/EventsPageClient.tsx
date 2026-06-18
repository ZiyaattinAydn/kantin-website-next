"use client";

import { useEffect, useMemo, useState } from "react";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import { EventListCard, EventsZeroState } from "./EventCards";
import styles from "./EventsPageClient.module.css";
import {
  loadPublishedEvents,
  type EventBranch,
  type KantinEvent,
} from "@/lib/events";

type EventFilter = "all" | Exclude<EventBranch, "both">;

const filters: ReadonlyArray<{ value: EventFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "alsancak", label: "Alsancak" },
  { value: "atakent", label: "Atakent" },
];

function matchesFilter(event: KantinEvent, filter: EventFilter): boolean {
  return filter === "all" || event.branch === filter || event.branch === "both";
}

export default function EventsPageClient() {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [events, setEvents] = useState<KantinEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadPublishedEvents().then((loadedEvents) => {
      if (!active) return;
      setEvents(loadedEvents);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const visibleEvents = useMemo(
    () => events.filter((event) => matchesFilter(event, activeFilter)),
    [activeFilter, events],
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
              Takvim yalnızca gerçekten planlanan bir etkinlik yayınlandığında dolar.
              Tarih, saat ve şube bilgisi yönetici panelinden eklenir.
            </p>
          </div>

          <div aria-hidden="true" className="page-hero-mark reveal reveal-delay-1">
            <span>LIVE—WHEN LIVE</span>
            <svg viewBox="0 0 320 270">
              <rect height="178" rx="18" width="232" x="44" y="52" />
              <path d="M44 100h232M96 34v36M224 34v36M91 136h30M145 136h30M199 136h30M91 178h30M145 178h30M199 178h30" />
            </svg>
          </div>
        </div>
      </section>

      <section className={`section ${styles.page}`}>
        <div className="container">
          <div aria-label="Etkinlikleri şubeye göre filtrele" className={`${styles.filterBar} reveal`}>
            {filters.map((filter) => {
              const active = filter.value === activeFilter;

              return (
                <button
                  key={filter.value}
                  aria-pressed={active}
                  className={`${styles.filterButton}${active ? ` ${styles.active}` : ""}`}
                  onClick={() => setActiveFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div
            aria-busy={isLoading}
            aria-live="polite"
            className={`${styles.list} dynamic-events-list`}
          >
            {isLoading ? (
              <p className={styles.empty}>Etkinlik takvimi yükleniyor…</p>
            ) : events.length === 0 ? (
              <EventsZeroState />
            ) : visibleEvents.length ? (
              visibleEvents.map((event, index) => (
                <EventListCard key={event.id || `${event.title}-${index}`} event={event} />
              ))
            ) : (
              <p className={styles.empty}>Bu şube için yayınlanmış etkinlik bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
