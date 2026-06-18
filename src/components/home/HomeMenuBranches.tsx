import HomeMenuBranchCard from "./HomeMenuBranchCard";
import { homeMenuBranches } from "@/content/home";

export default function HomeMenuBranches() {
  return (
    <section className="section section-blue">
      <div className="container">
        <div className="section-heading reveal branch-menu-heading">
          <p className="eyebrow eyebrow-light">Yanlış şubeye yanlış menü yok</p>
          <h2>
            Önce şubeni seç.
            <br />
            Sonra canının çektiğine bak.
          </h2>
        </div>

        <div className="home-menu-branches">
          {homeMenuBranches.map((branch) => (
            <HomeMenuBranchCard key={branch.slug} branch={branch} />
          ))}
        </div>
      </div>
    </section>
  );
}
