import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import AdminJsonField from "./AdminJsonField";
import AdminPagination from "./AdminPagination";
import ConfirmSubmitButton from "./ConfirmSubmitButton";
import TypedConfirmSubmitButton from "./TypedConfirmSubmitButton";
import styles from "./AdminResourceEditor.module.css";
import {
  archiveAdminResource,
  deleteAdminResource,
  saveAdminResource,
} from "@/lib/admin/resource-actions";
import type { AdminOptionsMap } from "@/lib/admin/options";
import type { AdminPagination as PaginationData } from "@/lib/admin/pagination";
import { deleteImpactDefinition, type AdminDeleteImpact } from "@/lib/admin/resource-delete";
import type { AdminField, AdminResource } from "@/lib/admin/resources";
import {
  displayValue,
  formatAdminDate,
  formatMoneyCents,
  toDateTimeLocal,
} from "@/lib/admin/format";

type ListColumnKind =
  | "identity"
  | "detail"
  | "type"
  | "money"
  | "date"
  | "status";

type ListColumn = {
  key: string;
  label: string;
  fields: string[];
  kind: ListColumnKind;
};

const resourceColumns: Record<string, ListColumn[]> = {
  "menu-categories": [
    { key: "identity", label: "Kategori", fields: ["name", "slug"], kind: "identity" },
    { key: "display", label: "Görünüm", fields: ["display_type"], kind: "type" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "menu-category-branches": [
    { key: "category", label: "Kategori", fields: ["category_id", "display_name"], kind: "identity" },
    { key: "branch", label: "Şube", fields: ["branch_id"], kind: "detail" },
    { key: "status", label: "Durum", fields: ["is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "menu-items": [
    { key: "identity", label: "Ürün", fields: ["name", "slug"], kind: "identity" },
    { key: "category", label: "Kategori", fields: ["category_id"], kind: "detail" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "menu-item-branches": [
    { key: "item", label: "Ürün", fields: ["menu_item_id"], kind: "identity" },
    { key: "branch", label: "Şube", fields: ["branch_id"], kind: "detail" },
    { key: "price", label: "Fiyat", fields: ["price_cents", "price_label"], kind: "money" },
    { key: "status", label: "Durum", fields: ["is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "menu-item-variants": [
    { key: "identity", label: "Varyant", fields: ["label", "slug"], kind: "identity" },
    { key: "item", label: "Ürün ve şube", fields: ["menu_item_branch_id"], kind: "detail" },
    { key: "price", label: "Fiyat", fields: ["price_cents"], kind: "money" },
    { key: "status", label: "Durum", fields: ["is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  events: [
    { key: "identity", label: "İçerik", fields: ["title"], kind: "identity" },
    { key: "type", label: "Tür", fields: ["content_type"], kind: "type" },
    { key: "date", label: "Başlangıç", fields: ["start_at"], kind: "date" },
    { key: "status", label: "Durum", fields: ["status", "is_active", "is_featured"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "event-branches": [
    { key: "event", label: "Etkinlik", fields: ["event_id"], kind: "identity" },
    { key: "branch", label: "Şube", fields: ["branch_id"], kind: "detail" },
    { key: "status", label: "Durum", fields: ["is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "merch-products": [
    { key: "identity", label: "Ürün", fields: ["name"], kind: "identity" },
    { key: "type", label: "Tür", fields: ["product_type"], kind: "type" },
    { key: "price", label: "Fiyat", fields: ["price_cents"], kind: "money" },
    { key: "inventory", label: "Stok", fields: ["inventory_status"], kind: "status" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "merch-product-branches": [
    { key: "product", label: "Merch ürünü", fields: ["merch_product_id"], kind: "identity" },
    { key: "branch", label: "Şube", fields: ["branch_id"], kind: "detail" },
    { key: "status", label: "Durum", fields: ["is_available"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "instagram-posts": [
    { key: "identity", label: "Gönderi", fields: ["caption"], kind: "identity" },
    { key: "branch", label: "Şube", fields: ["branch_id"], kind: "detail" },
    { key: "published", label: "Gönderi tarihi", fields: ["published_at"], kind: "date" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  branches: [
    { key: "identity", label: "Şube", fields: ["name", "code"], kind: "identity" },
    { key: "location", label: "Konum", fields: ["district", "city"], kind: "detail" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "site-settings": [
    { key: "identity", label: "Ayar", fields: ["key"], kind: "identity" },
    { key: "description", label: "Açıklama", fields: ["description"], kind: "detail" },
    { key: "public", label: "Erişim", fields: ["is_public"], kind: "status" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "site-pages": [
    { key: "identity", label: "Sayfa", fields: ["title", "slug"], kind: "identity" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
  "content-blocks": [
    { key: "identity", label: "İçerik bloğu", fields: ["key"], kind: "identity" },
    { key: "page", label: "Sayfa", fields: ["page_id"], kind: "detail" },
    { key: "type", label: "Tür", fields: ["block_type"], kind: "type" },
    { key: "status", label: "Durum", fields: ["status", "is_active"], kind: "status" },
    { key: "updated", label: "Son güncelleme", fields: ["updated_at"], kind: "date" },
  ],
};

const groupEyebrows: Record<AdminResource["group"], string> = {
  menu: "Menü yönetimi",
  events: "Etkinlik ve duyurular",
  merch: "Merch yönetimi",
  content: "İçerik yönetimi",
  site: "Site yönetimi",
};

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
  idPrefix,
}: {
  field: AdminField;
  error?: string;
  errorField?: string;
  record: Record<string, unknown> | null;
  options: AdminOptionsMap;
  idPrefix: string;
}) {
  const value = fieldDefault(field, record);
  const isWide = field.type === "textarea" || field.type === "json";
  const invalid = errorField === field.name;
  const controlId = `${idPrefix}-${field.name}`;
  const errorId = invalid ? `${controlId}-error` : undefined;

  if (field.type === "checkbox") {
    return (
      <label className={styles.checkbox} htmlFor={controlId}>
        <input
          aria-describedby={errorId}
          aria-invalid={invalid}
          defaultChecked={Boolean(value)}
          id={controlId}
          name={field.name}
          type="checkbox"
        />
        <span>{field.label}</span>
        {invalid && error ? <small className={styles.fieldError} id={errorId}>{error}</small> : null}
      </label>
    );
  }

  const common = {
    id: controlId,
    name: field.name,
    required: field.required,
    "aria-describedby": errorId,
    "aria-invalid": invalid,
  };

  return (
    <label className={`${styles.field} ${isWide ? styles.fieldWide : ""}`} htmlFor={controlId}>
      <span>{field.label}</span>
      {field.type === "json" ? (
        <AdminJsonField
          defaultValue={String(value)}
          describedBy={errorId}
          id={controlId}
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
  if (field?.type === "datetime" || fieldName === "updated_at") return formatAdminDate(value);
  return displayValue(value);
}

function badgeClass(value: unknown, fieldName: string) {
  if (typeof value === "boolean") return value ? styles.badgeSuccess : styles.badgeMuted;
  const normalized = String(value ?? "").toLowerCase();
  if (["published", "active", "available", "hired"].includes(normalized)) return styles.badgeSuccess;
  if (["draft", "limited", "reviewing", "announcement"].includes(normalized)) return styles.badgeWarning;
  if (["out_of_stock", "discontinued", "rejected"].includes(normalized)) return styles.badgeDanger;
  if (["archived", "passive"].includes(normalized)) return styles.badgeMuted;
  if (fieldName === "content_type" || fieldName === "product_type" || fieldName === "display_type" || fieldName === "block_type") return styles.badgeBlue;
  return styles.badge;
}

function booleanLabel(fieldName: string, value: boolean) {
  if (fieldName === "is_featured") return value ? "Öne çıkan" : null;
  if (fieldName === "is_public") return value ? "Public" : "Yalnız admin";
  if (fieldName === "is_available") return value ? "Mevcut" : "Mevcut değil";
  return value ? "Aktif" : "Pasif";
}

function renderColumn(
  resource: AdminResource,
  row: Record<string, unknown>,
  column: ListColumn,
  options: AdminOptionsMap,
): ReactNode {
  const entries = column.fields
    .map((fieldName) => ({
      fieldName,
      field: resource.fields.find((candidate) => candidate.name === fieldName),
      value: row[fieldName],
    }))
    .filter((entry) => entry.value !== undefined);

  if (column.kind === "identity") {
    const [primary, ...secondary] = entries;
    return (
      <div className={styles.identity}>
        <strong>{primary ? listDisplay(resource, primary.fieldName, primary.value, options) : "—"}</strong>
        {secondary.map((entry) => {
          const rendered = listDisplay(resource, entry.fieldName, entry.value, options);
          const codeLike = ["slug", "code", "key", "external_id"].includes(entry.fieldName);
          return codeLike
            ? <code className={styles.code} key={entry.fieldName}>{rendered}</code>
            : <small key={entry.fieldName}>{rendered}</small>;
        })}
      </div>
    );
  }

  if (column.kind === "status" || column.kind === "type") {
    return (
      <div className={styles.statusStack}>
        {entries.map((entry) => {
          if (typeof entry.value === "boolean") {
            const label = booleanLabel(entry.fieldName, entry.value);
            return label ? <span className={badgeClass(entry.value, entry.fieldName)} key={entry.fieldName}>{label}</span> : null;
          }
          return (
            <span className={badgeClass(entry.value, entry.fieldName)} key={entry.fieldName}>
              {listDisplay(resource, entry.fieldName, entry.value, options)}
            </span>
          );
        })}
      </div>
    );
  }

  if (column.kind === "money") {
    const [primary, ...secondary] = entries;
    return (
      <div className={styles.cellStack}>
        <span className={styles.money}>{primary ? listDisplay(resource, primary.fieldName, primary.value, options) : "—"}</span>
        {secondary.map((entry) => <small key={entry.fieldName}>{listDisplay(resource, entry.fieldName, entry.value, options)}</small>)}
      </div>
    );
  }


  if (column.kind === "date") {
    return (
      <div className={styles.cellStack}>
        {entries.map((entry) => <small key={entry.fieldName}>{listDisplay(resource, entry.fieldName, entry.value, options)}</small>)}
      </div>
    );
  }

  return (
    <div className={styles.cellStack}>
      {entries.map((entry, index) => index === 0
        ? <strong key={entry.fieldName}>{listDisplay(resource, entry.fieldName, entry.value, options)}</strong>
        : <small key={entry.fieldName}>{listDisplay(resource, entry.fieldName, entry.value, options)}</small>)}
    </div>
  );
}

function defaultColumns(resource: AdminResource): ListColumn[] {
  return resource.listFields.map((fieldName, index) => ({
    key: fieldName,
    label: resource.fields.find((field) => field.name === fieldName)?.label ?? fieldName,
    fields: [fieldName],
    kind: index === 0 ? "identity" : "detail",
  }));
}

function isRecordInactive(
  resource: AdminResource,
  record: Record<string, unknown> | null,
): boolean {
  if (!record) return false;

  const inactiveByFlag = resource.activeField
    ? record[resource.activeField] === false
    : false;
  const inactiveByStatus = resource.statusField
    ? record[resource.statusField] === "archived"
    : false;

  return inactiveByFlag || inactiveByStatus;
}

function InlineEditor({
  resource,
  record,
  options,
  error,
  errorField,
  idPrefix,
  deleteImpact,
  deleteReviewHref,
  requiresDeleteReview,
}: {
  resource: AdminResource;
  record: Record<string, unknown> | null;
  options: AdminOptionsMap;
  error?: string;
  errorField?: string;
  idPrefix: string;
  deleteImpact?: AdminDeleteImpact | null;
  deleteReviewHref?: string;
  requiresDeleteReview?: boolean;
}) {
  const recordId = record && typeof record.id === "string" ? record.id : "";
  const existing = Boolean(recordId);
  const inactive = existing && isRecordInactive(resource, record);
  const hardDeleteProtectionReason = (resource as AdminResource & {
    hardDeleteProtectionReason?: string;
  }).hardDeleteProtectionReason;
  const canArchive = existing && !inactive && resource.allowArchive;
  const canHardDelete =
    existing && inactive && resource.allowHardDelete && !hardDeleteProtectionReason;
  const deleteBlocked = Boolean(
    deleteImpact?.items.some((item) => item.behavior === "block" && item.count > 0),
  );

  return (
    <div className={styles.inlineEditor}>
      <div className={styles.editorIntro}>
        <div>
          <strong>{existing ? `${resource.singular} bilgilerini düzenle` : `Yeni ${resource.singular} oluştur`}</strong>
          <p>Değişiklikler kaydedilmeden uygulanmaz. Yetki, doğrulama ve audit kontrolleri korunur.</p>
        </div>
      </div>

      <form action={saveAdminResource} className={styles.form}>
        <input name="_resource" type="hidden" value={resource.key} />
        <input name="_id" type="hidden" value={recordId} />
        <div className={styles.formGrid}>
          {resource.fields.map((field) => (
            <FieldControl
              error={error}
              errorField={errorField}
              field={field}
              idPrefix={idPrefix}
              key={field.name}
              options={options}
              record={record}
            />
          ))}
        </div>
        <div className={styles.formActions}>
          <button className={styles.primary} type="submit">
            {existing ? "Değişiklikleri kaydet" : "Kaydı oluştur"}
          </button>
        </div>
      </form>

      {canArchive ? (
        <div className={styles.destructiveSection}>
          <form action={archiveAdminResource} className={styles.form}>
            <input name="_resource" type="hidden" value={resource.key} />
            <input name="_id" type="hidden" value={recordId} />
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
        </div>
      ) : null}

      {existing && hardDeleteProtectionReason ? (
        <div className={styles.protectedSection}>
          <strong>Kalıcı silme koruması açık</strong>
          <p>{hardDeleteProtectionReason}</p>
        </div>
      ) : null}

      {canHardDelete && requiresDeleteReview && !deleteImpact ? (
        <div className={styles.destructiveSection}>
          <p className={styles.warning}>
            Kalıcı silmeden önce bu kayda bağlı veriler kontrol edilmelidir.
          </p>
          {deleteReviewHref ? (
            <Link className={styles.danger} href={deleteReviewHref}>
              Silme etkisini incele
            </Link>
          ) : null}
        </div>
      ) : null}

      {canHardDelete && (!requiresDeleteReview || deleteImpact) ? (
        <div className={styles.destructiveSection}>
          <form action={deleteAdminResource} className={styles.form}>
            <input name="_resource" type="hidden" value={resource.key} />
            <input name="_id" type="hidden" value={recordId} />
            <p className={styles.warning}>
              Bu kayıt ve yalnızca ona bağlı alt kayıtlar kalıcı olarak silinir; üst kayıtlar korunur.
            </p>
            {deleteImpact ? (
              <div className={styles.deleteImpact}>
                <strong>Silme etkisi</strong>
                <ul>
                  {deleteImpact.items.map((item) => (
                    <li data-behavior={item.behavior} key={item.key}>
                      <span>{item.label}</span>
                      <b>{item.count}</b>
                      <small>{item.behavior === "block" ? "Silmeyi engeller" : "Birlikte silinir"}</small>
                    </li>
                  ))}
                </ul>
                {deleteImpact.note ? <p>{deleteImpact.note}</p> : null}
              </div>
            ) : null}
            {deleteBlocked ? (
              <p className={styles.blockedWarning}>
                Bağlı ana kayıtlar bulunduğu için kalıcı silme kapalı. Önce yukarıda belirtilen kayıtları taşı veya sil.
              </p>
            ) : (
              <TypedConfirmSubmitButton
                className={styles.danger}
                confirmMessage="Bu kayıt ve ona ait alt bağlantılar kalıcı olarak silinecek. Bu işlem geri alınamaz."
                confirmPhrase="KALICI SİL"
                type="submit"
              >
                Kalıcı olarak sil
              </TypedConfirmSubmitButton>
            )}
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminResourceEditor({
  resource,
  rows,
  record,
  prefill,
  deleteImpact,
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
  prefill: Record<string, unknown> | null;
  deleteImpact: AdminDeleteImpact | null;
  options: AdminOptionsMap;
  pagination: PaginationData;
  search: string;
  notice?: string;
  error?: string;
  errorField?: string;
  showNew: boolean;
}) {
  const columns = resourceColumns[resource.key] ?? defaultColumns(resource);
  const selectedId = record && typeof record.id === "string" ? record.id : null;
  const requiresDeleteReview = Boolean(deleteImpactDefinition(resource));

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className="eyebrow">{groupEyebrows[resource.group]}</p>
          <h1>{resource.title}<span>.</span></h1>
          <p>{resource.description}</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/admin">Dashboard</Link>
        </div>
      </header>

      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {resource.allowCreate ? (
        <details className={styles.createRecord} id="new-record" open={showNew}>
          <summary>
            <span>＋ Yeni {resource.singular}</span>
            <span className={styles.chevron}>⌄</span>
          </summary>
          <InlineEditor
            error={showNew ? error : undefined}
            errorField={showNew ? errorField : undefined}
            idPrefix={`new-${resource.key}`}
            options={options}
            record={prefill}
            resource={resource}
            requiresDeleteReview={requiresDeleteReview}
          />
        </details>
      ) : null}

      <section className={styles.filterPanel} aria-label="Liste filtreleri">
        <form className={styles.search} method="get">
          <label className={styles.searchLabel}>
            <span>Kayıtlarda ara</span>
            <input defaultValue={search} name="q" placeholder={`${resource.singular} adı veya anahtar kelime`} type="search" />
          </label>
          <div className={styles.filterActions}>
            <button className={styles.primary} type="submit">Filtrele</button>
            <Link className={styles.secondary} href={`/admin/manage/${resource.key}`}>Temizle</Link>
          </div>
        </form>
        <p className={styles.resultSummary}>
          {pagination.total} kayıt · Sayfa {pagination.page}/{pagination.pageCount || 1}
        </p>
      </section>

      <section className={styles.resourceTable} aria-label={`${resource.title} tablosu`}>
        <div
          className={styles.tableHeader}
          style={{ "--admin-column-count": columns.length + 1 } as CSSProperties}
          aria-hidden="true"
        >
          {columns.map((column) => <span key={column.key}>{column.label}</span>)}
          <span>İşlem</span>
        </div>

        <div className={styles.recordList}>
          {rows.map((row) => {
            const rowId = String(row.id);
            const selected = selectedId === rowId;
            const rowRecord = selected && record ? record : row;
            const reviewParams = new URLSearchParams();
            if (search) reviewParams.set("q", search);
            if (pagination.page > 1) reviewParams.set("page", String(pagination.page));
            reviewParams.set("edit", rowId);
            const deleteReviewHref = `/admin/manage/${resource.key}?${reviewParams.toString()}#record-${rowId}`;

            return (
              <details className={styles.recordCard} id={`record-${rowId}`} key={rowId} open={selected}>
                <summary
                  className={styles.recordSummary}
                  style={{ "--admin-column-count": columns.length + 1 } as CSSProperties}
                >
                  {columns.map((column) => (
                    <span className={styles.summaryCell} data-label={column.label} key={column.key}>
                      {renderColumn(resource, row, column, options)}
                    </span>
                  ))}
                  <span className={styles.openAction} data-label="İşlem">
                    <span>Düzenle</span>
                    <span className={styles.chevron}>⌄</span>
                  </span>
                </summary>

                <InlineEditor
                  error={selected ? error : undefined}
                  errorField={selected ? errorField : undefined}
                  idPrefix={`${resource.key}-${rowId}`}
                  deleteImpact={selected ? deleteImpact : undefined}
                  deleteReviewHref={deleteReviewHref}
                  options={options}
                  record={rowRecord}
                  resource={resource}
                  requiresDeleteReview={requiresDeleteReview}
                />
              </details>
            );
          })}
          {!rows.length ? <p className={styles.empty}>Bu filtreyle eşleşen kayıt bulunamadı.</p> : null}
        </div>
      </section>

      <AdminPagination
        basePath={`/admin/manage/${resource.key}`}
        pagination={pagination}
        query={{ q: search || undefined }}
      />
    </section>
  );
}
