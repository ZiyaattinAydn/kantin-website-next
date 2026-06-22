import Link from "next/link";
import AdminJsonField from "./AdminJsonField";
import AdminPagination from "./AdminPagination";
import ConfirmSubmitButton from "./ConfirmSubmitButton";
import styles from "./AdminResource.module.css";
import {
  archiveAdminResource,
  deleteTestAdminResource,
  saveAdminResource,
} from "@/lib/admin/resource-actions";
import type { AdminOptionsMap } from "@/lib/admin/options";
import type { AdminPagination as PaginationData } from "@/lib/admin/pagination";
import type { AdminField, AdminResource } from "@/lib/admin/resources";
import {
  displayValue,
  formatAdminDate,
  formatMoneyCents,
  toDateTimeLocal,
} from "@/lib/admin/format";

function fieldDefault(
  field: AdminField,
  record: Record<string, unknown> | null,
): string | number | boolean {
  const value = record?.[field.name] ?? field.defaultValue ?? "";

  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "money") {
    return typeof value === "number" ? value / 100 : "";
  }
  if (field.type === "json") {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value || {}, null, 2);
    } catch {
      return "{}";
    }
  }
  if (field.type === "string-array") {
    return Array.isArray(value) ? value.join(", ") : "";
  }
  if (field.type === "datetime") return toDateTimeLocal(value);
  if (typeof value === "number" || typeof value === "string") return value;
  return "";
}

function fieldOptions(field: AdminField, options: AdminOptionsMap) {
  if (field.options) return field.options;
  if (field.optionSource) return options[field.optionSource] ?? [];
  return [];
}

function FieldControl({
  field,
  error,
  errorField,
  record,
  options,
}: {
  field: AdminField;
  error?: string;
  errorField?: string;
  record: Record<string, unknown> | null;
  options: AdminOptionsMap;
}) {
  const value = fieldDefault(field, record);
  const isWide = field.type === "textarea" || field.type === "json";
  const invalid = errorField === field.name;
  const errorId = invalid ? `${field.name}-error` : undefined;

  if (field.type === "checkbox") {
    return (
      <label className={styles.checkbox}>
        <input
          aria-describedby={errorId}
          aria-invalid={invalid}
          defaultChecked={Boolean(value)}
          name={field.name}
          type="checkbox"
        />
        <span>{field.label}</span>
        {invalid && error ? <small className={styles.fieldError} id={errorId}>{error}</small> : null}
      </label>
    );
  }

  const common = {
    id: field.name,
    name: field.name,
    required: field.required,
    "aria-describedby": errorId,
    "aria-invalid": invalid,
  };

  return (
    <label className={`${styles.field} ${isWide ? styles.fieldWide : ""}`} htmlFor={field.name}>
      <span>{field.label}</span>
      {field.type === "json" ? (
        <AdminJsonField
          defaultValue={String(value)}
          describedBy={errorId}
          id={field.name}
          invalid={invalid}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.rows ?? 10}
        />
      ) : field.type === "textarea" ? (
        <textarea
          {...common}
          defaultValue={String(value)}
          maxLength={10_000}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          spellCheck
        />
      ) : field.type === "select" || field.type === "foreign" ? (
        <select {...common} defaultValue={String(value)}>
          {field.nullable ? <option value="">Seçilmedi</option> : null}
          {!field.required && !field.nullable ? <option value="">Seç</option> : null}
          {fieldOptions(field, options).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          defaultValue={String(value)}
          inputMode={field.type === "money" || field.type === "number" ? "decimal" : undefined}
          maxLength={field.type === "string-array" ? 6_000 : field.type === "text" ? 500 : undefined}
          min={field.type === "money" || field.type === "number" ? 0 : undefined}
          pattern={field.name === "slug" ? "[a-z0-9]+(?:-[a-z0-9]+)*" : undefined}
          placeholder={field.placeholder}
          step={field.type === "money" ? "0.01" : field.type === "number" ? "1" : undefined}
          type={
            field.type === "datetime"
              ? "datetime-local"
              : field.name === "public_email"
                ? "email"
              : field.type === "url"
                ? "url"
                : field.type === "number" || field.type === "money"
                  ? "number"
                  : "text"
          }
        />
      )}
      {field.help ? <small>{field.help}</small> : null}
      {invalid && error ? <small className={styles.fieldError} id={errorId}>{error}</small> : null}
    </label>
  );
}

function optionLabel(field: AdminField | undefined, value: unknown, options: AdminOptionsMap) {
  if (!field || typeof value !== "string") return null;
  const option = fieldOptions(field, options).find((entry) => entry.value === value);
  return option?.label ?? null;
}

function listDisplay(
  resource: AdminResource,
  fieldName: string,
  value: unknown,
  options: AdminOptionsMap,
) {
  const field = resource.fields.find((entry) => entry.name === fieldName);
  const related = optionLabel(field, value, options);
  if (related) return related;
  if (field?.type === "money") return formatMoneyCents(value);
  if (field?.type === "datetime") return formatAdminDate(value);
  return displayValue(value);
}

