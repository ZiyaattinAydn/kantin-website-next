import CareersPage from "@/components/careers/CareersPage";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getPagePublicMetadata } from "@/lib/public-data/metadata";

export function generateMetadata() {
  return getPagePublicMetadata("careers", {
    title: "Ekibe Katıl",
    description:
      "Kantin şubeleri için servis, mutfak, bar ve kasa ekip başvurusu.",
    canonical: "/careers",
  });
}

export const dynamic = "force-dynamic";

export default async function CareersRoute() {
  const common = await getCommonPublicData();
  const branchOptions = [
    ...common.data.branches.map((branch) => ({
      id: branch.id,
      label: branch.name,
    })),
    { id: "either", label: "Fark etmez" },
  ];

  return (
    <PublicPageShell common={common}>
      <CareersPage branchOptions={branchOptions} />
    </PublicPageShell>
  );
}
