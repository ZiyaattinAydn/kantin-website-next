"use client";
import { runAdminAction } from "@/lib/admin/client-action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContentRecord } from "@/lib/admin/content-actions";
import type { ContentRecord } from "@/lib/admin/content-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import RecordHistory from "../ui/RecordHistory";
import AdminDialog from "../ui/AdminDialog";
import ContentImagePicker from "./ContentImagePicker";
import styles from "./SimpleAdmin.module.css";
export default function ContentEditor({
  record,
  media,
  initialOpen = false,
}: {
  record: ContentRecord;
  media: MediaChoice[];
  initialOpen?: boolean;
}) {
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
        record={record}
        media={media}
        onSaved={() => {
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
  record,
  media,
  onSaved,
}: {
  record: ContentRecord;
  media: MediaChoice[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(record.visibility?.status);
  const [visible, setVisible] = useState(record.visibility?.is_active);
  const [values, setValues] = useState(() => record.fields.map((f) => f.value));
  function update(i: number, value: string | number | boolean) {
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
          if (
            visibilityChanged &&
            !window.confirm("Site bölümlerinin görünürlüğü değişsin mi?")
          )
            return;
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
                  changes: record.fields.map((f, i) => ({
                    path: f.path,
                    value: values[i],
                  })),
                }),
              "Değişiklikler kaydedilemedi. Tekrar deneyin.",
            );
            setMessage(result.message);
            if (result.ok) {
              onSaved();
              router.refresh();
            }
          });
        }}
      >
        <fieldset
          disabled={pending}
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
          <div className={styles.actions}>
            <button className={styles.primary} type="submit">
              {pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </button>
          </div>
        </fieldset>
        {message ? (
          <p className={styles.notice} role="status">
            {message}
          </p>
        ) : null}
      </form>
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
