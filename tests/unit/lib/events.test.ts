import { describe, expect, it } from "vitest";
import { normalisePublishedEvents } from "@/lib/events";

describe("normalisePublishedEvents", () => {
  it("gelecek etkinliği tarih bilgisiyle korur", () => {
    const [event] = normalisePublishedEvents([{
      id: "TEST_event",
      contentType: "event",
      title: "TEST_ Etkinlik",
      description: "TEST_ Açıklama",
      startAt: "2099-06-23T18:00:00.000Z",
      status: "published",
      branch: "alsancak",
    }]);

    expect(event).toMatchObject({
      id: "TEST_event",
      contentType: "event",
      title: "TEST_ Etkinlik",
      branch: "alsancak",
    });
    expect(event?.startAt).toBeInstanceOf(Date);
  });

  it("duyuruyu tarih zorunluluğu olmadan yayınlar", () => {
    const [announcement] = normalisePublishedEvents([{
      id: "TEST_announcement",
      contentType: "announcement",
      title: "TEST_ Duyuru",
      description: "",
      publishStartAt: "2026-06-01T09:00:00.000Z",
      publishEndAt: "2099-06-01T09:00:00.000Z",
      status: "published",
      branch: "atakent",
      ctaLabel: "TEST_ İncele",
    }]);

    expect(announcement).toMatchObject({
      contentType: "announcement",
      title: "TEST_ Duyuru",
      startAt: null,
      branch: "atakent",
      ctaLabel: "TEST_ İncele",
    });
  });

  it("yayın bitişi geçmiş duyuruyu gizler", () => {
    const events = normalisePublishedEvents([{
      id: "TEST_expired",
      contentType: "announcement",
      title: "TEST_ Eski duyuru",
      publishEndAt: "2020-01-01T00:00:00.000Z",
      status: "published",
    }]);

    expect(events).toEqual([]);
  });
});
