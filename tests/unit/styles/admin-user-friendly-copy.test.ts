import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("admin kullanıcı dostu metin ve gelişmiş alan düzeni", () => {
  it("teknik oturum ve proje aşaması ifadelerini yönetici arayüzünden kaldırır", () => {
    const dashboard = source("src/app/admin/page.tsx");
    const shell = source("src/components/admin/AdminShell.tsx");
    const login = source("src/app/admin/login/page.tsx");

    expect(`${dashboard}\n${shell}\n${login}`).not.toMatch(/Supabase Auth|Faz 9|Public siteyi aç/);
  });

  it("teknik alanları ayrı gelişmiş bölümde toplar", () => {
    const editor = source("src/components/admin/crud/AdminResourceEditor.tsx");
    const resources = source("src/lib/admin/resources.ts");

    expect(editor).toContain("Gelişmiş alanlar");
    expect(editor).toContain("field.advanced");
    expect(resources).toContain('label: "URL adı"');
    expect(resources).toContain("Boş bırakırsan addan otomatik oluşturulur");
  });

  it("medya kullanım alanlarını teknik bucket adları yerine anlaşılır adlarla gösterir", () => {
    const media = source("src/app/admin/(panel)/media/page.tsx");

    expect(media).toContain('"menu-images": "Menü ürünleri"');
    expect(media).toContain("Teknik dosya bilgisini göster");
    expect(media).not.toContain("Storage ve medya");
  });
});
