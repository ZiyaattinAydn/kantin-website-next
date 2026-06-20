import type { Metadata } from "next";
import { PublicDataNotice } from "@/components/data-state/PublicDataNotice";
import HomeEvents from "@/components/home/HomeEvents";
import HomeHero from "@/components/home/HomeHero";
import HomeLocations from "@/components/home/HomeLocations";
import HomeMenuBranches from "@/components/home/HomeMenuBranches";
import HomeMemories from "@/components/home/HomeMemories";
import HomeMerchDrop from "@/components/home/HomeMerchDrop";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getHomePublicData } from "@/lib/public-data/home";

export const metadata: Metadata = {
  title: "kantin. — Savor the sip. Share the bite.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [common, home] = await Promise.all([
    getCommonPublicData(),
    getHomePublicData(),
  ]);
  const visibility = common.data.sectionVisibility;

  return (
    <PublicPageShell common={common}>
      <PublicDataNotice issues={home.issues} />
      {visibility.homeHero ? <HomeHero data={home.data.hero} /> : null}
      {visibility.menu ? (
        <HomeMenuBranches branches={home.data.menuBranches} />
      ) : null}
      {visibility.merch ? (
        <HomeMerchDrop
          products={home.data.merchProducts}
          bundles={home.data.merchBundles}
          doodles={home.data.merchDoodles}
        />
      ) : null}
      {visibility.memories ? (
        <HomeMemories
          section={home.data.memoriesSection}
          photos={home.data.memoryPhotos}
        />
      ) : null}
      {visibility.events ? <HomeEvents data={home.data.eventData} /> : null}
      {visibility.branches ? (
        <HomeLocations
          branches={home.data.locationBranches}
          instagramPosts={home.data.instagramPosts}
          instagramUrl={common.data.siteIdentity.instagramUrl}
          showInstagram={visibility.instagram}
        />
      ) : null}
    </PublicPageShell>
  );
}
