// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomeEvents from "@/components/home/HomeEvents";
import { eventAvailabilityFromRow } from "@/lib/event-availability";
import { menuGroup, categoryHidden } from "@/lib/menu/presentation";
import type { EventPublicData } from "@/lib/public-data/types";
describe("QA2 effective states", () => {
  it("omits the complete home event section for empty and expired event data", () => {
    const data: EventPublicData = {
      events: [],
      branchLabels: {},
      branchAddresses: {},
      instagramUrl: "",
    };
    const view = render(<HomeEvents data={data} />);
    expect(view.container).toBeEmptyDOMElement();
    view.rerender(
      <HomeEvents
        data={{
          ...data,
          events: [
            {
              id: "test-event",
              contentType: "event",
              title: "TEST_old",
              startAt: new Date("2000-01-01"),
              endAt: null,
              status: "published",
            } as EventPublicData["events"][number],
          ],
        }}
      />,
    );
    expect(
      screen.queryByText("Duyurular ve Etkinlikler"),
    ).not.toBeInTheDocument();
    expect(view.container).toBeEmptyDOMElement();
  });
  it("explains expiry while keeping the raw publishing selection", () => {
    const row = {
      status: "published",
      is_active: true,
      content_type: "event",
      start_at: "2000-01-01",
    };
    expect(eventAvailabilityFromRow(row)).toMatchObject({
      state: "ended",
      visible: false,
      reason: expect.stringContaining("tarihi geçtiği"),
    });
    expect(row.status).toBe("published");
  });
  it("uses legacy coffee placement and accepts branch-specific custom menu groups", () => {
    expect(menuGroup("kahve", {})).toEqual({
      key: "coffee",
      label: "Kahve Barı",
    });
    expect(menuGroup("fritoz", {}).key).toBe("main");
    expect(
      menuGroup("kahve", {
        menu_group: { key: "custom:test", label: "TEST_Menu" },
      }).key,
    ).toBe("custom:test");
    expect(
      menuGroup("kahve", { menu_group: { key: "merch", label: "Merch" } }).key,
    ).toBe("coffee");
  });
  it("restores parent availability without overwriting child publication", () => {
    const category = { status: "published", is_active: false };
    const child = { status: "draft", is_active: false };
    expect(categoryHidden(category, { is_active: true })).toBe(true);
    category.is_active = true;
    expect(categoryHidden(category, { is_active: true })).toBe(false);
    expect(child).toEqual({ status: "draft", is_active: false });
  });
});
