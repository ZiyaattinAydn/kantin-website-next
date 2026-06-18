"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  eventBranchLabels,
  formatEventDay,
  formatEventMonth,
  formatEventTime,
  loadPublishedEvents,
  safeExternalUrl,
  safeImageUrl,
  type KantinEvent,
} from "@/lib/events";

export default function HomeEvents() {
  const [events, setEvents] = useState<KantinEvent[]>([]);

  useEffect(() => {
    let active = true;

    loadPublishedEvents().then((loadedEvents) => {
      if (active) setEvents(loadedEvents.slice(0, 3));
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section" id="etkinlikler">
      <div className="container">
        <div className="section-header reveal">
          <div>
            <p className="eyebrow">Sadece gerçekten olduğunda</p>
            <h2>Yaklaşan etkinlikler</h2>
          </div>
          <Link className="text-link" href="/events">
            Etkinlik sayfası <span>↗</span>
          </Link>
        </div>

        <div aria-live="polite" className="event-grid dynamic-events-home">
          {events.length ? (
            events.map((event, index) => {
              const externalLink = safeExternalUrl(event.link);
              const imageUrl = safeImageUrl(event.imageUrl);

              return (
                <article key={event.id || `${event.title}-${index}`} className="event-card">
                  {imageUrl ? (
                    <figure className="event-card-image">
                      <img
                        alt={`${event.title} etkinlik görseli`}
                        decoding="async"
                        loading="lazy"
                        src={imageUrl}
                      />
                    </figure>
                  ) : null}

                  <div className="event-date">
                    <strong>{formatEventDay(event.startAt)}</strong>
                    <span>{formatEventMonth(event.startAt)}</span>
                  </div>

                  <div className="event-content">
                    <div className="event-tags">
                      <span>{eventBranchLabels[event.branch]}</span>
                      <span>{formatEventTime(event.startAt)}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    {externalLink ? (
                      <a href={externalLink} rel="noopener" target="_blank">
                        Kayıt / detay ↗
                      </a>
                    ) : (
                      <Link href="/events">Detaya git ↗</Link>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <article className="event-empty-card">
              <span className="event-empty-icon">○</span>
              <div>
                <h3>Takvim şimdilik sakin.</h3>
                <p>Yeni bir etkinlik yayınlandığında burada otomatik olarak görünecek.</p>
              </div>
              <a
                className="text-link"
                href="https://www.instagram.com/kantinizmir/"
                rel="noopener"
                target="_blank"
              >
                Instagram’ı takip et ↗
              </a>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
