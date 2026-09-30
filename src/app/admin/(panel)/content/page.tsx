import { redirect } from "next/navigation";
export default async function ContentRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const q = new URLSearchParams(
    Object.entries(p).filter(
      (v): v is [string, string] => typeof v[1] === "string",
    ),
  );
  redirect(`/admin/site${q.size ? `?${q}` : ""}`);
}
