import EventsPageClient from "@/components/events/EventsPageClient";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getEventPublicData } from "@/lib/public-data/events";
import { getPagePublicMetadata } from "@/lib/public-data/metadata";

export function generateMetadata() {
  return getPagePublicMetadata("events", {
    title: "Etkinlikler",
    description: "Kantin şubelerindeki yaklaşan etkinlikler.",
    canonical: "/events",
  });
}

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [common, result] = await Promise.all([
    getCommonPublicData(),
    getEventPublicData(),
  ]);
  const initialEvents = result.data.events.map((event) => ({
    id: event.id,
    contentType: event.contentType,
    title: event.title,
    description: event.description,
    startAt: event.startAt?.toISOString() ?? null,
    endAt: event.endAt?.toISOString() ?? null,
    branch: event.branch,
    status: "published" as const,
    link: event.link,
    ctaLabel: event.ctaLabel,
    imageUrl: event.imageUrl,
    location: event.location,
    publishStartAt: event.publishStartAt?.toISOString() ?? null,
    publishEndAt: event.publishEndAt?.toISOString() ?? null,
    sortOrder: event.sortOrder,
  }));

  return (
    <PublicPageShell common={common} issues={result.issues}>
      <EventsPageClient
        initialEvents={initialEvents}
        branchLabels={result.data.branchLabels}
        branchAddresses={result.data.branchAddresses}
        instagramUrl={result.data.instagramUrl}
      />
    </PublicPageShell>
  );
}