export default function AdminResourceEditor({
  resource,
  rows,
  record,
  options,
  pagination,
  search,
  notice,
  error,
  errorField,
  showNew,
}: {
  resource: AdminResource;
  rows: Record<string, unknown>[];
  record: Record<string, unknown> | null;
  options: AdminOptionsMap;
  pagination: PaginationData;
  search: string;
  notice?: string;
  error?: string;
  errorField?: string;
  showNew: boolean;
}) {
  const editorOpen = showNew || Boolean(record);
  const visibleRows = rows;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Admin CRUD</p>
          <h1>
            {resource.title}<span>.</span>
          </h1>
          <p>{resource.description}</p>
        </div>
        <div className={styles.actions}>
          {resource.allowCreate ? (
            <Link className={styles.primary} href={`/admin/manage/${resource.key}?new=1`}>
              Yeni {resource.singular}
            </Link>
          ) : null}
          <Link className={styles.secondary} href="/admin">
            Dashboard
          </Link>
        </div>
      </div>

      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <form className={styles.search} method="get">
        <input defaultValue={search} name="q" placeholder="Kayıtlarda ara…" type="search" />
        <button className={styles.secondary} type="submit">Ara</button>
        {search ? <Link className={styles.secondary} href={`/admin/manage/${resource.key}`}>Temizle</Link> : null}
      </form>

      <div className={`${styles.layout} ${editorOpen ? styles.layoutWithEditor : ""}`}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>Kayıtlar</h2>
            <span>{visibleRows.length} / {pagination.total}</span>
          </div>
          {visibleRows.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {resource.listFields.map((fieldName) => (
                      <th key={fieldName}>
                        {resource.fields.find((field) => field.name === fieldName)?.label ?? fieldName}
                      </th>
                    ))}
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={String(row.id)}>
                      {resource.listFields.map((fieldName) => (
                        <td key={fieldName}>
                          {listDisplay(resource, fieldName, row[fieldName], options)}
                        </td>
                      ))}
                      <td>
                        <Link href={`/admin/manage/${resource.key}?edit=${String(row.id)}`}>
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>Bu filtreyle eşleşen kayıt yok.</p>
          )}
          <AdminPagination
            basePath={`/admin/manage/${resource.key}`}
            pagination={pagination}
            query={{ q: search || undefined }}
          />
        </div>

        {editorOpen ? (
          <aside className={`${styles.panel} ${styles.editorPanel}`}>
            <div className={styles.panelTitle}>
              <h2>{record ? "Kaydı düzenle" : `Yeni ${resource.singular}`}</h2>
              <Link href={`/admin/manage/${resource.key}`}>Kapat</Link>
            </div>

            <form action={saveAdminResource} className={styles.form}>
              <input name="_resource" type="hidden" value={resource.key} />
              <input name="_id" type="hidden" value={record && typeof record.id === "string" ? record.id : ""} />
              <div className={styles.formGrid}>
                {resource.fields.map((field) => (
                  <FieldControl
                    error={error}
                    errorField={errorField}
                    field={field}
                    key={field.name}
                    options={options}
                    record={record}
                  />
                ))}
              </div>
              <div className={styles.formActions}>
                <button className={styles.primary} type="submit">
                  {record ? "Değişiklikleri kaydet" : "Kaydı oluştur"}
                </button>
                <Link className={styles.secondary} href={`/admin/manage/${resource.key}`}>Vazgeç</Link>
              </div>
            </form>

            {record && resource.allowArchive ? (
              <>
                <hr />
                <form action={archiveAdminResource} className={styles.form}>
                  <input name="_resource" type="hidden" value={resource.key} />
                  <input name="_id" type="hidden" value={String(record.id)} />
                  <p className={styles.warning}>
                    Bu işlem kaydı public görünümden kaldırır; veriyi kalıcı olarak silmez.
                  </p>
                  <ConfirmSubmitButton
                    className={styles.danger}
                    confirmMessage="Bu kaydı pasife almak / arşivlemek istediğine emin misin?"
                    type="submit"
                  >
                    Pasife al / arşivle
                  </ConfirmSubmitButton>
                </form>
              </>
            ) : null}

            {record && resource.allowHardDeleteTest ? (
              <form action={deleteTestAdminResource} className={styles.form}>
                <input name="_resource" type="hidden" value={resource.key} />
                <input name="_id" type="hidden" value={String(record.id)} />
                <p className={styles.warning}>
                  Kalıcı silme yalnız TEST_ adı veya test- slug öneki taşıyan deneme kayıtlarında çalışır.
                </p>
                <ConfirmSubmitButton
                  className={styles.danger}
                  confirmMessage="Bu TEST kaydı kalıcı olarak silinecek. Devam edilsin mi?"
                  type="submit"
                >
                  TEST kaydını kalıcı sil
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
