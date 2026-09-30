import { describe, it, expect } from "vitest";
import { eventAvailability } from "@/lib/event-availability";
import { normalisePublishedEvents } from "@/lib/events";
const now = new Date("2026-09-30T00:00:00Z"),
  base = {
    contentType: "event" as const,
    status: "published" as const,
    active: true,
    startAt: "2026-10-01T18:00:00+03:00",
    endAt: "2026-10-01T23:00:00+03:00",
  };
describe("effective event lifecycle", () => {
  it("hides the reported June event despite its published flags", () =>
    expect(
      eventAvailability(
        {
          ...base,
          startAt: "2026-06-24T01:03:00+03:00",
          endAt: "2026-06-25T01:03:00+03:00",
        },
        now,
      ),
    ).toMatchObject({ state: "ended", visible: false }));
  it("keeps upcoming and currently running events", () => {
    expect(eventAvailability(base, now)).toMatchObject({
      state: "upcoming",
      visible: true,
    });
    expect(
      eventAvailability({ ...base, startAt: "2026-09-29T22:00:00Z" }, now),
    ).toMatchObject({ state: "live", visible: true });
  });
  it("uses the start when an end is absent and treats deadline as exclusive", () => {
    expect(
      eventAvailability({ ...base, startAt: now, endAt: null }, now).visible,
    ).toBe(false);
    expect(
      eventAvailability(
        { ...base, startAt: "2026-09-29T22:00:00Z", endAt: now },
        now,
      ).visible,
    ).toBe(false);
  });
  it("respects publication windows for upcoming events too", () => {
    expect(
      eventAvailability(
        { ...base, publishStartAt: "2026-10-01T00:00:00Z" },
        now,
      ).state,
    ).toBe("scheduled");
    expect(eventAvailability({ ...base, publishEndAt: now }, now).visible).toBe(
      false,
    );
  });
  it("respects the original publication time alongside the newer window", () => {
    expect(
      eventAvailability({ ...base, publishedAt: "2026-10-01T00:00:00Z" }, now),
    ).toMatchObject({ state: "scheduled", visible: false });
    expect(
      normalisePublishedEvents(
        [{ ...base, publishedAt: "2026-10-01T00:00:00Z" }],
        now,
      ),
    ).toHaveLength(0);
  });
  it("allows announcements without event dates within their publication window", () =>
    expect(
      eventAvailability(
        { ...base, contentType: "announcement", startAt: null, endAt: null },
        now,
      ).visible,
    ).toBe(true));
  it("fails closed on malformed and reversed dates", () => {
    expect(
      eventAvailability({ ...base, publishEndAt: "invalid" }, now).visible,
    ).toBe(false);
    expect(
      eventAvailability({ ...base, endAt: "2026-01-01" }, now).visible,
    ).toBe(false);
  });
  it("fails closed before malformed raw dates are normalized", () =>
    expect(
      normalisePublishedEvents([{ ...base, publishEndAt: "invalid" }], now),
    ).toHaveLength(0));
  it("filters the visitor list with the same expiry and window rules", () =>
    expect(
      normalisePublishedEvents(
        [
          { ...base, title: "TEST_future" },
          {
            ...base,
            title: "TEST_ended",
            startAt: "2020-01-01",
            endAt: "2020-01-02",
          },
          { ...base, title: "TEST_window", publishEndAt: now.toISOString() },
        ],
        now,
      ).map((e) => e.title),
    ).toEqual(["TEST_future"]));
});
