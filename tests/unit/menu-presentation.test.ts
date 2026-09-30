import { describe, expect, it } from "vitest";
import { categoryNeedsManagedPresentation } from "@/lib/menu/presentation";

describe("menu presentation mode", () => {
  it("does not abandon the rich branch layout only because category order was managed", () => {
    expect(
      categoryNeedsManagedPresentation({
        slug: "firin",
        group: { key: "main", label: "Ana Menü" },
        managedOrder: true,
      }),
    ).toBe(false);
  });

  it("uses managed presentation for a real presentation override", () => {
    expect(
      categoryNeedsManagedPresentation({
        slug: "firin",
        group: { key: "main", label: "Ana Menü" },
        presentationOverride: true,
      }),
    ).toBe(true);
  });

  it("uses managed presentation when a category is moved to a different menu group", () => {
    expect(
      categoryNeedsManagedPresentation({
        slug: "firin",
        group: { key: "custom:gece", label: "Gece Menüsü" },
      }),
    ).toBe(true);
  });
});
