import Link from "next/link";
import styles from "@/components/admin/crud/AdminResource.module.css";
import { updateApplicationAction } from "@/lib/admin/application-actions";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    edit?: string | string[];
    q?: string | string[];
    status?: string | string[];
    notice?: string | string[];
    error?: string | string[];
  }>;
};

const statusLabels: Record<string, string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  contacted: "İletişime geçildi",
  rejected: "Olumsuz",
  hired: "İşe alındı",
  archived: "Arşiv",
};

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

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const editId = firstString(params.edit);
  const q = firstString(params.q)?.toLocaleLowerCase("tr-TR") ?? "";
  const statusFilter = firstString(params.status) ?? "all";
  const supabase = await createClient();

  const [{ data: applications, error }, { data: branches }] = await Promise.all([
    supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("branches").select("id, name"),
  ]);
  if (error) throw new Error(error.message);

  const branchMap = new Map((branches ?? []).map((branch) => [branch.id, branch.name]));
  const rows = (applications ?? []).filter((row) => {
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    const matchesSearch = !q || [row.full_name, row.email, row.phone].some((value) => value.toLocaleLowerCase("tr-TR").includes(q));
    return matchesStatus && matchesSearch;
  });
  const selected = editId ? (applications ?? []).find((row) => row.id === editId) ?? null : null;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Kişisel veri · Admin erişimi</p>
          <h1>Kariyer başvuruları<span>.</span></h1>
          <p>Başvuruları değerlendir, durum ve admin notu ekle; CV dosyasını private signed URL üzerinden indir.</p>
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
        <button className={styles.secondary} type="submit">Filtrele</button>
      </form>

      <div className={`${styles.layout} ${selected ? styles.layoutWithEditor : ""}`}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}><h2>Başvurular</h2><span>{rows.length} kayıt</span></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Aday</th><th>Alan</th><th>Şube</th><th>Durum</th><th>Tarih</th><th>İşlem</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.full_name}</strong><br /><small>{row.email}<br />{row.phone}</small></td>
                    <td>{departmentLabels[row.department] ?? row.department}<br /><small>{row.employment_type === "full_time" ? "Tam zamanlı" : "Yarı zamanlı"}</small></td>
                    <td>{row.is_branch_flexible ? "Fark etmez" : branchMap.get(row.preferred_branch_id ?? "") ?? "—"}</td>
                    <td>{statusLabels[row.status] ?? row.status}</td>
                    <td>{formatAdminDate(row.created_at)}</td>
                    <td><Link href={`/admin/applications?edit=${row.id}`}>İncele</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <aside className={`${styles.panel} ${styles.editorPanel}`}>
            <div className={styles.panelTitle}><h2>{selected.full_name}</h2><Link href="/admin/applications">Kapat</Link></div>
            <dl style={{ display: "grid", gap: 12, margin: "0 0 22px" }}>
              <div><dt><strong>İletişim</strong></dt><dd style={{ margin: 0 }}>{selected.email}<br />{selected.phone}</dd></div>
              <div><dt><strong>Şube / alan</strong></dt><dd style={{ margin: 0 }}>{selected.is_branch_flexible ? "Fark etmez" : branchMap.get(selected.preferred_branch_id ?? "") ?? "—"} · {departmentLabels[selected.department]}</dd></div>
              <div><dt><strong>Vardiya</strong></dt><dd style={{ margin: 0 }}>{selected.shift_preference === "morning" ? "Sabah" : selected.shift_preference === "evening" ? "Akşam" : "Esnek"}</dd></div>
              <div><dt><strong>Uygun günler</strong></dt><dd style={{ margin: 0 }}>{selected.availability_days.map((day) => dayLabels[day] ?? day).join(", ")}</dd></div>
              <div><dt><strong>Deneyim</strong></dt><dd style={{ margin: 0 }}>{selected.experience || "Belirtilmedi"}</dd></div>
              <div><dt><strong>Kendini tanıtma</strong></dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.introduction}</dd></div>
            </dl>

            <a className={styles.primary} href={`/api/admin/applications/${selected.id}/cv`} rel="noreferrer" target="_blank">CV dosyasını güvenli indir</a>

            <form action={updateApplicationAction} className={styles.form} style={{ marginTop: 22 }}>
              <input name="id" type="hidden" value={selected.id} />
              <label className={styles.field}><span>Başvuru durumu</span><select defaultValue={selected.status} name="status" required>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className={styles.field}><span>Admin notu</span><textarea defaultValue={selected.admin_notes ?? ""} maxLength={5000} name="admin_notes" rows={8} /></label>
              <button className={styles.primary} type="submit">Başvuruyu güncelle</button>
            </form>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
