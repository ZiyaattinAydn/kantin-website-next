import MenuCard from "@/components/cards/MenuCard";
import { PublicEmptyState } from "@/components/data-state/PublicDataNotice";
import SectionHeader from "@/components/ui/SectionHeader";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";
import type { HomeMenuBranch } from "@/types/content";

export default function HomeMenuBranches({
  branches = fallbackHomeData.menuBranches,
}: {
  branches?: HomeMenuBranch[];
}) {
  return (
    <section className="section section-blue" id="menuler">
      <div className="container">
        <SectionHeader
          className="branch-menu-heading"
          eyebrow="Yanlış şubeye yanlış menü yok"
          layout="heading"
          light
          title={
            <>
              Önce şubeni seç.
              <br />
              Sonra canının çektiğine bak.
            </>
          }
        />

        {branches.length ? (
          <div className="home-menu-branches">
            {branches.map((branch) => (
              <MenuCard key={branch.slug} branch={branch} />
            ))}
          </div>
        ) : (
          <PublicEmptyState
            title="Şube menüleri şu anda yayında değil."
            description="Aktif menü kartları yayınlandığında burada görünecek."
          />
        )}
      </div>
    </section>
  );
}
