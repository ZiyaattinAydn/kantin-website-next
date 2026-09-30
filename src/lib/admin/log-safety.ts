import { isUuid } from "./pricing";
export const LOG_LEVELS = ["info", "warning", "error", "critical"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
export const LOG_CODES = [
  "23505",
  "23503",
  "23514",
  "22P02",
  "22023",
  "40001",
  "42501",
  "PGRST202",
  "PGRST205",
  "NETWORK",
  "VALIDATION",
  "UNKNOWN",
] as const;
const messages: Record<string, string> = {
  "23505": "Unique constraint conflict",
  "23503": "Related record missing or referenced",
  "23514": "Check constraint rejected change",
  "22P02": "Invalid typed value",
  "22023": "Invalid operation parameters",
  "40001": "Concurrent change; reload required",
  "42501": "Permission check rejected operation",
  PGRST202: "Required database function unavailable",
  PGRST205: "Required database table unavailable",
  NETWORK: "Database connection failed",
  VALIDATION: "Input validation failed",
  UNKNOWN: "Operation failed; raw details omitted",
};
export const LOG_OPERATIONS = [
  "read",
  "save",
  "create",
  "update",
  "archive",
  "delete",
  "restore",
  "reorder",
  "resolve",
  "upload",
  "anonymize",
] as const;
export const LOG_ENTITIES = [
  "menu_items",
  "menu_item_branches",
  "menu_item_variants",
  "menu_categories",
  "menu_category_branches",
  "events",
  "event_branches",
  "merch_products",
  "merch_product_branches",
  "instagram_posts",
  "site_pages",
  "content_blocks",
  "site_settings",
  "branches",
  "media",
  "job_applications",
  "system",
] as const;
export function safeLogRoute(value: string): string {
  const path = value.split(/[?#]/)[0];
  return /^\/admin(?:\/(?:menu|site|content|pricing|theme|media|applications|logs|search|manage\/(?:menu-categories|menu-category-branches|menu-items|menu-item-branches|menu-item-variants|events|event-branches|merch-products|merch-product-branches|instagram-posts|site-pages|content-blocks|site-settings|branches)))?$/.test(
    path,
  )
    ? path
    : "/admin";
}
export function sanitizeSystemEvent(input: {
  actorId?: string | null;
  route: string;
  operation: string;
  entityType?: string;
  entityId?: string | null;
  level?: LogLevel;
  error?: unknown;
  requestId?: string;
}) {
  const error =
    input.error && typeof input.error === "object"
      ? (input.error as {
          code?: unknown;
          databaseCode?: unknown;
          name?: unknown;
        })
      : {};
  const code =
    LOG_CODES.find((c) => c === (error.databaseCode ?? error.code)) ??
    (["MenuValidationError", "AdminValidationError"].includes(
      String(error.name),
    )
      ? "VALIDATION"
      : "UNKNOWN");
  return {
    actor_id: isUuid(input.actorId) ? input.actorId : null,
    route: safeLogRoute(input.route),
    operation: LOG_OPERATIONS.find((o) => o === input.operation) ?? "save",
    entity_type: LOG_ENTITIES.find((e) => e === input.entityType) ?? "system",
    entity_id: isUuid(input.entityId) ? input.entityId : null,
    level:
      LOG_LEVELS.find((l) => l === input.level) ??
      (code === "VALIDATION" ? "warning" : "error"),
    error_code: code,
    technical_message: messages[code],
    request_id: isUuid(input.requestId)
      ? input.requestId!
      : crypto.randomUUID(),
    safe_detail: {
      retryable: ["40001", "NETWORK"].includes(code),
      source: "admin",
    },
  };
}

export function safeSystemLogView(row: Record<string, unknown>) {
  const safe = sanitizeSystemEvent({
    actorId: typeof row.actor_id === "string" ? row.actor_id : null,
    route: String(row.route ?? ""),
    operation: String(row.operation ?? ""),
    entityType: String(row.entity_type ?? ""),
    entityId: typeof row.entity_id === "string" ? row.entity_id : null,
    level: row.level as LogLevel,
    error: { code: row.error_code },
    requestId: typeof row.request_id === "string" ? row.request_id : undefined,
  });
  return {
    ...safe,
    id: typeof row.id === "string" && isUuid(row.id) ? row.id : "",
    created_at:
      typeof row.created_at === "string" &&
      Number.isFinite(Date.parse(row.created_at))
        ? row.created_at
        : "",
    resolved_at:
      typeof row.resolved_at === "string" &&
      Number.isFinite(Date.parse(row.resolved_at))
        ? row.resolved_at
        : null,
    request_id:
      typeof row.request_id === "string" && isUuid(row.request_id)
        ? row.request_id
        : "",
  };
}
export function systemLogSearch(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z0-9_ /:-]{1,100}$/.test(value)
    ? value.trim()
    : "";
}
