import AdminDialog from "@/components/admin/ui/AdminDialog";
import CopyRequestId from "@/components/admin/ui/CopyRequestId";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  LOG_CODES,
  LOG_LEVELS,
  LOG_OPERATIONS,
  safeLogRoute,
  safeSystemLogView,
  systemLogSearch,
} from "@/lib/admin/log-safety";
import { isUuid } from "@/lib/admin/pricing";
import { resolveSystemLog } from "@/lib/admin/log-actions";
import { formatAdminDate } from "@/lib/admin/format";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export const dynamic = "force-dynamic";
function entityLink(type: string, id: string | null): string | null {
  if (!isUuid(id)) return null;
  if (type === "menu_items") return `/admin/menu?edit=${id}`;
  if (type === "job_applications") return `/admin/applications?edit=${id}`;
  if (type === "media") return `/admin/media?edit=${id}`;
  const keys: Record<string, string> = {
    menu_item_branches: "menu-item-branches",
    menu_item_variants: "menu-item-variants",
    menu_categories: "menu-categories",
    menu_category_branches: "menu-category-branches",
    events: "events",
    event_branches: "event-branches",
    merch_products: "merch-products",
    merch_product_branches: "merch-product-branches",
    instagram_posts: "instagram-posts",
    site_pages: "site-pages",
    site_settings: "site-settings",
    content_blocks: "content-blocks",
    branches: "branches",
  };
  return keys[type] ? `/admin/manage/${keys[type]}?edit=${id}` : null;
}
type LogRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  route: string;
  operation: string;
  entity_type: string;
  entity_id: string | null;
  level: string;
  error_code: string;
  technical_message: string;
  request_id: string;
  safe_detail: unknown;
  resolved_at: string | null;
};
export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const p = await searchParams;
  const c: SupabaseClient = await createClient();
  const page = Math.min(100000, Math.max(1, Number(p.page) || 1));
  const start = (Math.floor(page) - 1) * 50;
  let query = c
    .from("admin_system_logs")
    .select(
      "id,created_at,actor_id,route,operation,entity_type,entity_id,level,error_code,technical_message,request_id,safe_detail,resolved_at",
      { count: "exact" },
    );
  const date = (value: string | undefined) =>
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value))
      ? `${value}T00:00:00+03:00`
      : null;
  const from = date(p.from),
    to = date(p.to);
  if (from) query = query.gte("created_at", from);
  if (to)
    query = query.lt(
      "created_at",
      new Date(Date.parse(to) + 86400000).toISOString(),
    );
  if (LOG_LEVELS.some((v) => v === p.level))
    query = query.eq("level", p.level!);
  if (isUuid(p.user)) query = query.eq("actor_id", p.user);
  if (p.route && safeLogRoute(p.route) === p.route)
    query = query.eq("route", p.route);
  if (LOG_OPERATIONS.some((v) => v === p.operation))
    query = query.eq("operation", p.operation!);
  if (LOG_CODES.some((v) => v === p.code))
    query = query.eq("error_code", p.code!);
  if (p.resolved === "yes") query = query.not("resolved_at", "is", null);
  if (p.resolved === "no") query = query.is("resolved_at", null);
  const search = systemLogSearch(p.q);
  if (isUuid(search)) query = query.eq("request_id", search);
  else if (search)
    query = query.or(
      ["error_code", "operation", "route", "technical_message"]
        .map((field) => `${field}.ilike.%${search}%`)
        .join(","),
    );
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(start, start + 49);
  const pageHref = (n: number) => {
    const params = new URLSearchParams(
      Object.entries(p).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
    params.set("page", String(n));
    return `/admin/logs?${params}`;
  };
  return (
    <section className={styles.page}>
      <header>
        <p className="eyebrow">Teknik</p>
        <h1>Sistem Kayıtları / Teknik Loglar</h1>
        <p>
          Sistem hataları ve teknik olaylar. Kullanıcı işlemleri ana sayfadaki
          Son işlemler bölümünde tutulur.
        </p>
      </header>
      {p.notice ? <p role="status">Kayıt güncellendi.</p> : null}
      {p.error ? <p role="alert">Kayıt güncellenemedi.</p> : null}
      <form className={styles.panel} action="/admin/logs">
        <label className={styles.field}>
          Loglarda ara
          <input
            name="q"
            maxLength={100}
            placeholder="Hata kodu, işlem veya request ID"
            defaultValue={p.q}
          />
        </label>
        <div className={styles.grid}>
          <label className={styles.field}>
            Başlangıç tarihi
            <input name="from" type="date" defaultValue={p.from} />
          </label>
          <label className={styles.field}>
            Bitiş tarihi
            <input name="to" type="date" defaultValue={p.to} />
          </label>
          <label className={styles.field}>
            Hata seviyesi
            <select name="level" defaultValue={p.level ?? ""}>
              <option value="">Tümü</option>
              {LOG_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Kullanıcı ID
            <input name="user" maxLength={36} defaultValue={p.user} />
          </label>
          <label className={styles.field}>
            Ekran / route
            <input
              name="route"
              placeholder="/admin/menu"
              maxLength={100}
              defaultValue={p.route}
            />
          </label>
          <label className={styles.field}>
            İşlem türü
            <select name="operation" defaultValue={p.operation ?? ""}>
              <option value="">Tümü</option>
              {LOG_OPERATIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Hata kodu
            <select name="code" defaultValue={p.code ?? ""}>
              <option value="">Tümü</option>
              {LOG_CODES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Çözülme durumu
            <select name="resolved" defaultValue={p.resolved ?? ""}>
              <option value="">Tümü</option>
              <option value="yes">Çözüldü</option>
              <option value="no">Açık</option>
            </select>
          </label>
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Filtrele
          </button>
          <Link href="/admin/logs">Filtreleri temizle</Link>
        </div>
      </form>
      {error ? (
        <p role="alert">
          Sistem kayıtları şu anda okunamıyor. Teknik log altyapısının hazır
          olduğunu kontrol edin.
        </p>
      ) : (
        <>
          <p>{count ?? 0} kayıt · Saatler Türkiye saatidir.</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarih / saat</th>
                  <th>Seviye / kod</th>
                  <th>Ekran / işlem</th>
                  <th>Teknik açıklama</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {((data as LogRow[]) ?? [])
                  .map(safeSystemLogView)
                  .map((log) => {
                    const href = entityLink(log.entity_type, log.entity_id);
                    return (
                      <tr key={log.id}>
                        <td>{formatAdminDate(log.created_at)}</td>
                        <td>
                          <span className={styles.badge} data-level={log.level}>
                            {log.level.toUpperCase()}
                          </span>
                          <br />
                          <code>{log.error_code}</code>
                        </td>
                        <td>
                          <code>{log.route}</code>
                          <br />
                          {log.operation}
                        </td>
                        <td>
                          <AdminDialog title="Teknik kayıt ayrıntıları">
                            <summary>{log.technical_message}</summary>
                            <p>
                              Kullanıcı: <code>{log.actor_id ?? "—"}</code>
                            </p>
                            <p>
                              Entity: {log.entity_type} ·{" "}
                              <code>{log.entity_id ?? "—"}</code>
                            </p>
                            <p>
                              Request ID: <code>{log.request_id}</code>
                            </p>
                            <CopyRequestId value={log.request_id} />
                            <pre>
                              {JSON.stringify(log.safe_detail, null, 2)}
                            </pre>
                            {href ? (
                              <Link href={href}>İlgili kaydı aç</Link>
                            ) : null}
                          </AdminDialog>
                        </td>
                        <td>
                          <form action={resolveSystemLog}>
                            <input type="hidden" name="id" value={log.id} />
                            <input
                              type="hidden"
                              name="resolved"
                              value={log.resolved_at ? "false" : "true"}
                            />
                            <button type="submit">
                              {log.resolved_at
                                ? "Yeniden aç"
                                : "Çözüldü işaretle"}
                            </button>
                          </form>
                          {log.resolved_at ? (
                            <small>{formatAdminDate(log.resolved_at)}</small>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!data?.length ? <p>Bu filtrelerde kayıt yok.</p> : null}
          <div className={styles.actions}>
            {page > 1 ? (
              <Link className={styles.button} href={pageHref(page - 1)}>
                Önceki
              </Link>
            ) : null}
            {start + 50 < (count ?? 0) ? (
              <Link className={styles.button} href={pageHref(page + 1)}>
                Sonraki
              </Link>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
