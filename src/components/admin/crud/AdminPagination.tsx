import Link from "next/link";
import type { AdminPagination as PaginationData } from "@/lib/admin/pagination";
import styles from "./AdminResource.module.css";

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `${basePath}${search ? `?${search}` : ""}`;
}

export default function AdminPagination({
  basePath,
  pagination,
  query = {},
}: {
  basePath: string;
  pagination: PaginationData;
  query?: Record<string, string | undefined>;
}) {
  if (pagination.pageCount <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Liste sayfaları">
      {pagination.page > 1 ? (
        <Link href={pageHref(basePath, pagination.page - 1, query)}>← Önceki</Link>
      ) : <span />}
      <strong>{pagination.page} / {pagination.pageCount}</strong>
      {pagination.page < pagination.pageCount ? (
        <Link href={pageHref(basePath, pagination.page + 1, query)}>Sonraki →</Link>
      ) : <span />}
    </nav>
  );
}
