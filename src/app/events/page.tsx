import type { Metadata } from "next";
import EventsPageClient from "@/components/events/EventsPageClient";
import PublicPageShell from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Kantin Alsancak ve Atakent şubelerindeki yaklaşan etkinlikler.",
};

export default function EventsPage() {
  return (
    <PublicPageShell>
      <EventsPageClient />
    </PublicPageShell>
  );
}
