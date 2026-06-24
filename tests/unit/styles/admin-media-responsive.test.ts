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

describe("admin medya responsive ve kullanım kontratı", () => {
  it("medya kayıtlarını tüm satırdan açılan dinamik yönetim kartları olarak sunar", () => {
    expect(page).toContain("className={mediaStyles.mediaCard}");
    expect(page).toContain("className={mediaStyles.mediaSummary}");
    expect(page).toContain("className={mediaStyles.mediaEditor}");
    expect(css).toMatch(/\.mediaCard\[open\][\s\S]*\.mediaSummary/);
    expect(css).toMatch(
      /@media \(max-width: 980px\)[\s\S]*\.mediaSummary\s*{[\s\S]*grid-template-columns:/,
    );
  });

  it("yeni görsel formunu ayrı ve açılabilir bir satırda tutar", () => {
    expect(page).toContain('id="media-editor"');
    expect(page).toContain("className={mediaStyles.uploadCard}");
    expect(page).toContain("?new=1#media-editor");
    expect(css).toMatch(/\.uploadCard\[open\] \.chevron/);
  });

  it("görseli bağlantılar korunarak değiştirme formunu sunar", () => {
    expect(page).toContain("replaceAdminMedia");
    expect(page).toContain("Yerine başka görsel koy");
    expect(page).toContain("Görseli değiştir");
    expect(page).toContain("bağlantılar otomatik korunur");
  });

  it("sıra numarasını görünür medya arayüzünden kaldırır", () => {
    expect(page).not.toContain("Sıra:");
    expect(page).not.toContain("<span>Sıra</span>");
    expect(page).toContain('name="sort_order" type="hidden"');
  });
});
