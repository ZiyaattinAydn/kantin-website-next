import { redirect } from "next/navigation";
export default async function PricingRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const q = new URLSearchParams();
  for (const key of ["q", "branch", "category"]) if (p[key]) q.set(key, p[key]);
  if (p.edit) q.set("priceEdit", p.edit);
  redirect(`/admin/menu${q.size ? `?${q}` : ""}`);
}
