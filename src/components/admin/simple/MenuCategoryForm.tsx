"use client";
import { runAdminAction } from "@/lib/admin/client-action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMenuCategory } from "@/lib/admin/menu-actions";
import type { MenuData } from "@/lib/admin/menu-model";
import styles from "./SimpleAdmin.module.css";
export default function MenuCategoryForm({
  data,
  id,
  branchId,
  onSaved,
}: {
  data: MenuData;
  id?: string;
  branchId: string;
  onSaved: (message: string) => void;
}) {
  const current = data.categories.find((c) => c.id === id),
    links = data.categoryBranches.filter((l) => l.category_id === id);
  const [name, setName] = useState(current?.name ?? "");
  const [branches, setBranches] = useState(
    links.filter((l) => l.is_active).map((l) => l.branch_id).length
      ? links.filter((l) => l.is_active).map((l) => l.branch_id)
      : [branchId],
  );
  const [order, setOrder] = useState(
    current?.sort_order ?? data.categories.length,
  );
  const [status, setStatus] = useState(current?.status ?? "draft");
  const [active, setActive] = useState(current?.is_active ?? true);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const changed = !current
          ? status === "published"
          : status !== current.status ||
            active !== current.is_active ||
            links.some((l) => l.is_active !== branches.includes(l.branch_id)) ||
            branches.some(
              (b) => !links.some((l) => l.branch_id === b && l.is_active),
            );
        if (
          changed &&
          !window.confirm("Kategori ve şube görünürlüğü değişsin mi?")
        )
          return;
        start(async () => {
          const r = await runAdminAction(
            () =>
              saveMenuCategory({
                id: current?.id,
                updated_at: current?.updated_at,
                name,
                branches,
                sort_order: order,
                status,
                is_active: active,
                confirmed: changed ? "EVET" : "",
                branch_snapshot: links.map((l) => ({
                  id: l.id,
                  updated_at: l.updated_at,
                })),
              }),
            "Kategori kaydedilemedi. Tekrar deneyin.",
          );
          if (r.ok) {
            onSaved(r.message);
            router.refresh();
          } else setMessage(r.message);
        });
      }}
      aria-busy={pending}
    >
      <fieldset disabled={pending} className={styles.fieldset}>
        <label className={styles.field}>
          Kategori adı
          <input
            required
            maxLength={180}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <h3>Hangi şubelerde kullanılacak?</h3>
        {data.branches.map((b) => (
          <label key={b.id} className={styles.check}>
            <input
              type="checkbox"
              checked={branches.includes(b.id)}
              onChange={(e) =>
                setBranches((prev) =>
                  e.target.checked
                    ? [...prev, b.id]
                    : prev.filter((id) => id !== b.id),
                )
              }
            />
            {b.name}
          </label>
        ))}
        <div className={styles.grid}>
          <label className={styles.field}>
            Sıralama
            <input
              type="number"
              min={0}
              max={100000}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </label>
          <label className={styles.field}>
            Yayın durumu
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayında</option>
              <option value="archived">Arşivlendi</option>
            </select>
          </label>
        </div>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Sitede göster
        </label>
        <p>Şube seçimleri kategoriyle birlikte kaydedilir. Ürünler silinmez.</p>
        <button className={styles.primary} type="submit">
          {pending ? "Kaydediliyor…" : "Kategoriyi kaydet"}
        </button>
      </fieldset>
      {message ? (
        <p role="alert" className={styles.notice}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
