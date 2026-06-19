import type { Metadata } from "next";
import HomeEvents from "@/components/home/HomeEvents";
import HomeHero from "@/components/home/HomeHero";
import HomeLocations from "@/components/home/HomeLocations";
import HomeMenuBranches from "@/components/home/HomeMenuBranches";
import HomeMerchDrop from "@/components/home/HomeMerchDrop";
import PublicPageShell from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "kantin. — Savor the sip. Share the bite.",
};

export default function HomePage() {
  return (
    <PublicPageShell>
      <HomeHero />
      <HomeMenuBranches />
      <HomeMerchDrop />
      <HomeEvents />
      <HomeLocations />
    </PublicPageShell>
  );
}
