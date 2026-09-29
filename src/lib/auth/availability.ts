// This fallback also works before a database connection or identity is available.
// Never pass the exception, claims, cookies, credentials or request query here.
export function reportAuthUnavailable(route: "proxy" | "access") {
  console.error("admin_auth_unavailable", JSON.stringify({
    route,
    operation: "authenticate",
    level: "error",
    error_code: "AUTH_UNAVAILABLE",
    technical_message: "Admin authentication service unavailable",
    request_id: crypto.randomUUID(),
  }));
}
