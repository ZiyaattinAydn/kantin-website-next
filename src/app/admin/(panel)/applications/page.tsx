import Link from "next/link";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import styles from "@/components/admin/crud/AdminResource.module.css";
import {
  anonymizeApplicationAction,
  updateApplicationAction,
} from "@/lib/admin/application-actions";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  adminPageRange,
  createAdminPagination,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";
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

const departmentLabels: Record<string, string> = {
  service: "Servis",
  kitchen: "Mutfak",
  bar: "Bar",
  cashier: "Kasa",
};

const dayLabels: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
};

function captureRequestTime() {
  return Date.now();
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
  const { from, to } = adminPageRange(page);
  const requestTime = captureRequestTime();
  const supabase = await createClient();

  let applicationsQuery = supabase
    .from("job_applications")
    .select(
      "id, full_name, email, phone, preferred_branch_id, is_branch_flexible, department, employment_type, status, privacy_status, retention_until, created_at",
      { count: "exact" },
    );
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

  const [listResult, selectedResult, { data: branches }] = await Promise.all([
    applicationsQuery.order("created_at", { ascending: false }).range(from, to),
    editId
      ? supabase.from("job_applications").select("*").eq("id", editId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("branches").select("id, name"),
  ]);
  if (listResult.error) throw new Error(listResult.error.message);
  if (selectedResult.error) throw new Error(selectedResult.error.message);

  const branchMap = new Map((branches ?? []).map((branch) => [branch.id, branch.name]));
  const rows = listResult.data ?? [];
  const selected = selectedResult.data;
  const pagination = createAdminPagination(listResult.count ?? 0, page, ADMIN_PAGE_SIZE);
  const retentionDue = selected
    ? new Date(selected.retention_until).getTime() <= requestTime
    : false;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Kişisel veri · Admin erişimi</p>
          <h1>Kariyer başvuruları<span>.</span></h1>
          <p>Başvuruları değerlendir, retention tarihini izle; arşivlenmiş kayıtlarda CV silme ve geri döndürülemez anonimleştirme akışını yönet.</p>
        </div>
      </div>

      {firstString(params.notice) ? <p className={styles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={styles.error}>{firstString(params.error)}</p> : null}

      <form className={styles.search} method="get">
        <input defaultValue={q} name="q" placeholder="Ad, e-posta veya telefon ara…" type="search" />
        <select defaultValue={statusFilter} name="status">
          <option value="all">Tüm durumlar</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select defaultValue={privacyFilter} name="privacy">
          <option value="all">Tüm veri durumları</option>
          <option value="due">Retention süresi dolanlar</option>
          {Object.entries(privacyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className={styles.secondary} type="submit">Filtrele</button>
      </form>

      <div className={`${styles.layout} ${selected ? styles.layoutWithEditor : ""}`}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}><h2>Başvurular</h2><span>{rows.length} / {pagination.total} kayıt</span></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Aday</th><th>Alan</th><th>Şube</th><th>Durum</th><th>Veri yaşam döngüsü</th><th>Tarih</th><th>İşlem</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.privacy_status === "anonymized" ? "Anonimleştirilmiş başvuru" : row.full_name}</strong>
                      {row.privacy_status !== "anonymized" ? <><br /><small>{row.email}<br />{row.phone}</small></> : null}
                    </td>
                    <td>{departmentLabels[row.department] ?? row.department}<br /><small>{row.employment_type === "full_time" ? "Tam zamanlı" : "Yarı zamanlı"}</small></td>
                    <td>{row.is_branch_flexible ? "Fark etmez" : branchMap.get(row.preferred_branch_id ?? "") ?? "—"}</td>
                    <td>{statusLabels[row.status] ?? row.status}</td>
                    <td>{privacyLabels[row.privacy_status] ?? row.privacy_status}<br /><small>Retention: {formatAdminDate(row.retention_until)}</small></td>
                    <td>{formatAdminDate(row.created_at)}</td>
                    <td><Link href={`/admin/applications?edit=${row.id}`}>İncele</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            basePath="/admin/applications"
            pagination={pagination}
            query={{
              q: q || undefined,
              status: statusFilter === "all" ? undefined : statusFilter,
              privacy: privacyFilter === "all" ? undefined : privacyFilter,
            }}
          />
        </div>

        {selected ? (
          <aside className={`${styles.panel} ${styles.editorPanel}`}>
            <div className={styles.panelTitle}>
              <h2>{selected.privacy_status === "anonymized" ? "Anonimleştirilmiş başvuru" : selected.full_name}</h2>
              <Link href="/admin/applications">Kapat</Link>
            </div>

            <p className={retentionDue && selected.privacy_status === "active" ? styles.error : styles.notice}>
              {privacyLabels[selected.privacy_status]} · Retention tarihi: {formatAdminDate(selected.retention_until)}
              {retentionDue && selected.privacy_status === "active" ? " · İnceleme süresi doldu." : ""}
            </p>

            {selected.anonymization_error ? (
              <p className={styles.error}>Son anonimleştirme denemesi: {selected.anonymization_error}</p>
            ) : null}

            {selected.privacy_status !== "anonymized" ? (
              <dl style={{ display: "grid", gap: 12, margin: "0 0 22px" }}>
                <div><dt><strong>İletişim</strong></dt><dd style={{ margin: 0 }}>{selected.email}<br />{selected.phone}</dd></div>
                <div><dt><strong>Şube / alan</strong></dt><dd style={{ margin: 0 }}>{selected.is_branch_flexible ? "Fark etmez" : branchMap.get(selected.preferred_branch_id ?? "") ?? "—"} · {departmentLabels[selected.department]}</dd></div>
                <div><dt><strong>Vardiya</strong></dt><dd style={{ margin: 0 }}>{selected.shift_preference === "morning" ? "Sabah" : selected.shift_preference === "evening" ? "Akşam" : "Esnek"}</dd></div>
                <div><dt><strong>Uygun günler</strong></dt><dd style={{ margin: 0 }}>{selected.availability_days.map((day) => dayLabels[day] ?? day).join(", ") || "Anonimleştirme için temizlendi"}</dd></div>
                <div><dt><strong>Deneyim</strong></dt><dd style={{ margin: 0 }}>{selected.experience || "Belirtilmedi"}</dd></div>
                <div><dt><strong>Kendini tanıtma</strong></dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.introduction}</dd></div>
              </dl>
            ) : (
              <p className={styles.notice}>
                Kişisel alanlar, teknik parmak izleri, admin notu ve CV kalıcı olarak temizlendi. Bu işlem geri alınamaz.
              </p>
            )}

            {selected.privacy_status === "active" && selected.cv_media_id ? (
              <a className={styles.primary} href={`/api/admin/applications/${selected.id}/cv`} rel="noreferrer" target="_blank">CV dosyasını güvenli indir</a>
            ) : null}

            {selected.privacy_status === "active" ? (
              <form action={updateApplicationAction} className={styles.form} style={{ marginTop: 22 }}>
                <input name="id" type="hidden" value={selected.id} />
                <label className={styles.field}><span>Başvuru durumu</span><select defaultValue={selected.status} name="status" required>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className={styles.field}><span>Admin notu</span><textarea defaultValue={selected.admin_notes ?? ""} maxLength={5000} name="admin_notes" rows={8} /></label>
                <button className={styles.primary} type="submit">Başvuruyu güncelle</button>
              </form>
            ) : null}

            {selected.privacy_status === "active" && selected.status !== "archived" ? (
              <p className={styles.notice} style={{ marginTop: 22 }}>
                Anonimleştirme için önce başvuru durumunu Arşiv yap ve kaydet.
              </p>
            ) : null}

            {(selected.privacy_status === "anonymization_pending" ||
              (selected.privacy_status === "active" && selected.status === "archived")) ? (
              <>
                <form action={anonymizeApplicationAction} className={styles.form} style={{ marginTop: 22 }}>
                  <input name="id" type="hidden" value={selected.id} />
                  <input name="_intent" type="hidden" value="dry_run" />
                  <button className={styles.secondary} type="submit">Dry-run kontrolü yap</button>
                  <small>DB veya Storage değiştirmeden arşiv durumu ve CV medya bağlantısı kontrol edilir.</small>
                </form>

                <form action={anonymizeApplicationAction} className={styles.form} style={{ marginTop: 12 }}>
                  <input name="id" type="hidden" value={selected.id} />
                  <label className={styles.field}>
                    <span>Geri döndürülemez işlem onayı</span>
                    <input
                      autoComplete="off"
                      name="confirmation"
                      pattern="ANONIMLESTIR"
                      placeholder="ANONIMLESTIR"
                      required
                    />
                    <small>Private CV Storage dosyası silinir; kişisel alanlar ve admin notu anonimleştirilir.</small>
                  </label>
                  <ConfirmSubmitButton
                    className={styles.danger}
                    confirmMessage="CV kalıcı olarak silinsin ve aday verisi geri döndürülemez biçimde anonimleştirilsin mi?"
                    type="submit"
                  >
                    {selected.privacy_status === "anonymization_pending" ? "Anonimleştirmeyi sürdür" : "CV'yi sil ve anonimleştir"}
                  </ConfirmSubmitButton>
                </form>
              </>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
