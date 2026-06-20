import AmbientDoodles from "@/components/effects/AmbientDoodles";
import { PublicEmptyState } from "@/components/data-state/PublicDataNotice";
import SectionHeader from "@/components/ui/SectionHeader";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";
import type { InstagramPost, LocationBranch } from "@/types/content";
import LocationCard from "./LocationCard";
import HomeInstagramStrip from "./HomeInstagramStrip";

export default function HomeLocations({
  branches = fallbackHomeData.locationBranches,
  instagramPosts = fallbackHomeData.instagramPosts,
  instagramUrl = "https://www.instagram.com/kantinizmir/",
  showInstagram = true,
}: {
  branches?: LocationBranch[];
  instagramPosts?: InstagramPost[];
  instagramUrl?: string;
  showInstagram?: boolean;
}) {
  return (
    <section className="section dotted-paper" id="subeler">
      <AmbientDoodles />
      <div className="container">
        <SectionHeader eyebrow="Adres net, menü net" title="Şubeler" />

        {branches.length ? (
          <div className="branch-grid">
            {branches.map((branch) => (
              <LocationCard key={branch.slug} branch={branch} />
            ))}
          </div>
        ) : (
          <PublicEmptyState
            title="Aktif şube bulunmuyor."
            description="Yayınlanan şubeler ve yol tarifi bağlantıları burada görünecek."
          />
        )}

        {showInstagram ? (
          <HomeInstagramStrip posts={instagramPosts} instagramUrl={instagramUrl} />
        ) : null}
      </div>
    </section>
  );
}
