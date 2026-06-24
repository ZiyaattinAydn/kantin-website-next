import Link from "next/link";
import AdminInteractionGuard from "@/components/admin/AdminInteractionGuard";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import styles from "./Applications.module.css";
import {
  anonymizeApplicationAction,
  updateApplicationAction,
} from "@/lib/admin/application-actions";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  resolveAdminPage,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    edit?: string | string[];
    q?: string | string[];
    status?: string | string[];
    privacy?: string | string[];
    page?: string | string[];
    notice?: string | string[];
    error?: string | string[];
  }>;
};

type ApplicationRow = Pick<
  Database["public"]["Tables"]["job_applications"]["Row"],
  | "id"
  | "full_name"
  | "email"
  | "phone"
  | "preferred_branch_id"
  | "is_branch_flexible"
  | "department"
  | "employment_type"
  | "shift_preference"
  | "availability_days"
  | "experience"
  | "introduction"
  | "cv_media_id"
  | "status"
  | "admin_notes"
  | "privacy_status"
  | "retention_until"
  | "anonymization_error"
  | "created_at"
>;

const statusLabels = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  contacted: "İletişime geçildi",
  rejected: "Olumsuz",
  hired: "İşe alındı",
  archived: "Arşiv",
} as const;

const privacyLabels = {
  active: "Kişisel veri aktif",
  anonymization_pending: "Anonimleştirme bekliyor",
  anonymized: "Anonimleştirildi",
} as const;

const APPLICATION_DETAIL_COLUMNS =
  "id, full_name, email, phone, preferred_branch_id, is_branch_flexible, department, employment_type, shift_preference, availability_days, experience, introduction, cv_media_id, status, admin_notes, privacy_status, retention_until, anonymization_error, created_at" as const;

const departmentLabels: Record<string, string> = {
  service: "Servis",
  kitchen: "Mutfak",
  bar: "Bar",
  cashier: "Kasa",
};

const employmentLabels: Record<string, string> = {
  full_time: "Tam zamanlı",
  part_time: "Yarı zamanlı",
};

const shiftLabels: Record<string, string> = {
  morning: "Sabah",
  evening: "Akşam",
  flexible: "Esnek",
};


function captureRequestTime() {
  return Date.now();
}

const dayLabels: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
};

function statusClass(status: keyof typeof statusLabels) {
  if (status === "hired") return styles.badgeSuccess;
  if (status === "rejected") return styles.badgeDanger;
  if (status === "reviewing" || status === "contacted") return styles.badgeBlue;
  if (status === "archived") return styles.badgeMuted;
  return styles.badgeWarning;
}

function privacyClass(status: keyof typeof privacyLabels, retentionDue: boolean) {
  if (status === "anonymized") return styles.badgeMuted;
  if (status === "anonymization_pending" || retentionDue) return styles.badgeDanger;
  return styles.badgeSuccess;
}

