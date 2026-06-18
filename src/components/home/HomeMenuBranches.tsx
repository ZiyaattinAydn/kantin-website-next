import MenuCard from "@/components/cards/MenuCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { homeMenuBranches } from "@/data/home";

export default function HomeMenuBranches() {
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

        <div className="home-menu-branches">
          {homeMenuBranches.map((branch) => (
            <MenuCard key={branch.slug} branch={branch} />
          ))}
        </div>
      </div>
    </section>
  );
}
