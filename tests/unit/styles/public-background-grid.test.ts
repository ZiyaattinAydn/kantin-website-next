import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("public background grid", () => {
  it("keeps the dot pattern on the public root instead of restarting it per section", () => {
    const themeCss = readProjectFile("src/styles/theme.css");
    const careersCss = readProjectFile("src/components/careers/CareersPage.module.css");

    expect(themeCss).toContain("--public-dot-image: url(\"/assets/ui/kantin-dot-pattern.png\")");
    expect(themeCss).toMatch(
      /\.public-theme-root\s*{[\s\S]*background-image:\s*var\(--public-dot-image\);/,
    );
    expect(themeCss).toMatch(
      /\.public-theme-root\s+:where\([\s\S]*\.dotted-paper[\s\S]*background-image:\s*none\s*!important;/,
    );
    expect(themeCss).toMatch(
      /\.public-theme-root\s+#anilarimiz\.section\.dotted-paper,[\s\S]*\.public-theme-root\s+\.atakent-food\.dotted-paper\s*{[\s\S]*background-image:\s*none\s*!important;/,
    );
    expect(themeCss).toMatch(
      /\.public-theme-root\s+:where\([\s\S]*\.coffee-bar-section[\s\S]*\.coffee-bar-section\s+\+\s+\.alsancak-merch-section[\s\S]*background-color:\s*var\(--cream\)\s*!important;[\s\S]*background-image:\s*var\(--public-dot-image\)\s*!important;/,
    );
    expect(careersCss).toMatch(/\.page\s*{[\s\S]*background:\s*transparent;/);
    expect(careersCss).not.toMatch(
      /background-image:\s*url\("\/assets\/ui\/kantin-dot-pattern\.png"\)/,
    );
  });
});