function applicationsHref({
  q,
  status,
  privacy,
  page,
}: {
  q?: string;
  status?: string;
  privacy?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (privacy && privacy !== "all") params.set("privacy", privacy);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/applications${query ? `?${query}` : ""}`;
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const editId = firstString(params.edit);
  const q = normaliseAdminSearch(firstString(params.q));
  const rawStatus = firstString(params.status) ?? "all";
  const statusFilter = rawStatus === "all" || rawStatus in statusLabels
    ? rawStatus as "all" | keyof typeof statusLabels
    : "all";
  const rawPrivacy = firstString(params.privacy) ?? "all";
  const privacyFilter = rawPrivacy === "all" || rawPrivacy === "due" || rawPrivacy in privacyLabels
    ? rawPrivacy as "all" | "due" | keyof typeof privacyLabels
    : "all";
  const page = parseAdminPage(firstString(params.page));
  const requestTime = captureRequestTime();
  const supabase = await createClient();

  let countQuery = supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true });

  if (statusFilter !== "all") countQuery = countQuery.eq("status", statusFilter);
  if (privacyFilter === "due") {
    countQuery = countQuery
      .eq("privacy_status", "active")
      .lte("retention_until", new Date(requestTime).toISOString());
  } else if (privacyFilter !== "all") {
    countQuery = countQuery.eq("privacy_status", privacyFilter);
  }
  if (q) {
    countQuery = countQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw new Error(countError.message);
  const resolved = resolveAdminPage(count ?? 0, page, ADMIN_PAGE_SIZE);

  let applicationsQuery = supabase
    .from("job_applications")
    .select(APPLICATION_DETAIL_COLUMNS);

  if (statusFilter !== "all") applicationsQuery = applicationsQuery.eq("status", statusFilter);
  if (privacyFilter === "due") {
    applicationsQuery = applicationsQuery
      .eq("privacy_status", "active")
      .lte("retention_until", new Date(requestTime).toISOString());
  } else if (privacyFilter !== "all") {
    applicationsQuery = applicationsQuery.eq("privacy_status", privacyFilter);
  }
  if (q) {
    applicationsQuery = applicationsQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }

  const [listResult, selectedResult, { data: branches, error: branchError }] = await Promise.all([
    applicationsQuery
      .order("created_at", { ascending: false })
      .range(resolved.from, resolved.to),
    editId
      ? supabase
          .from("job_applications")
          .select(APPLICATION_DETAIL_COLUMNS)
          .eq("id", editId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("branches").select("id, name"),
  ]);

  if (listResult.error) throw new Error(listResult.error.message);
  if (selectedResult.error) throw new Error(selectedResult.error.message);
  if (branchError) throw new Error(branchError.message);

  const branchMap = new Map((branches ?? []).map((branch) => [branch.id, branch.name]));
  const listedRows = (listResult.data ?? []) as ApplicationRow[];
  const selected = selectedResult.data as ApplicationRow | null;
  const rows = selected && !listedRows.some((row) => row.id === selected.id)
    ? [selected, ...listedRows]
    : listedRows;
  const pagination = {
    page: resolved.page,
    pageSize: resolved.pageSize,
    pageCount: resolved.pageCount,
    total: resolved.total,
  };
  const listHref = applicationsHref({
    q,
    status: statusFilter,
    privacy: privacyFilter,
    page: resolved.page,
  });

  return (
    <section className={styles.page} id="admin-applications-page">
      <AdminInteractionGuard rootId="admin-applications-page" />
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Kişisel veri · Admin erişimi</p>
          <h1>Kariyer başvuruları<span>.</span></h1>
          <p>Satırın herhangi bir yerine dokunarak başvuruyu aç, değerlendir ve kişisel veri yaşam döngüsünü kontrollü biçimde yönet.</p>
        </div>
      </header>

      {firstString(params.notice) ? <p className={styles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={styles.error}>{firstString(params.error)}</p> : null}

      <section className={styles.filterPanel} aria-label="Başvuru filtreleri">
        <form className={styles.filters} method="get">
          <label>
            <span>Aday ara</span>
            <input defaultValue={q} name="q" placeholder="Ad, e-posta veya telefon" type="search" />
          </label>
          <label>
            <span>Başvuru durumu</span>
            <select defaultValue={statusFilter} name="status">
              <option value="all">Tüm durumlar</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Veri yaşam döngüsü</span>
            <select defaultValue={privacyFilter} name="privacy">
              <option value="all">Tüm veri durumları</option>
              <option value="due">Retention süresi dolanlar</option>
              {Object.entries(privacyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className={styles.filterActions}>
            <button className={styles.primary} type="submit">Filtrele</button>
            <Link className={styles.secondary} href="/admin/applications">Temizle</Link>
          </div>
        </form>
        <p className={styles.resultSummary}>{pagination.total} başvuru · Sayfa {pagination.page}/{pagination.pageCount || 1}</p>
      </section>

      <section className={styles.applicationTable} aria-label="Kariyer başvuruları tablosu">
        <div className={styles.tableHeader} aria-hidden="true">
          <span>Aday</span>
          <span>Alan</span>
          <span>Şube</span>
          <span>Başvuru durumu</span>
          <span>Veri yaşam döngüsü</span>
          <span>Başvuru tarihi</span>
          <span>İşlem</span>
        </div>

        <div className={styles.applicationList}>
          {rows.map((row) => {
            const retentionDue = row.privacy_status === "active"
              && new Date(row.retention_until).getTime() <= requestTime;
            const isSelected = editId === row.id;
            const anonymized = row.privacy_status === "anonymized";

            return (
              <details
                className={styles.applicationCard}
                data-admin-accordion-item="true"
                id={`application-${row.id}`}
                key={row.id}
                open={isSelected}
              >
                <summary className={styles.applicationSummary}>
                  <span className={styles.summaryCell} data-label="Aday">
                    <span className={styles.identity}>
                      <strong>{anonymized ? "Anonimleştirilmiş başvuru" : row.full_name}</strong>
                      <small>{anonymized ? "Kişisel alanlar temizlendi" : `${row.email} · ${row.phone}`}</small>
                    </span>
                  </span>
                  <span className={styles.summaryCell} data-label="Alan">
                    <span className={styles.cellStack}>
                      <strong>{departmentLabels[row.department] ?? row.department}</strong>
                      <small>{employmentLabels[row.employment_type] ?? row.employment_type}</small>
                    </span>
                  </span>
                  <span className={styles.summaryCell} data-label="Şube">
                    <span className={styles.cellStack}>
                      <strong>{row.is_branch_flexible ? "Fark etmez" : branchMap.get(row.preferred_branch_id ?? "") ?? "—"}</strong>
                      {row.is_branch_flexible ? <small>Tüm şubelere açık</small> : null}
                    </span>
                  </span>
                  <span className={styles.summaryCell} data-label="Başvuru durumu">
                    <span className={statusClass(row.status)}>{statusLabels[row.status]}</span>
                  </span>
                  <span className={styles.summaryCell} data-label="Veri yaşam döngüsü">
                    <span className={styles.badgeStack}>
                      <span className={privacyClass(row.privacy_status, retentionDue)}>{privacyLabels[row.privacy_status]}</span>
                      <small>Retention: {formatAdminDate(row.retention_until)}</small>
                    </span>
                  </span>
                  <span className={styles.summaryCell} data-label="Başvuru tarihi">
                    <small>{formatAdminDate(row.created_at)}</small>
                  </span>
                  <span className={styles.openAction} data-label="İşlem">
                    <span>İncele</span>
                    <span className={styles.chevron}>⌄</span>
                  </span>
                </summary>

                <div className={styles.applicationEditor}>
                  <div className={styles.editorHeading}>
                    <div>
                      <p className="eyebrow">Başvuru ayrıntıları</p>
                      <h2>{anonymized ? "Anonimleştirilmiş başvuru" : row.full_name}</h2>
                      <p>Bu satırdaki değişiklikler yalnız kaydettiğinde uygulanır; güvenlik ve işlem geçmişi kontrolleri otomatik yapılır.</p>
                    </div>
                    {isSelected ? <Link className={styles.closeLink} href={`${listHref}#application-${row.id}`}>URL seçimini temizle</Link> : null}
                  </div>

                  <section className={`${styles.lifecycle} ${retentionDue && row.privacy_status === "active" ? styles.lifecycleDue : ""}`}>
                    <strong>{privacyLabels[row.privacy_status]}</strong>
                    <span>
                      Retention tarihi: {formatAdminDate(row.retention_until)}
                      {retentionDue && row.privacy_status === "active" ? " · İnceleme süresi doldu." : ""}
                    </span>
                  </section>

                  {row.anonymization_error ? (
                    <p className={styles.error}>Son anonimleştirme denemesi: {row.anonymization_error}</p>
                  ) : null}

                  {!anonymized ? (
                    <dl className={styles.detailGrid}>
                      <div className={styles.detailCard}>
                        <dt>İletişim</dt>
                        <dd>{row.email}<br />{row.phone}</dd>
                      </div>
                      <div className={styles.detailCard}>
                        <dt>Şube / alan</dt>
                        <dd>{row.is_branch_flexible ? "Fark etmez" : branchMap.get(row.preferred_branch_id ?? "") ?? "—"} · {departmentLabels[row.department] ?? row.department}</dd>
                      </div>
                      <div className={styles.detailCard}>
                        <dt>Çalışma biçimi</dt>
                        <dd>{employmentLabels[row.employment_type] ?? row.employment_type} · {shiftLabels[row.shift_preference] ?? row.shift_preference}</dd>
                      </div>
                      <div className={styles.detailCard}>
                        <dt>Uygun günler</dt>
                        <dd>{row.availability_days.map((day) => dayLabels[day] ?? day).join(", ") || "Belirtilmedi"}</dd>
                      </div>
                      <div className={`${styles.detailCard} ${styles.detailCardWide}`}>
                        <dt>Deneyim</dt>
                        <dd>{row.experience || "Belirtilmedi"}</dd>
                      </div>
                      <div className={`${styles.detailCard} ${styles.detailCardWide}`}>
                        <dt>Kendini tanıtma</dt>
                        <dd className={styles.preWrap}>{row.introduction}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className={styles.notice}>Kişisel alanlar, teknik parmak izleri, admin notu ve CV kalıcı olarak temizlendi. Bu işlem geri alınamaz.</p>
                  )}

                  <div className={styles.editorColumns}>
                    <section className={styles.editorSection}>
                      <div className={styles.sectionTitle}>
                        <div>
                          <h3>Değerlendirme</h3>
                          <p>Başvuru durumunu ve yalnız adminlerin görebileceği notu güncelle.</p>
                        </div>
                      </div>

                      {row.privacy_status === "active" ? (
                        <form action={updateApplicationAction} className={styles.form} data-admin-dirty-guard="true">
                          <input name="id" type="hidden" value={row.id} />
                          <label className={styles.field}>
                            <span>Başvuru durumu</span>
                            <select defaultValue={row.status} name="status" required>
                              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                          </label>
                          <label className={styles.field}>
                            <span>Admin notu</span>
                            <textarea defaultValue={row.admin_notes ?? ""} maxLength={5000} name="admin_notes" rows={7} />
                          </label>
                          <button className={styles.primary} type="submit">Başvuruyu güncelle</button>
                        </form>
                      ) : <p className={styles.helper}>Anonimleştirilmiş kayıt artık düzenlenemez.</p>}

                      {row.privacy_status === "active" && row.cv_media_id ? (
                        <a className={styles.secondary} href={`/api/admin/applications/${row.id}/cv`} rel="noreferrer" target="_blank">CV dosyasını güvenli indir</a>
                      ) : null}
                    </section>

                    <section className={styles.editorSection}>
                      <div className={styles.sectionTitle}>
                        <div>
                          <h3>Veri yaşam döngüsü</h3>
                          <p>Anonimleştirme geri döndürülemez. İşlemden önce dry-run ile kayıt ve CV bağlantısı kontrol edilir.</p>
                        </div>
                      </div>

                      {row.privacy_status === "active" && row.status !== "archived" ? (
                        <p className={styles.helper}>Anonimleştirme için önce başvuru durumunu Arşiv yap ve kaydet.</p>
                      ) : null}

                      {(row.privacy_status === "anonymization_pending" ||
                        (row.privacy_status === "active" && row.status === "archived")) ? (
                        <div className={styles.dangerZone}>
                          <form action={anonymizeApplicationAction} className={styles.form}>
                            <input name="id" type="hidden" value={row.id} />
                            <input name="_intent" type="hidden" value="dry_run" />
                            <button className={styles.secondary} type="submit">Dry-run kontrolü yap</button>
                            <small>DB veya Storage değiştirilmeden arşiv durumu ve CV medya bağlantısı kontrol edilir.</small>
                          </form>

                          <form action={anonymizeApplicationAction} className={styles.form}>
                            <input name="id" type="hidden" value={row.id} />
                            <label className={styles.field}>
                              <span>Geri döndürülemez işlem onayı</span>
                              <input autoComplete="off" name="confirmation" pattern="ANONIMLESTIR" placeholder="ANONIMLESTIR" required />
                              <small>Private CV dosyası silinir; kişisel alanlar ve admin notu anonimleştirilir.</small>
                            </label>
                            <ConfirmSubmitButton
                              className={styles.danger}
                              confirmMessage="CV kalıcı olarak silinsin ve aday verisi geri döndürülemez biçimde anonimleştirilsin mi?"
                              type="submit"
                            >
                              {row.privacy_status === "anonymization_pending" ? "Anonimleştirmeyi sürdür" : "CV'yi sil ve anonimleştir"}
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      ) : null}
                    </section>
                  </div>
                </div>
              </details>
            );
          })}
          {!rows.length ? <p className={styles.empty}>Bu filtrelerle eşleşen başvuru bulunamadı.</p> : null}
        </div>
      </section>

      <AdminPagination
        basePath="/admin/applications"
        pagination={pagination}
        query={{
          q: q || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          privacy: privacyFilter === "all" ? undefined : privacyFilter,
        }}
      />
    </section>
  );
}
