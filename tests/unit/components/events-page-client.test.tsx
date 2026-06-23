// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import EventsPageClient from "@/components/events/EventsPageClient";
import type { RawEvent } from "@/lib/events";

const branchLabels = {
  both: "Tüm şubeler",
  alsancak: "Alsancak",
  atakent: "Atakent",
};

const branchAddresses = {
  both: "Kantin şubeleri",
  alsancak: "TEST_ Alsancak adres",
  atakent: "TEST_ Atakent adres",
};

const initialEvents: RawEvent[] = [
  {
    id: "TEST_event",
    contentType: "event",
    title: "TEST_ Etkinlik",
    description: "TEST_ Etkinlik açıklaması",
    startAt: "2099-06-23T18:00:00.000Z",
    status: "published",
    branch: "alsancak",
  },
  {
    id: "TEST_announcement",
    contentType: "announcement",
    title: "TEST_ Duyuru",
    description: "TEST_ Duyuru açıklaması",
    publishEndAt: "2099-06-23T18:00:00.000Z",
    status: "published",
    branch: "atakent",
  },
];

describe("EventsPageClient", () => {
  it("içerik tipi filtresinde duyuruları etkinliklerden ayırır", async () => {
    const user = userEvent.setup();
    render(
      <EventsPageClient
        branchAddresses={branchAddresses}
        branchLabels={branchLabels}
        initialEvents={initialEvents}
        instagramUrl="https://example.com/instagram"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Duyurular" }));

    expect(screen.queryByRole("heading", { name: "TEST_ Etkinlik" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TEST_ Duyuru" })).toBeInTheDocument();
  });

  it("şube filtresini duyurular için de uygular", async () => {
    const user = userEvent.setup();
    render(
      <EventsPageClient
        branchAddresses={branchAddresses}
        branchLabels={branchLabels}
        initialEvents={initialEvents}
        instagramUrl="https://example.com/instagram"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Atakent" }));

    expect(screen.queryByRole("heading", { name: "TEST_ Etkinlik" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TEST_ Duyuru" })).toBeInTheDocument();
  });

  it("hiç içerik yoksa genel boş durumu gösterir", () => {
    render(
      <EventsPageClient
        branchAddresses={branchAddresses}
        branchLabels={branchLabels}
        initialEvents={[]}
        instagramUrl="https://example.com/instagram"
      />,
    );

    expect(screen.getByText("Şu an yayınlanmış içerik yok")).toBeInTheDocument();
  });
});
