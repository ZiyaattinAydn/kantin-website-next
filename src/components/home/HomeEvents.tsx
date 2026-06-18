"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HomeEventCard } from "@/components/events/EventCards";
import { siteIdentity } from "@/content/site";
import { loadPublishedEvents, type KantinEvent } from "@/lib/events";

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
            events.map((event, index) => (
              <HomeEventCard key={event.id || `${event.title}-${index}`} event={event} />
            ))
          ) : (
            <article className="event-empty-card">
              <span className="event-empty-icon">○</span>
              <div>
                <h3>Takvim şimdilik sakin.</h3>
                <p>Yeni bir etkinlik yayınlandığında burada otomatik olarak görünecek.</p>
              </div>
              <a
                className="text-link"
                href={siteIdentity.instagramUrl}
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
