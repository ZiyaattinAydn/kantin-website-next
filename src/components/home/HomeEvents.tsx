import EventCard, {
EventsZeroState,
} from "@/components/cards/EventCard";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import SectionHeader from "@/components/ui/SectionHeader";
import type { EventPublicData } from "@/lib/public-data/types";
import styles from "./HomeEvents.module.css";

type HomeEventItem = EventPublicData["events"][number] & {
createdAt?: string | null;
};

function getCreatedAtTimestamp(item: HomeEventItem): number {
if (!item.createdAt) {
return 0;
}

const timestamp = new Date(item.createdAt).getTime();

return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function HomeEvents({
data,
}: {
data: EventPublicData;
}) {
const items = [...(data.events as HomeEventItem[])]
.filter((item) => {
if (item.contentType === "announcement") {
return true;
}
  return (
    item.contentType === "event" &&
    Boolean(item.startAt)
  );
})
.sort(
  (firstItem, secondItem) =>
    getCreatedAtTimestamp(secondItem) -
    getCreatedAtTimestamp(firstItem),
)
.slice(0, 2);

return ( <section
   className="section dotted-paper home-events-illustrated"
   id="etkinlikler"
 > <AmbientDoodles
     className="home-events-doodles"
     preset="events"
   />

```
  <div className="container">
    <SectionHeader
      eyebrow="Sadece gerçekten olduğunda"
      title="Duyurular ve Etkinlikler"
      action={{
        href: "/events",
        label: (
          <>
            Duyurular ve Etkinlikler <span>↗</span>
          </>
        ),
      }}
    />

    <div
      aria-live="polite"
      className={styles.list}
    >
      {items.length > 0 ? (
        items.map((item, index) => (
          <EventCard
            key={
              item.id ||
              `${item.title}-${index}`
            }
            event={item}
            variant="list"
            branchLabels={data.branchLabels}
            branchAddresses={data.branchAddresses}
            instagramUrl={data.instagramUrl}
          />
        ))
      ) : (
        <EventsZeroState
          instagramUrl={data.instagramUrl}
          variant="all"
        />
      )}
    </div>
  </div>
</section>
);
}