import { NextResponse } from "next/server";
import { getCommonPublicData } from "@/lib/public-data/common";
import { getEventPublicData } from "@/lib/public-data/events";
import { getHomePublicData } from "@/lib/public-data/home";
import { getMenuPublicData } from "@/lib/public-data/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const [common, menu, home, events] = await Promise.all([
      getCommonPublicData(),
      getMenuPublicData(),
      getHomePublicData(),
      getEventPublicData(),
    ]);

    const sources = {
      common: common.source,
      menu: menu.source,
      home: home.source,
      events: events.source,
    } as const;
    const degraded = Object.values(sources).some(
      (source) => source === "fallback",
    );

    return NextResponse.json(
      {
        ok: !degraded,
        degraded,
        checkedAt,
        sources,
        counts: {
          branches: common.data.branches.length,
          menuSections: [
            menu.data.alsancakDraftBeers,
            menu.data.alsancakBottleBeers,
            menu.data.alsancakDeliItems,
            menu.data.beerSalads,
            menu.data.alsancakFryerItems,
            menu.data.alsancakOvenItems,
            ...menu.data.coffeeGroups.map((group) => group.items),
            menu.data.atakentDraftBeers,
            menu.data.atakentBubbleCocktails,
            menu.data.atakentHouseCocktails,
            menu.data.atakentBottleBeers,
            menu.data.atakentWines,
            menu.data.atakentHotItems,
            menu.data.atakentGrillItems,
          ].filter((section) => section.length > 0).length,
          merchProducts: home.data.merchProducts.length,
          merchBundles: home.data.merchBundles.length,
          instagramPosts: home.data.instagramPosts.length,
          events: events.data.events.length,
        },
        issues: [
          ...common.issues,
          ...menu.issues,
          ...home.issues,
          ...events.issues,
        ].map(() => "Bir canlı veri kaynağı yerel fallback ile yanıt verdi."),
      },
      {
        status: degraded ? 503 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        degraded: true,
        checkedAt,
        error: "Public veri sağlık kontrolü tamamlanamadı.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
