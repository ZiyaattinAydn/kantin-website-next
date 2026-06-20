import EventCard from "@/components/cards/EventCard";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import SectionHeader from "@/components/ui/SectionHeader";
import type { EventPublicData } from "@/lib/public-data/types";

export default function HomeEvents({ data }: { data: EventPublicData }) {
  const events = data.events.slice(0, 3);

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
                branchLabels={data.branchLabels}
                branchAddresses={data.branchAddresses}
                instagramUrl={data.instagramUrl}
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
                href={data.instagramUrl}
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
