import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const careersCss = () =>
  readFileSync(join(process.cwd(), "src/components/careers/CareersPage.module.css"), "utf8");

describe("careers doodle animation styles", () => {
  it("animates doodles with transform/opacity variables and supports reduced motion", () => {
    const css = careersCss();

    expect(css).toContain("@keyframes careersDoodleFloat");
    expect(css).toMatch(/\.doodle\s*{[\s\S]*animation:\s*careersDoodleFloat/);
    expect(css).toMatch(/\.formDoodle\s*{[\s\S]*animation:\s*careersDoodleFloat/);
    expect(css).toContain("translate3d(");
    expect(css).toContain("opacity: var(--career-doodle-peak-opacity)");
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*--career-doodle-scale:\s*0\.58/);
    expect(css).toMatch(/@media \(max-width: 679px\)[\s\S]*--career-doodle-scale:\s*0\.42/);
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.doodle,[\s\S]*\.formDoodle\s*{[\s\S]*animation:\s*none !important/,
    );
  });
});
