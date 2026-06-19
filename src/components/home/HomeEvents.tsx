"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/cards/EventCard";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteIdentity } from "@/data/site";
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
    <section className="section dotted-paper home-events-illustrated" id="etkinlikler">
      <AmbientDoodles className="home-events-doodles" preset="events" />
      <div className="container">
        <SectionHeader
          eyebrow="Sadece gerçekten olduğunda"
          title="Yaklaşan etkinlikler"
          action={{
            href: "/events",
            label: (
              <>
                Etkinlik sayfası <span>↗</span>
              </>
            ),
          }}
        />

        <div aria-live="polite" className="event-grid dynamic-events-home">
          {events.length ? (
            events.map((event, index) => (
              <EventCard
                key={event.id || `${event.title}-${index}`}
                event={event}
                variant="home"
              />
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
