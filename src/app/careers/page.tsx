import type { Metadata } from "next";
import CareersPage from "@/components/careers/CareersPage";
import PublicPageShell from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Ekibe Katıl",
  description:
    "Kantin Alsancak ve Atakent şubeleri için servis, mutfak, bar ve kasa ekip başvurusu.",
};

export default function CareersRoute() {
  return (
    <PublicPageShell>
      <CareersPage />
    </PublicPageShell>
  );
}
