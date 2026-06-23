import PublicPageShell from "@/components/layout/PublicPageShell";
import MenuPageClient from "@/components/menu/MenuPageClient";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getMenuMerchPublicData } from "@/lib/public-data/merch";
import { getMenuPublicData } from "@/lib/public-data/menu";
import { getPagePublicMetadata } from "@/lib/public-data/metadata";

export function generateMetadata() {
  return getPagePublicMetadata("menu", {
    title: "Şube Menüleri",
    description: "Kantin şubelerine özel güncel menüler.",
    canonical: "/menu",
  });
}

export const dynamic = "force-dynamic";

type MenuPageProps = {
  searchParams: Promise<{ sube?: string | string[] }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [params, common, menu, merch] = await Promise.all([
    searchParams,
    getCommonPublicData(),
    getMenuPublicData(),
    getMenuMerchPublicData(),
  ]);
  const requestedBranch = Array.isArray(params.sube) ? params.sube[0] : params.sube;
  const availableBranches = new Set(
    menu.data.branchOptions.map((branch) => branch.id),
  );
  const initialBranch =
    requestedBranch && availableBranches.has(requestedBranch)
      ? requestedBranch
      : menu.data.branchOptions[0]?.id ?? "alsancak";

  return (
    <PublicPageShell common={common} issues={[...menu.issues, ...merch.issues]}>
      <MenuPageClient
        initialBranch={initialBranch}
        data={menu.data}
        merchProducts={merch.data.merchProducts}
        merchBundles={merch.data.merchBundles}
        merchDoodles={merch.data.merchDoodles}
      />
    </PublicPageShell>
  );
}
