"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AdminDialog from "../ui/AdminDialog";
import {
  loadDeliveryBaselineReview,
  restoreDeliveryBaseline,
  type BaselineReview,
} from "@/lib/admin/baseline-actions";
import type { ContentRecord } from "@/lib/admin/content-model";
import { runAdminAction } from "@/lib/admin/client-action";
import { safeImageUrl } from "@/lib/events";
import styles from "./SimpleAdmin.module.css";
export default function DeliveryBaselineRestore({
  scope,
}: {
  scope?: { table: ContentRecord["table"]; id: string };
}) {
  return (
    <AdminDialog title="İlk teslim haline dön">
      <summary>İlk teslim haline dön</summary>
      <RestoreForm scope={scope} />
    </AdminDialog>
  );
}
function RestoreForm({
  scope,
}: {
  scope?: { table: ContentRecord["table"]; id: string };
}) {
  const [review, setReview] = useState<BaselineReview[] | null>(null),
    [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(""),
    [includeBranches, setIncludeBranches] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      data-admin-dirty-guard="true"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          if (!review) {
            const r = await loadDeliveryBaselineReview(scope, includeBranches);
            if (r.ok) {
              setReview(r.review);
              setMessage(
                r.review.length
                  ? ""
                  : "Bu kapsam teslim sürümüyle aynı veya teslim referansı bulunmuyor.",
              );
            } else setMessage(r.message);
            return;
          }
          const r = await runAdminAction(
            () =>
              restoreDeliveryBaseline(
                review.map((item) => item.target),
                confirmation,
              ),
            "Teslim sürümü geri yüklenemedi.",
          );
          setMessage(r.message);
          if (r.ok) {
            setReview(null);
            setConfirmation("");
            router.refresh();
          } else {
            setReview(null);
            setConfirmation("");
          }
        });
      }}
      aria-busy={pending}
    >
      <p>
        Kapsam:{" "}
        {scope
          ? "Yalnız bu içerik kaydı"
          : "Site metinleri, görselleri, sayfa başlıkları, tema ve bölüm ayarları"}
        .
      </p>
      <p>
        Referans, ilk teslimin sabit frontend-v1 içeriğidir. Sonraki kayıtlar bu
        referansı değiştirmez. Geri dönüşten önce mevcut içerik sürüm geçmişine
        kaydedilir.
      </p>
      {!scope ? (
        <label className={styles.check}>
          <input
            type="checkbox"
            disabled={pending}
            checked={includeBranches}
            onChange={(e) => {
              setIncludeBranches(e.target.checked);
              setReview(null);
            }}
          />
          Şube tanıtım ve iletişim bilgilerini de dahil et
        </label>
      ) : null}
      {review?.map((item) => (
        <section className={styles.panel} key={item.target.id}>
          <h3>{item.label}</h3>
          {item.fields.map((field, i) => (
            <div key={i}>
              <strong>{field.label}</strong>
              {field.image ? (
                <div className={styles.grid}>
                  {[field.before, field.after].map((src, j) => (
                    <figure key={j}>
                      <figcaption>{j ? "Teslim sürümü" : "Mevcut"}</figcaption>
                      {safeImageUrl(src) ? (
                        <Image
                          unoptimized
                          src={src}
                          alt=""
                          width={180}
                          height={120}
                        />
                      ) : (
                        <span>Görsel yok</span>
                      )}
                    </figure>
                  ))}
                </div>
              ) : (
                <p>
                  {field.before || "Boş"} → {field.after || "Boş"}
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
      {review?.length ? (
        <label className={styles.field}>
          Onay için İLK TESLİME DÖN yazın
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
          />
        </label>
      ) : null}
      <div className={styles.actions}>
        <button
          className={styles.primary}
          disabled={
            pending ||
            (review !== null &&
              (!review.length || confirmation !== "İLK TESLİME DÖN"))
          }
          type="submit"
        >
          {pending
            ? "İşleniyor…"
            : review
              ? "Onayla ve geri yükle"
              : "Kapsamı ve değişiklikleri incele"}
        </button>
        {review ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setReview(null)}
          >
            Kapsamı yeniden incele
          </button>
        ) : null}
      </div>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  );
}
