import CareersPage from "@/components/careers/CareersPage";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getPagePublicMetadata } from "@/lib/public-data/metadata";

export function generateMetadata() {
  return getPagePublicMetadata("careers", {
    title: "Ekibe Katıl",
    description:
      "Kantin Alsancak ve Atakent şubeleri için servis, mutfak, bar ve kasa ekip başvurusu.",
    canonical: "/careers",
  });
}

export default function CareersRoute() {
  return (
    <PublicPageShell>
      <CareersPage />
    </PublicPageShell>
  );
}
