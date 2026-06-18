import type { Metadata } from "next";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { eventsMarkup } from "@/content/events";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Kantin Alsancak ve Atakent şubelerindeki yaklaşan etkinlikler.",
};

export default function EventsPage() {
  return (
    <PublicPageShell
      activePage="events"
      markup={eventsMarkup}
      scripts={[
        {
          id: "kantin-events-list",
          src: "/assets/js/events-public.js?v=next-migration-1",
          type: "module",
        },
      ]}
    />
  );
}
