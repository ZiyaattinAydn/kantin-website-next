import type { Metadata } from "next";
import EventsPageClient from "@/components/events/EventsPageClient";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getEventPublicData } from "@/lib/public-data/events";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Kantin Alsancak ve Atakent şubelerindeki yaklaşan etkinlikler.",
  alternates: { canonical: "/events" },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [common, result] = await Promise.all([
    getCommonPublicData(),
    getEventPublicData(),
  ]);
  const initialEvents = result.data.events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    branch: event.branch,
    status: "published" as const,
    link: event.link,
    imageUrl: event.imageUrl,
    location: event.location,
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
