import type { Metadata } from "next";
import PublicPageShell from "@/components/layout/PublicPageShell";
import MenuPageClient from "@/components/menu/MenuPageClient";

export const metadata: Metadata = {
  title: "Şube Menüleri",
  description: "Kantin Alsancak ve Atakent şubelerine özel menüler.",
};

type MenuPageProps = {
  searchParams: Promise<{ sube?: string | string[] }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const requestedBranch = Array.isArray(params.sube) ? params.sube[0] : params.sube;
  const initialBranch = requestedBranch === "atakent" ? "atakent" : "alsancak";

  return (
    <PublicPageShell>
      <MenuPageClient initialBranch={initialBranch} />
    </PublicPageShell>
  );
}
