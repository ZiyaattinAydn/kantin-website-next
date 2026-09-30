const KEYS = [
  "q",
  "page",
  "status",
  "privacy",
  "branch",
  "category",
  "visibility",
  "tab",
  "section",
  "from",
  "to",
  "level",
  "user",
  "route",
  "operation",
  "code",
  "resolved",
];
export function preserveAdminListPath(
  destination: string,
  returnTo: unknown,
): string {
  if (
    typeof returnTo !== "string" ||
    !returnTo.startsWith("/admin/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\")
  )
    return destination;
  try {
    const target = new URL(destination, "https://admin.invalid"),
      source = new URL(returnTo, "https://admin.invalid");
    if (
      target.origin !== source.origin ||
      (![
        "/admin/media",
        "/admin/applications",
        "/admin/menu",
        "/admin/site",
        "/admin/theme",
        "/admin/logs",
      ].includes(target.pathname) &&
        !/^\/admin\/manage\/[a-z-]+$/.test(target.pathname))
    )
      return destination;
    if (
      source.pathname !== target.pathname &&
      !(target.pathname === "/admin/theme" && source.pathname === "/admin/site")
    ) {
      if (
        /^\/admin\/manage\/(menu-items|menu-categories|site-pages|site-settings|content-blocks)$/.test(
          target.pathname,
        ) &&
        ["/admin/menu", "/admin/site"].includes(source.pathname)
      )
        target.pathname = source.pathname;
      else return destination;
    }
    if (target.pathname === "/admin/theme" && source.pathname === "/admin/site")
      target.pathname = "/admin/site";
    for (const key of KEYS) {
      const value = source.searchParams.get(key);
      if (value !== null && value.length <= 200)
        target.searchParams.set(key, value);
    }
    if (target.searchParams.has("notice")) {
      target.searchParams.delete("edit");
      target.searchParams.delete("new");
      target.hash = "";
    }
    return target.pathname + target.search + target.hash;
  } catch {
    return destination;
  }
}
