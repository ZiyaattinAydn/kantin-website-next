import AmbientDoodles from "@/components/effects/AmbientDoodles";
import SectionHeader from "@/components/ui/SectionHeader";
import { locationBranches } from "@/data/home";
import LocationCard from "./LocationCard";
import HomeInstagramStrip from "./HomeInstagramStrip";

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

        <HomeInstagramStrip />
      </div>
    </section>
  );
}
