// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventCard from "@/components/cards/EventCard";
import type { KantinEvent } from "@/lib/events";

const baseEvent: KantinEvent = {
  id: "TEST_event",
  contentType: "event",
  title: "TEST_ Etkinlik",
  description: "TEST_ Etkinlik açıklaması",
  startAt: new Date("2099-06-23T18:00:00.000Z"),
  endAt: null,
  branch: "alsancak",
  status: "published",
  publishStartAt: null,
  publishEndAt: null,
  sortOrder: 0,
};

describe("EventCard", () => {
  it("etkinliği tarih ve saat bilgisiyle render eder", () => {
    render(
      <EventCard
        branchAddresses={{ alsancak: "TEST_ Adres" }}
        branchLabels={{ alsancak: "TEST_ Alsancak" }}
        event={baseEvent}
        variant="list"
      />,
    );

    expect(screen.getByRole("heading", { name: "TEST_ Etkinlik" })).toBeInTheDocument();
    expect(screen.getByText("Etkinlik")).toBeInTheDocument();
    expect(screen.getByText("TEST_ Alsancak")).toBeInTheDocument();
  });

  it("duyuruyu tarih olmadan ve CTA etiketiyle render eder", () => {
    render(
      <EventCard
        branchAddresses={{ both: "TEST_ Şubeler" }}
        branchLabels={{ both: "Tüm şubeler" }}
        event={{
          ...baseEvent,
          id: "TEST_announcement",
          contentType: "announcement",
          title: "TEST_ Duyuru",
          description: "",
          startAt: null,
          link: "https://example.com/test",
          ctaLabel: "TEST_ Oku",
        }}
        variant="list"
      />,
    );

    expect(screen.getByRole("heading", { name: "TEST_ Duyuru" })).toBeInTheDocument();
    expect(screen.getAllByText("Duyuru").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /TEST_ Oku/ })).toHaveAttribute(
      "href",
      "https://example.com/test",
    );
  });
});
