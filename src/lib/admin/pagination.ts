export const ADMIN_PAGE_SIZE = 25;
const ADMIN_SEARCH_MAX_LENGTH = 100;

export type AdminPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export function parseAdminPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function normaliseAdminSearch(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/[,%_().]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ADMIN_SEARCH_MAX_LENGTH);
}

export function adminPageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function createAdminPagination(
  total: number,
  requestedPage: number,
  pageSize = ADMIN_PAGE_SIZE,
): AdminPagination {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return {
    page: Math.min(requestedPage, pageCount),
    pageSize,
    pageCount,
    total,
  };
}
