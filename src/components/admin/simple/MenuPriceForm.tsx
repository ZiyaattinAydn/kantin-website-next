"use client";
import { runAdminAction } from "@/lib/admin/client-action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveQuickMenuPrices } from "@/lib/admin/menu-actions";
import { formatTryPriceInput } from "@/lib/admin/pricing";
import type { MenuData } from "@/lib/admin/menu-model";
import styles from "./SimpleAdmin.module.css";
export default function MenuPriceForm({
  data,
  id,
  onSaved,
}: {
  data: MenuData;
  id: string;
  onSaved: (message: string) => void;
}) {
  const links = data.placements.filter((l) => l.menu_item_id === id),
    variants = data.variants.filter((v) =>
      links.some((l) => l.id === v.menu_item_branch_id),
    );
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      [...links, ...variants].map((v) => [
        v.id,
        formatTryPriceInput(v.price_cents),
      ]),
    ),
  );
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const changed = <
            T extends {
              id: string;
              price_cents: number | null;
              updated_at: string;
            },
          >(
            rows: T[],
          ) =>
            rows
              .filter(
                (v) => values[v.id] !== formatTryPriceInput(v.price_cents),
              )
              .map((v) => ({
                id: v.id,
                updated_at: v.updated_at,
                price: values[v.id],
              }));
          const branches = changed(links),
            options = changed(variants);
          if (!branches.length && !options.length) {
            onSaved("Fiyatlarda değişiklik yok.");
            return;
          }
          const r = await runAdminAction(
            () =>
              saveQuickMenuPrices({
                id,
                branches,
                variants: options,
              }),
            "Fiyatlar kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin.",
          );
          if (r.ok) {
            onSaved(r.message);
            router.refresh();
          } else setMessage(r.message);
        });
      }}
    >
      <p>
        Şubelerin fiyatlarını karşılaştırın. Yalnız değiştirdiğiniz fiyatlar
        kaydedilir.
      </p>
      <fieldset className={styles.fieldset} disabled={pending}>
        <div className={styles.grid}>
          {links.map((l) => (
            <section className={styles.panel} key={l.id}>
              <h3>{data.branches.find((b) => b.id === l.branch_id)?.name}</h3>
              <label className={styles.field}>
                {l.price_label || "Ana fiyat (TL)"}
                <input
                  inputMode="decimal"
                  value={values[l.id]}
                  onChange={(e) =>
                    setValues({ ...values, [l.id]: e.target.value })
                  }
                />
              </label>
              {variants
                .filter((v) => v.menu_item_branch_id === l.id)
                .map((v) => (
                  <label className={styles.field} key={v.id}>
                    {v.label} (TL){!v.is_active ? " · Gizli" : ""}
                    <input
                      required
                      inputMode="decimal"
                      value={values[v.id]}
                      onChange={(e) =>
                        setValues({ ...values, [v.id]: e.target.value })
                      }
                    />
                  </label>
                ))}
            </section>
          ))}
        </div>
        <button className={styles.primary} type="submit">
          {pending ? "Kaydediliyor…" : "Fiyatları kaydet"}
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
