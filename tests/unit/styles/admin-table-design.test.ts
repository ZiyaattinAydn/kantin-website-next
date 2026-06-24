import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const resourceCss = readFileSync(
  "src/components/admin/crud/AdminResourceEditor.module.css",
  "utf8",
);
const resourcePage = readFileSync(
  "src/components/admin/crud/AdminResourceEditor.tsx",
  "utf8",
);
const applicationCss = readFileSync(
  "src/app/admin/(panel)/applications/Applications.module.css",
  "utf8",
);
const applicationPage = readFileSync(
  "src/app/admin/(panel)/applications/page.tsx",
  "utf8",
);
const resourcesSource = readFileSync(
  "src/lib/admin/resources.ts",
  "utf8",
);
const adminDashboard = readFileSync(
  "src/app/admin/page.tsx",
  "utf8",
);

describe("admin tablo tasarım sistemi", () => {
  it("generic CRUD kayıtlarını tüm satırdan açılan dinamik kartlara dönüştürür", () => {
    expect(resourcePage).toContain("<details className={styles.recordCard}");
    expect(resourcePage).toContain("<summary");
    expect(resourceCss).toMatch(/\.recordCard\[open\][\s\S]*\.recordSummary/);
    expect(resourceCss).toMatch(
      /@media \(max-width: 980px\)[\s\S]*\.recordSummary\s*{[\s\S]*grid-template-columns:/,
    );
    expect(resourceCss).toContain("content: attr(data-label)");
  });

  it("kaynak türüne göre kullanıcı dostu kolon grupları tanımlar", () => {
    expect(resourcePage).toContain('"menu-categories"');
    expect(resourcePage).toContain('"merch-products"');
    expect(resourcePage).toContain('"content-blocks"');
    expect(resourcePage).toContain("Son güncelleme");
  });

  it("kariyer başvurularını satırdan açılan inline yönetim alanıyla sunar", () => {
    expect(applicationPage).toContain("<details");
    expect(applicationPage).toContain("className={styles.applicationCard}");
    expect(applicationPage).toContain("className={styles.applicationEditor}");
    expect(applicationCss).toMatch(/\.applicationCard\[open\][\s\S]*\.applicationSummary/);
    expect(applicationCss).toMatch(
      /@media \(max-width: 1100px\)[\s\S]*\.applicationSummary\s*{[\s\S]*grid-template-columns:/,
    );
  });
  it("teknik sıra alanlarını kullanıcı formundan kaldırır ve güvenli kalıcı silme akışını gösterir", () => {
    expect(resourcesSource).not.toContain('name: "sort_order"');
    expect(resourcesSource).not.toContain('label: "Sıra"');
    expect(resourcePage).toContain("const canHardDelete");
    expect(resourcePage).toContain('confirmPhrase="KALICI SİL"');
    expect(resourcePage).not.toContain("TEST kaydını kalıcı sil");
    expect(adminDashboard).not.toContain("yalnız adı <b>TEST_</b>");
  });

});
