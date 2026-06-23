import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  "src/app/admin/(panel)/media/MediaLibrary.module.css",
  "utf8",
);
const page = readFileSync(
  "src/app/admin/(panel)/media/page.tsx",
  "utf8",
);

describe("admin medya responsive kontratı", () => {
  it("medya yönetimini dar iki kolon yerine tek kolonlu güvenli düzende tutar", () => {
    expect(css).toMatch(/\.mediaLayout\s*{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) !important/);
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*\.mediaTable tr\s*{[\s\S]*display:\s*grid/);
  });

  it("sıra numarasını görünür medya arayüzünden kaldırır", () => {
    expect(page).not.toContain("Sıra:");
    expect(page).not.toContain("<span>Sıra</span>");
    expect(page).toContain('name="sort_order" type="hidden"');
  });
});
