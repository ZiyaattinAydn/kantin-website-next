import type { AdminRecordRevision } from "@/lib/admin/revisions";
import { restoreAdminResourceRevision } from "@/lib/admin/revision-actions";
import { ADMIN_REVISION_RESTORE_CONFIRMATION } from "@/lib/admin/revision-constants";
import { displayValue, formatAdminDate, formatMoneyCents } from "@/lib/admin/format";
import type { AdminField, AdminResource } from "@/lib/admin/resources";
import TypedConfirmSubmitButton from "./TypedConfirmSubmitButton";
import styles from "./AdminRevisionHistory.module.css";

function operationLabel(operation: AdminRecordRevision["operation"]): string {
  if (operation === "insert") return "İlk kayıt";
  if (operation === "delete") return "Silme kaydı";
  return "Güncelleme";
}

function fieldLabel(resource: AdminResource, fieldName: string): string {
  return resource.fields.find((field) => field.name === fieldName)?.label
    ?? (fieldName === "sort_order" ? "Otomatik sıra" : fieldName);
}

function restorableFields(resource: AdminResource): Set<string> {
  return new Set(
    resource.fields
      .filter((field) => !field.immutableOnUpdate)
      .map((field) => field.name),
  );
}

function revisionValue(field: AdminField | undefined, value: unknown): string {
  if (field?.type === "money") return formatMoneyCents(value);
  if (field?.type === "datetime") return formatAdminDate(value);
  if (field?.type === "json") {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return displayValue(value);
    }
  }
  return displayValue(value);
}

function ValuePreview({ field, value }: { field: AdminField | undefined; value: unknown }) {
  const rendered = revisionValue(field, value);
  if (field?.type === "json") return <pre>{rendered}</pre>;
  return <span>{rendered}</span>;
}

export default function AdminRevisionHistory({
  resource,
  recordId,
  recordLabel,
  revisions,
}: {
  resource: AdminResource;
  recordId: string;
  recordLabel: string;
  revisions: AdminRecordRevision[];
}) {
  const allowedFields = restorableFields(resource);

  return (
    <section className={styles.history} aria-label={`${recordLabel} sürüm geçmişi`}>
      <header className={styles.header}>
        <div>
          <strong>Sürüm geçmişi</strong>
          <p>Son 20 değişiklik gösterilir. Geri yükleme işlemi de yeni bir sürüm oluşturduğu için tekrar geri alınabilir.</p>
        </div>
        <span>{revisions.length} kayıt</span>
      </header>

      {!revisions.length ? (
        <p className={styles.empty}>
          Henüz kaydedilmiş bir değişiklik yok. Geçmiş, snapshot migration’ından sonraki ilk değişiklikle oluşur.
        </p>
      ) : (
        <div className={styles.list}>
          {revisions.map((revision) => {
            const restorableChangedFields = revision.changedFields.filter((field) => allowedFields.has(field));
            const previewFields = restorableChangedFields.slice(0, 6);
            const canRestore = revision.operation === "update"
              && Boolean(revision.beforeData)
              && restorableChangedFields.length > 0;

            return (
              <details className={styles.revision} key={revision.id}>
                <summary>
                  <span className={styles.summaryMain}>
                    <strong>{operationLabel(revision.operation)}</strong>
                    <small>{formatAdminDate(revision.createdAt)}</small>
                  </span>
                  <span className={styles.fieldSummary}>
                    {restorableChangedFields.length
                      ? restorableChangedFields.slice(0, 3).map((field) => fieldLabel(resource, field)).join(", ")
                      : "Geri yüklenebilir içerik alanı yok"}
                    {restorableChangedFields.length > 3 ? ` +${restorableChangedFields.length - 3}` : ""}
                  </span>
                  <span aria-hidden="true" className={styles.chevron}>⌄</span>
                </summary>

                <div className={styles.body}>
                  {previewFields.length && revision.beforeData && revision.afterData ? (
                    <div className={styles.diffList}>
                      {previewFields.map((fieldName) => {
                        const field = resource.fields.find((candidate) => candidate.name === fieldName);
                        return (
                          <article className={styles.diff} key={fieldName}>
                            <strong>{fieldLabel(resource, fieldName)}</strong>
                            <div className={styles.values}>
                              <div>
                                <small>Önce</small>
                                <ValuePreview field={field} value={revision.beforeData?.[fieldName]} />
                              </div>
                              <div>
                                <small>Sonra</small>
                                <ValuePreview field={field} value={revision.afterData?.[fieldName]} />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.info}>
                      Bu kayıt ilk oluşturma, silme veya yalnız sistem alanı değişikliği içeriyor; geri yüklenebilir kullanıcı alanı bulunmuyor.
                    </p>
                  )}

                  {restorableChangedFields.length > previewFields.length ? (
                    <p className={styles.info}>
                      Ayrıca {restorableChangedFields.length - previewFields.length} alan daha değişti. Geri yükleme seçilen tarihteki tüm düzenlenebilir alanları birlikte döndürür.
                    </p>
                  ) : null}

                  {canRestore ? (
                    <form action={restoreAdminResourceRevision} className={styles.restoreForm}>
                      <input name="_resource" type="hidden" value={resource.key} />
                      <input name="_id" type="hidden" value={recordId} />
                      <input name="_revision_id" type="hidden" value={revision.id} />
                      <p>
                        Bu işlem <b>{recordLabel}</b> kaydının düzenlenebilir alanlarını, bu değişiklik yapılmadan hemen önceki hâle döndürür. Sistem kimlikleri korunur.
                      </p>
                      <TypedConfirmSubmitButton
                        className={styles.restoreButton}
                        confirmMessage={`${recordLabel}, ${formatAdminDate(revision.createdAt)} tarihli değişiklikten önceki hâline döndürülecek.\n\nŞu anki hâl otomatik olarak yeni sürüm kaydı şeklinde saklanacak.`}
                        confirmPhrase={ADMIN_REVISION_RESTORE_CONFIRMATION}
                        type="submit"
                      >
                        Bu değişiklikten önceki hâle dön
                      </TypedConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
