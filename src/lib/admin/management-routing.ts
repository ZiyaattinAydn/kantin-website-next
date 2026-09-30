import { isUuid } from "./pricing";
export function managementDestination(
  resource: string,
  query: Record<string, string | undefined>,
  ownerId?: string,
): string | null {
  const edit = isUuid(query.edit) ? query.edit : undefined;
  const q = new URLSearchParams();
  for (const key of ["q", "branch", "category"])
    if (query[key]) q.set(key, query[key]!.slice(0, 200));
  if (
    [
      "menu-categories",
      "menu-category-branches",
      "menu-items",
      "menu-item-branches",
      "menu-item-variants",
    ].includes(resource)
  ) {
    if (
      resource === "menu-categories" ||
      resource === "menu-category-branches"
    ) {
      if (edit && ownerId !== "") q.set("categoryEdit", ownerId ?? edit);
      else if (query.new === "1") q.set("categoryEdit", "new");
    } else if (edit && ownerId !== "") q.set("edit", ownerId ?? edit);
    else if (query.new === "1") q.set("new", "1");
    return `/admin/menu${q.size ? `?${q}` : ""}`;
  }
  if (["site-pages", "content-blocks", "site-settings"].includes(resource)) {
    if (edit) q.set("record", edit);
    if (query.section) q.set("section", query.section);
    return `/admin/site${q.size ? `?${q}` : ""}`;
  }
  if (resource === "event-branches")
    return ownerId
      ? `/admin/manage/events?edit=${ownerId}`
      : "/admin/manage/events";
  if (resource === "merch-product-branches")
    return ownerId
      ? `/admin/manage/merch-products?edit=${ownerId}`
      : "/admin/manage/merch-products";
  return null;
}
