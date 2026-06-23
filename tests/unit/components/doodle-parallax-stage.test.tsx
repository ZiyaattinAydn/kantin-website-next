// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DoodleParallaxStage from "@/components/effects/DoodleParallaxStage";

const makeMediaQueryList = (query: string, matches: boolean) => ({
  matches,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe("DoodleParallaxStage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn((query: string) =>
        makeMediaQueryList(query, query === "(pointer: fine)"),
      ),
    });

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });

    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("moves the doodle layer with fine pointer movement inside its parent", async () => {
    const { container } = render(
      <div>
        <DoodleParallaxStage className="stage">
          <span />
        </DoodleParallaxStage>
      </div>,
    );
    const parent = container.firstElementChild as HTMLElement;
    const stage = parent.firstElementChild as HTMLElement;

    parent.getBoundingClientRect = () => ({
      bottom: 100,
      height: 100,
      left: 0,
      right: 200,
      top: 0,
      width: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 200, clientY: 100 }));

    await waitFor(() => {
      expect(stage.style.getPropertyValue("--parallax-x")).toBe("-6.0px");
      expect(stage.style.getPropertyValue("--parallax-y")).toBe("-4.5px");
    });

    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 220, clientY: 120 }));

    await waitFor(() => {
      expect(stage.style.getPropertyValue("--parallax-x")).toBe("0px");
      expect(stage.style.getPropertyValue("--parallax-y")).toBe("0px");
    });
  });
});
