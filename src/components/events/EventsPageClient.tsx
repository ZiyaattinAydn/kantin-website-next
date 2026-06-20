"use client";

import { useMemo, useState } from "react";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import EventCard, { EventsZeroState } from "@/components/cards/EventCard";
import { eventFilters } from "@/data/events";
import styles from "./EventsPageClient.module.css";
import {
  normalisePublishedEvents,
  type EventBranch,
  type RawEvent,
} from "@/lib/events";

type EventFilter = "all" | Exclude<EventBranch, "both">;
type BranchMap = Record<"alsancak" | "atakent" | "both", string>;

function matchesFilter(
  event: ReturnType<typeof normalisePublishedEvents>[number],
  filter: EventFilter,
): boolean {
  return filter === "all" || event.branch === filter || event.branch === "both";
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
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const events = useMemo(
    () => normalisePublishedEvents(initialEvents),
    [initialEvents],
  );

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
            {eventFilters.map((filter) => {
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

          <div aria-live="polite" className={`${styles.list} dynamic-events-list`}>
            {events.length === 0 ? (
              <EventsZeroState instagramUrl={instagramUrl} />
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
              <p className={styles.empty}>Bu şube için yayınlanmış etkinlik bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
