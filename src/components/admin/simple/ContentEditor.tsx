"use client";
import { runAdminAction } from "@/lib/admin/client-action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContentRecord } from "@/lib/admin/content-actions";
import {
  applyContentSnapshot,
  rebaseContentDraft,
  type ContentSnapshot,
  type ContentRecord,
} from "@/lib/admin/content-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import DeliveryBaselineRestore from "./DeliveryBaselineRestore";
import RecordHistory from "../ui/RecordHistory";
import AdminDialog from "../ui/AdminDialog";
import ContentImagePicker from "./ContentImagePicker";
import styles from "./SimpleAdmin.module.css";
export default function ContentEditor({
  record,
  media = [],
  initialOpen = false,
}: {
  record: ContentRecord;
  media?: MediaChoice[];
  initialOpen?: boolean;
}) {
  const [savedRecord, setSavedRecord] = useState<{
    sourceVersion: string;
    record: ContentRecord;
  } | null>(null);
  const activeRecord =
    savedRecord &&
    (record.updated_at === savedRecord.sourceVersion ||
      record.updated_at === savedRecord.record.updated_at)
      ? savedRecord.record
      : record;
  const [version, setVersion] = useState(0);
  return (
    <AdminDialog
      key={version}
      title={record.label}
      className={styles.panel}
      open={initialOpen && version === 0}
    >
      <summary className={styles.contentSummary}>
        {record.label}
        <span>Düzenle →</span>
      </summary>
      <ContentEditorForm
        record={activeRecord}
        media={media}
        onSaved={(snapshot) => {
          setSavedRecord({
            sourceVersion: record.updated_at,
            record: applyContentSnapshot(activeRecord, snapshot),
          });
          const url = new URL(window.location.href);
          url.searchParams.delete("record");
          window.history.replaceState(null, "", url.pathname + url.search);
          setVersion((value) => value + 1);
        }}
      />
    </AdminDialog>
  );
}
function ContentEditorForm({
  record: initialRecord,
  media,
  onSaved,
}: {
  record: ContentRecord;
  media: MediaChoice[];
  onSaved: (snapshot: ContentSnapshot) => void;
}) {
  const [record, setRecord] = useState(initialRecord);
  const [review, setReview] = useState(false);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(record.visibility?.status);
  const [visible, setVisible] = useState(record.visibility?.is_active);
  const [values, setValues] = useState(() => record.fields.map((f) => f.value));
  function update(i: number, value: string | number | boolean) {
    setReview(false);
    setValues((v) => v.map((item, j) => (j === i ? value : item)));
  }
  return (
    <>
      <form
        data-admin-dirty-guard="true"
        aria-busy={pending}
        onSubmit={(e) => {
          e.preventDefault();
          const visibilityChanged =
            record.label === "Bölüm görünürlükleri" ||
            status !== record.visibility?.status ||
            visible !== record.visibility?.is_active;
          if (!review) {
            setReview(true);
            return;
          }
          start(async () => {
            const result = await runAdminAction(
              () =>
                saveContentRecord({
                  id: record.id,
                  table: record.table,
                  updated_at: record.updated_at,
                  confirmed: visibilityChanged ? "EVET" : "",
                  status,
                  is_active: visible,
                  changes: record.fields
                    .map((f, i) => ({
                      path: f.path,
                      value: values[i],
                    }))
                    .filter((ch, i) => ch.value !== record.fields[i].value),
                }),
              "Değişiklikler kaydedilemedi. Tekrar deneyin.",
            );
            setMessage(result.message);
            if (result.ok) {
              if ("snapshot" in result) onSaved(result.snapshot);
              router.refresh();
            } else if ("conflict" in result && result.conflict) {
              const next = applyContentSnapshot(record, result.conflict);
              setValues(rebaseContentDraft(record, values, next));
              if (status === record.visibility?.status)
                setStatus(next.visibility?.status);
              if (visible === record.visibility?.is_active)
                setVisible(next.visibility?.is_active);
              setRecord(next);
              setReview(false);
            }
          });
        }}
      >
        {record.context ? <p>{record.context}</p> : null}
        {record.publicHref ? (
          <a href={record.publicHref} target="_blank" rel="noreferrer">
            Sitede gör ↗
          </a>
        ) : null}
        <fieldset
          disabled={pending || review}
          style={{ border: 0, padding: 0, minWidth: 0 }}
        >
          <div className={styles.grid}>
            {record.fields.map((f, i) => (
              <div
                className={
                  f.kind === "checkbox"
                    ? styles.check
                    : `${styles.field} ${f.kind === "image" ? styles.wide : ""}`
                }
                key={JSON.stringify(f.path)}
              >
                {f.kind === "checkbox" ? (
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={!!values[i]}
                      onChange={(e) => update(i, e.target.checked)}
                    />
                    <span>{f.label}</span>
                  </label>
                ) : (
                  <>
                    <label htmlFor={`${record.id}-${i}`}>{f.label}</label>
                    {f.kind === "textarea" ? (
                      <textarea
                        id={`${record.id}-${i}`}
                        rows={3}
                        maxLength={10000}
                        value={String(values[i])}
                        onChange={(e) => update(i, e.target.value)}
                      />
                    ) : f.kind === "image" ? (
                      <ContentImagePicker
                        media={media}
                        original={String(f.value)}
                        value={String(values[i])}
                        label={`${record.label} / ${f.label}`}
                        onChange={(value) => update(i, value)}
                      />
                    ) : (
                      <input
                        id={`${record.id}-${i}`}
                        type={f.kind === "number" ? "number" : "text"}
                        min={0}
                        max={100}
                        maxLength={10000}
                        value={String(values[i])}
                        onChange={(e) =>
                          update(
                            i,
                            f.kind === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {record.visibility ? (
            <div className={styles.grid}>
              <label className={styles.field}>
                Yayın durumu
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="archived">Arşivlenmiş</option>
                </select>
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                />
                Sitede göster
              </label>
            </div>
          ) : null}
        </fieldset>
        {review ? (
          <div className={styles.notice} aria-label="Değişiklik özeti">
            <h3>Değişiklikleri kontrol edin</h3>
            {record.fields
              .filter((f, i) => f.value !== values[i])
              .map((f) => {
                const i = record.fields.indexOf(f);
                return (
                  <p key={JSON.stringify(f.path)}>
                    <strong>{f.label}</strong>
                    <br />
                    {f.kind === "image"
                      ? "Görsel değişikliği · mevcut ve yeni önizleme yukarıda"
                      : `${String(f.value) || "Boş"} → ${String(values[i]) || "Boş"}`}
                  </p>
                );
              })}
            {status !== record.visibility?.status ? (
              <p>
                Yayın durumu: {record.visibility?.status} → {status}
              </p>
            ) : null}
            {visible !== record.visibility?.is_active ? (
              <p>
                Sitede göster: {record.visibility?.is_active ? "Evet" : "Hayır"}{" "}
                → {visible ? "Evet" : "Hayır"}
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={() => setReview(false)}
            >
              Düzenlemeye dön
            </button>
          </div>
        ) : null}
        <div className={styles.actions}>
          <button className={styles.primary} disabled={pending} type="submit">
            {pending
              ? "Kaydediliyor…"
              : review
                ? "Onayla ve kaydet"
                : "Değişiklikleri incele"}
          </button>
        </div>
        {message ? (
          <p className={styles.notice} role="alert">
            {message}
          </p>
        ) : null}
      </form>
      <DeliveryBaselineRestore scope={{ table: record.table, id: record.id }} />
      <RecordHistory
        id={record.id}
        label={record.label}
        resourceKey={
          {
            content_blocks: "content-blocks",
            site_pages: "site-pages",
            site_settings: "site-settings",
            branches: "branches",
          }[record.table]
        }
      />
    </>
  );
}
