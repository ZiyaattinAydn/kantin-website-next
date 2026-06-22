// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MenuItemImages } from "@/components/menu/MenuPrimitives";

describe("MenuItemImages", () => {
  it("admin medya alt metniyle public menü görselini render eder", () => {
    render(<MenuItemImages items={[{
      itemId: "TEST_item",
      slug: "test-item",
      name: "TEST_ Ürün",
      branch: "alsancak",
      imageUrl: "/assets/TEST_menu.webp",
      imageAlt: "TEST_ Erişilebilir alt metin",
      width: 800,
      height: 600,
    }]} />);

    expect(screen.getByRole("img", {
      name: "TEST_ Erişilebilir alt metin",
    })).toHaveAttribute("src", "/assets/TEST_menu.webp");
    expect(screen.getByText("TEST_ Ürün")).toBeInTheDocument();
  });
});
