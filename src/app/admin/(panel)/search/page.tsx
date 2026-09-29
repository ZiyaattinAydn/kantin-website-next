import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { adminTasks } from "@/lib/admin/navigation";
import { loadMenuData } from "@/lib/admin/menu-data";
import { contentSections, loadContentRecords } from "@/lib/admin/content-data";
import { recordSystemEvent } from "@/lib/admin/system-logs";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export const dynamic = "force-dynamic";
export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const norm = (value: string) =>
    value
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("ı", "i");
  const matches = (value: string) => norm(value).includes(norm(q));
  const results: { label: string; description: string; href: string }[] = q
    ? adminTasks
        .filter((t) => matches(`${t.label} ${t.keywords}`))
        .map((t) => ({ ...t }))
    : [];
  let failed = false;
  if (q)
    try {
      const [menu, sections] = await Promise.all([
        loadMenuData(),
        Promise.all(
          contentSections.map(async (section) => ({
            section,
            records: await loadContentRecords(section.key),
          })),
        ),
      ]);
      for (const p of menu.products.filter((p) => matches(p.name)))
        for (const b of menu.placements.filter(
          (b) => b.menu_item_id === p.id,
        )) {
          results.push({
            label: p.name,
            description: `${menu.branches.find((x) => x.id === b.branch_id)?.name ?? "Şube"} · ${menu.categories.find((x) => x.id === p.category_id)?.name ?? "Kategori"}`,
            href: `/admin/menu?${new URLSearchParams({ edit: p.id, branch: b.branch_id, mode: "prices" })}`,
          });
        }
      for (const { section, records } of sections)
        for (const r of records)
          if (
            matches(r.label) ||
            r.fields.some((f) => matches(`${f.label} ${String(f.value)}`))
          ) {
            results.push({
              label: r.label,
              description: section.label,
              href: `/admin/content?section=${section.key}`,
            });
          }
    } catch (error) {
      failed = true;
      await recordSystemEvent({
        route: "/admin/search",
        operation: "read",
        error,
      });
    }
  return (
    <section className={styles.page}>
      <h1>Arama sonuçları</h1>
      <p>
        {q
          ? `“${q}” için ${results.length} sonuç.`
          : "Ürün adı veya yapmak istediğiniz işlemi arayın. Örneğin: efes, footer, fiyat."}
      </p>
      {failed ? (
        <p role="alert">Bazı sonuçlar yüklenemedi. Tekrar deneyin.</p>
      ) : null}
      {results.slice(0, 50).map((r, i) => (
        <article className={styles.panel} key={`${r.href}-${i}`}>
          <h2>{r.label}</h2>
          <p>{r.description}</p>
          <Link className={styles.button} href={r.href}>
            {r.href.includes("mode=prices")
              ? "Fiyatı düzenle"
              : "Düzenlemeyi aç"}
          </Link>
        </article>
      ))}
      {q && !results.length ? (
        <p>Sonuç bulunamadı. Başka bir ürün adı veya işlem deneyin.</p>
      ) : null}
    </section>
  );
}
