import AmbientDoodles from "@/components/effects/AmbientDoodles";
import LocationCard from "./LocationCard";
import { locationBranches } from "@/content/home";
import { siteIdentity } from "@/content/site";

export default function HomeLocations() {
  return (
    <section className="section dotted-paper" id="subeler">
      <AmbientDoodles />
      <div className="container">
        <div className="section-header reveal">
          <div>
            <p className="eyebrow">Adres net, menü net</p>
            <h2>Şubeler</h2>
          </div>
        </div>

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
