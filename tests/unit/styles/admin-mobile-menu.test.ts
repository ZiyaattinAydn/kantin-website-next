import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("mobil admin menüsü", () => {
  it("menü açıkken yan panel içinde erişilebilir bir kapatma düğmesi sunar", () => {
    const shell = source("src/components/admin/AdminShell.tsx");

    expect(shell).toContain('aria-label="Admin menüsünü kapat"');
    expect(shell).toContain("className={styles.sidebarClose}");
    expect(shell).toContain("onClick={() => setOpen(false)}");
  });

  it("üst çubuktaki düğmeyi kapatma düğmesiyle karıştırmaz", () => {
    const shell = source("src/components/admin/AdminShell.tsx");

    expect(shell).toContain('aria-label={open ? "Yönetim menüsü açık" : "Yönetim menüsünü aç"}');
    expect(shell).toMatch(/\r?\n\s+Yönetim\r?\n/);
  });

  it("masaüstünde yan panel kapatma düğmesini gizler", () => {
    const css = source("src/components/admin/AdminShell.module.css");

    expect(css).toContain(".sidebarClose");
    expect(css).toMatch(/@media \(min-width: 1080px\)[\s\S]*\.sidebarClose \{\s*display: none;/);
  });
});
