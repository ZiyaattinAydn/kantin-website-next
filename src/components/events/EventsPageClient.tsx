"use client";

import { useEffect, useMemo, useState } from "react";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import {
  eventBranchAddresses,
  eventBranchLabels,
  formatEventDay,
  formatEventFullDate,
  formatEventMonth,
  formatEventTime,
  formatEventWeekday,
  loadPublishedEvents,
  safeExternalUrl,
  safeImageUrl,
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

function EventListCard({ event }: { event: KantinEvent }) {
  const externalLink = safeExternalUrl(event.link);
  const imageUrl = safeImageUrl(event.imageUrl);
  const address = event.location || eventBranchAddresses[event.branch];
  const timeRange = `${formatEventTime(event.startAt)}${
    event.endAt ? `–${formatEventTime(event.endAt)}` : ""
  }`;

  return (
    <article className="event-list-card" data-branch={event.branch}>
      <div className="event-list-date">
        <span>{formatEventMonth(event.startAt)}</span>
        <strong>{formatEventDay(event.startAt)}</strong>
        <small>{formatEventWeekday(event.startAt)}</small>
      </div>

      {imageUrl ? (
        <figure className="event-list-image">
          <img
            alt={`${event.title} etkinlik görseli`}
            decoding="async"
            loading="lazy"
            src={imageUrl}
          />
        </figure>
      ) : null}

      <div className="event-list-body">
        <div className="event-tags">
          <span>{eventBranchLabels[event.branch]}</span>
          <span>{formatEventTime(event.startAt)}</span>
          <span>{address}</span>
        </div>

        <h2>{event.title}</h2>
        <p>{event.description}</p>

        <div className="event-list-footer">
          <span>
            {formatEventFullDate(event.startAt)} · {timeRange}
          </span>

          {externalLink ? (
            <a
              className="calendar-button"
              href={externalLink}
              rel="noopener"
              target="_blank"
            >
              Kayıt / detay ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EventsZeroState() {
  return (
    <article className="events-zero-state">
      <div className="events-zero-mark">00</div>
      <div>
        <p className="eyebrow">Şu an yayınlanmış etkinlik yok</p>
        <h2>
          Takvim sakin.
          <br />
          Bu da gayet normal.
        </h2>
        <p>
          Yeni bir etkinlik eklendiğinde tarih, saat ve şube bilgisi burada görünecek.
        </p>
      </div>
      <a
        className="button button-primary"
        href="https://www.instagram.com/kantinizmir/"
        rel="noopener"
        target="_blank"
      >
        Instagram’ı takip et ↗
      </a>
    </article>
  );
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

      <section className="section events-page">
        <div className="container">
          <div aria-label="Etkinlikleri şubeye göre filtrele" className="filter-bar reveal">
            {filters.map((filter) => {
              const active = filter.value === activeFilter;

              return (
                <button
                  key={filter.value}
                  aria-pressed={active}
                  className={`filter-button${active ? " active" : ""}`}
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
            className="event-list dynamic-events-list"
          >
            {isLoading ? (
              <p className="empty-state">Etkinlik takvimi yükleniyor…</p>
            ) : events.length === 0 ? (
              <EventsZeroState />
            ) : visibleEvents.length ? (
              visibleEvents.map((event, index) => (
                <EventListCard key={event.id || `${event.title}-${index}`} event={event} />
              ))
            ) : (
              <p className="empty-state">Bu şube için yayınlanmış etkinlik bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
