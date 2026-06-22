import { Fragment } from "react";
import HomeEvents from "@/components/home/HomeEvents";
import HomeHero from "@/components/home/HomeHero";
import HomeLocations from "@/components/home/HomeLocations";
import HomeMenuBranches from "@/components/home/HomeMenuBranches";
import HomeMemories from "@/components/home/HomeMemories";
import HomeMerchDrop from "@/components/home/HomeMerchDrop";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getHomePublicData } from "@/lib/public-data/home";
import { getPagePublicMetadata } from "@/lib/public-data/metadata";

export function generateMetadata() {
  return getPagePublicMetadata("home", {
    title: "kantin. — Savor the sip. Share the bite.",
    canonical: "/",
  });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [common, home] = await Promise.all([
    getCommonPublicData(),
    getHomePublicData(),
  ]);
  const visibility = common.data.sectionVisibility;

  const sections = {
    menu: visibility.menu ? (
      <HomeMenuBranches branches={home.data.menuBranches} />
    ) : null,
    merch: visibility.merch ? (
      <HomeMerchDrop
        products={home.data.merchProducts}
        bundles={home.data.merchBundles}
        doodles={home.data.merchDoodles}
      />
    ) : null,
    memories: visibility.memories ? (
      <HomeMemories
        section={home.data.memoriesSection}
        photos={home.data.memoryPhotos}
      />
    ) : null,
    events: visibility.events ? <HomeEvents data={home.data.eventData} /> : null,
    branches: visibility.branches ? (
      <HomeLocations
        branches={home.data.locationBranches}
        instagramPosts={home.data.instagramPosts}
        instagramUrl={common.data.siteIdentity.instagramUrl}
        showInstagram={visibility.instagram}
      />
    ) : null,
  } as const;

  return (
    <PublicPageShell common={common} issues={home.issues}>
      {visibility.homeHero ? <HomeHero data={home.data.hero} /> : null}
      {common.data.themeSettings.homeSectionOrder.map((section) => (
        <Fragment key={section}>{sections[section]}</Fragment>
      ))}
    </PublicPageShell>
  );
}
