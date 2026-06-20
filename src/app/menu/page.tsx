import type { Metadata } from "next";
import PublicPageShell from "@/components/layout/PublicPageShell";
import MenuPageClient from "@/components/menu/MenuPageClient";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getHomePublicData } from "@/lib/public-data/home";
import { getMenuPublicData } from "@/lib/public-data/menu";

export const metadata: Metadata = {
  title: "Şube Menüleri",
  description: "Kantin Alsancak ve Atakent şubelerine özel menüler.",
  alternates: { canonical: "/menu" },
};

export const dynamic = "force-dynamic";

type MenuPageProps = {
  searchParams: Promise<{ sube?: string | string[] }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [params, common, menu, home] = await Promise.all([
    searchParams,
    getCommonPublicData(),
    getMenuPublicData(),
    getHomePublicData(),
  ]);
  const requestedBranch = Array.isArray(params.sube) ? params.sube[0] : params.sube;
  const initialBranch = requestedBranch === "atakent" ? "atakent" : "alsancak";

  return (
    <PublicPageShell common={common} issues={[...menu.issues, ...home.issues]}>
      <MenuPageClient
        initialBranch={initialBranch}
        data={menu.data}
        merchProducts={home.data.merchProducts}
        merchBundles={home.data.merchBundles}
        merchDoodles={home.data.merchDoodles}
      />
    </PublicPageShell>
  );
}
