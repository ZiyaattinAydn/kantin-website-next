import AmbientDoodles from "@/components/effects/AmbientDoodles";
import SectionHeader from "@/components/ui/SectionHeader";
import { locationBranches } from "@/data/home";
import { siteIdentity } from "@/data/site";
import LocationCard from "./LocationCard";

export default function HomeLocations() {
  return (
    <section className="section dotted-paper" id="subeler">
      <AmbientDoodles />
      <div className="container">
        <SectionHeader eyebrow="Adres net, menü net" title="Şubeler" />

        <div className="branch-grid">
          {locationBranches.map((branch) => (
            <LocationCard key={branch.slug} branch={branch} />
          ))}
        </div>

        <div className="instagram-strip reveal">
          <div>
            <p className="eyebrow">Güncel saatler ve duyurular</p>
            <h3>@kantinizmir</h3>
          </div>
          <a
            className="button button-primary"
            href={siteIdentity.instagramUrl}
            rel="noopener"
            target="_blank"
          >
            Instagram’a git ↗
          </a>
        </div>
      </div>
    </section>
  );
}
