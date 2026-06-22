import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { fallbackMenuData } from "./fallbacks";
import {
  asRecord,
  formatTryFromCents,
  getPageBlocks,
  normaliseIssue,
  resolveMediaUrl,
  stringValue,
  type PublicMediaRow,
  type TableRow,
} from "./helpers";
import type {
  MenuItemImageData,
  MenuPublicData,
  PublicDataEnvelope,
} from "./types";
import type {
  CoffeeMenuGroup,
  CompactMenuItem,
  EditorialMenuItem,
  FoodMenuItem,
  PriceTableRow,
} from "@/types/menu";

type BranchSlug = "alsancak" | "atakent";

type MenuItemRow = Pick<
  TableRow<"menu_items">,
  | "id"
  | "category_id"
  | "slug"
  | "name"
  | "description"
  | "detail"
  | "highlight_text"
  | "allergen_text"
  | "badges"
  | "image_media_id"
  | "metadata"
  | "sort_order"
>;
type MenuItemBranchRow = Pick<
  TableRow<"menu_item_branches">,
  "id" | "menu_item_id" | "branch_id" | "price_cents" | "price_label" | "price_note" | "sort_order"
>;
type MenuItemVariantRow = Pick<
  TableRow<"menu_item_variants">,
  "menu_item_branch_id" | "label" | "price_cents" | "sort_order"
>;

type MenuEntry = {
  item: MenuItemRow;
  link: MenuItemBranchRow;
  variants: MenuItemVariantRow[];
};

export function mapMenuItemImages(
  client: Parameters<typeof resolveMediaUrl>[0],
  entries: Array<{
    item: Pick<TableRow<"menu_items">, "id" | "slug" | "name" | "image_media_id">;
    branch: BranchSlug;
  }>,
  mediaRows: PublicMediaRow[],
): MenuItemImageData[] {
  const mediaById = new Map(mediaRows.map((media) => [media.id, media]));

  return entries.flatMap(({ item, branch }) => {
    const media = item.image_media_id
      ? mediaById.get(item.image_media_id)
      : undefined;
    const imageUrl = resolveMediaUrl(client, media);
    if (!media || !imageUrl) return [];

    return [{
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      branch,
      imageUrl,
      imageAlt: media.alt_text ?? item.name,
      width: media.width ?? 960,
      height: media.height ?? 720,
    }];
  });
}

function withHighlightPlaceholder(description: string | null, highlight: string | null) {
  if (!description) return undefined;
  if (!highlight || !description.includes(highlight)) return description;
  return description.replace(highlight, "{highlight}");
}

function compactFromEntry(entry: MenuEntry): CompactMenuItem {
  if (entry.variants.length) {
    return {
      name: entry.item.name,
      detail: entry.variants.map((variant) => variant.label).join(" / "),
      price: entry.variants
        .map((variant) => formatTryFromCents(variant.price_cents))
        .join(" / "),
    };
  }

  return {
    name: entry.item.name,
    detail: entry.link.price_label ?? entry.item.detail ?? undefined,
    price: formatTryFromCents(entry.link.price_cents),
  };
}

function foodFromEntry(entry: MenuEntry): FoodMenuItem {
  const badge = entry.item.badges.find(
    (value): value is "ACILI" | "VEGAN" =>
      value === "ACILI" || value === "VEGAN",
  );

  return {
    name: entry.item.name,
    description: withHighlightPlaceholder(
      entry.item.description,
      entry.item.highlight_text,
    ),
    highlight: entry.item.highlight_text ?? undefined,
    allergens: entry.item.allergen_text ?? undefined,
    price: formatTryFromCents(entry.link.price_cents),
    priceNote: entry.link.price_note ?? undefined,
    badge,
    className:
      entry.item.slug === "cerez" ? "beer-salad-preceding-item" : undefined,
  };
}

function editorialFromEntry(entry: MenuEntry): EditorialMenuItem {
  return {
    name: entry.item.name,
    description: entry.item.description ?? "",
    price: formatTryFromCents(entry.link.price_cents),
  };
}

async function loadMenuPublicData(): Promise<PublicDataEnvelope<MenuPublicData>> {
  try {
    const client = createPublicClient();
    const [
      blocks,
      branchesResult,
      categoriesResult,
      itemsResult,
      itemLinksResult,
      variantsResult,
    ] = await Promise.all([
      getPageBlocks(client, "menu"),
      client.from("branches").select("id, slug, name, short_description").order("sort_order"),
      client.from("menu_categories").select("id, slug, metadata").order("sort_order"),
      client
        .from("menu_items")
        .select("id, category_id, slug, name, description, detail, highlight_text, allergen_text, badges, image_media_id, metadata, sort_order")
        .order("sort_order"),
      client
        .from("menu_item_branches")
        .select("id, menu_item_id, branch_id, price_cents, price_label, price_note, sort_order")
        .order("sort_order"),
      client
        .from("menu_item_variants")
        .select("menu_item_branch_id, label, price_cents, sort_order")
        .order("sort_order"),
    ]);

    for (const result of [
      branchesResult,
      categoriesResult,
      itemsResult,
      itemLinksResult,
      variantsResult,
    ]) {
      if (result.error) throw result.error;
    }

    const mediaIds = [...new Set(
      (itemsResult.data ?? [])
        .map((item) => item.image_media_id)
        .filter((id): id is string => Boolean(id)),
    )];
    const mediaRows: PublicMediaRow[] = [];
    if (mediaIds.length) {
      const mediaResult = await client
        .from("media")
        .select("id, source, bucket_name, object_path, external_url, local_path, alt_text, width, height")
        .in("id", mediaIds);
      if (mediaResult.error) throw mediaResult.error;
      mediaRows.push(...(mediaResult.data ?? []));
    }

    const branchByUuid = new Map(
      (branchesResult.data ?? []).map((branch) => [branch.id, branch]),
    );
    const categoryByUuid = new Map(
      (categoriesResult.data ?? []).map((category) => [category.id, category]),
    );
    const itemByUuid = new Map(
      (itemsResult.data ?? []).map((item) => [item.id, item]),
    );
    const variantsByLink = new Map<string, MenuItemVariantRow[]>();

    for (const variant of variantsResult.data ?? []) {
      const variants = variantsByLink.get(variant.menu_item_branch_id) ?? [];
      variants.push(variant);
      variantsByLink.set(variant.menu_item_branch_id, variants);
    }

    const entries = (itemLinksResult.data ?? [])
      .map((link): (MenuEntry & { branch: BranchSlug; categorySlug: string }) | null => {
        const branchSlug = branchByUuid.get(link.branch_id)?.slug;
        const item = itemByUuid.get(link.menu_item_id);
        if (!item || (branchSlug !== "alsancak" && branchSlug !== "atakent")) {
          return null;
        }
        const categorySlug = categoryByUuid.get(item.category_id)?.slug;
        if (!categorySlug) return null;

        return {
          item,
          link,
          variants: [...(variantsByLink.get(link.id) ?? [])].sort(
            (first, second) => first.sort_order - second.sort_order,
          ),
          branch: branchSlug,
          categorySlug,
        };
      })
      .filter(
        (
          entry,
        ): entry is MenuEntry & { branch: BranchSlug; categorySlug: string } =>
          Boolean(entry),
      );

    function categoryEntries(slug: string, branch: BranchSlug): MenuEntry[] {
      return entries
        .filter((entry) => entry.categorySlug === slug && entry.branch === branch)
        .sort((first, second) => first.link.sort_order - second.link.sort_order);
    }

    function priceTable(slug: string, branch: BranchSlug): PriceTableRow[] {
      return categoryEntries(slug, branch).map((entry) => ({
        name: entry.item.name,
        detail: entry.item.detail ?? undefined,
        prices: entry.variants.length
          ? entry.variants.map((variant) => formatTryFromCents(variant.price_cents))
          : [formatTryFromCents(entry.link.price_cents)],
      }));
    }

    function compactList(slug: string, branch: BranchSlug): CompactMenuItem[] {
      return categoryEntries(slug, branch).map(compactFromEntry);
    }

    function foodList(slug: string, branch: BranchSlug): FoodMenuItem[] {
      return categoryEntries(slug, branch).map(foodFromEntry);
    }

    function editorialList(slug: string, branch: BranchSlug): EditorialMenuItem[] {
      return categoryEntries(slug, branch).map(editorialFromEntry);
    }

    const deliEntries = categoryEntries("deli-salata", "alsancak");
    const specialDeliSlugs = new Set([
      "sanayi-tabagi",
      "tulum-peyniri",
      "eski-kasar-peyniri",
      "karisik-kup-peynir",
      "pasta-fredda",
      "patates-salata",
    ]);
    const featureEntry = deliEntries.find(
      (entry) => entry.item.slug === "sanayi-tabagi",
    );
    const cheeseEntries = deliEntries.filter((entry) =>
      ["tulum-peyniri", "eski-kasar-peyniri", "karisik-kup-peynir"].includes(
        entry.item.slug,
      ),
    );
    const cheeseVariants = cheeseEntries[0]?.variants ?? [];
    const saladEntries = deliEntries.filter((entry) =>
      ["pasta-fredda", "patates-salata"].includes(entry.item.slug),
    );
    const deliCategory = (categoriesResult.data ?? []).find(
      (category) => category.slug === "deli-salata",
    );
    const deliMetadata = asRecord(deliCategory?.metadata);

    const wineEntry = categoryEntries("saraplar", "alsancak")[0];
    const wineVariants = wineEntry?.variants ?? [];
    const sauceCategory = (categoriesResult.data ?? []).find(
      (category) => category.slug === "soslar",
    );
    const sauceMetadata = asRecord(sauceCategory?.metadata);

    const coffeeCategoryConfig = [
      ["kahve", "Kahve", "Sıcak / Soğuk"],
      ["spesiyaller", "Spesiyaller", undefined],
      ["kahve-disi", "Kahve Dışı", undefined],
    ] as const;
    const coffeeGroups: CoffeeMenuGroup[] = coffeeCategoryConfig.map(
      ([slug, title, subtitle]) => ({
        title,
        subtitle,
        items: compactList(slug, "alsancak"),
      }),
    );

    const heroBlock = blocks.get("hero") ?? {};
    const alsancakIntroBlock = blocks.get("alsancak-intro") ?? {};
    const atakentIntroBlock = blocks.get("atakent-intro") ?? {};
    const branchesBySlug = new Map(
      (branchesResult.data ?? []).map((branch) => [branch.slug, branch]),
    );

    const hasMenuData = entries.length > 0;
    const data: MenuPublicData = {
      hasMenuData,
      itemImages: mapMenuItemImages(client, entries, mediaRows),
      branchOptions: [
        {
          id: "alsancak",
          label:
            branchesBySlug.get("alsancak")?.name ??
            fallbackMenuData.branchOptions[0].label,
          description:
            branchesBySlug.get("alsancak")?.short_description ??
            "Self-servis · kokteyl yok",
        },
        {
          id: "atakent",
          label:
            branchesBySlug.get("atakent")?.name ??
            fallbackMenuData.branchOptions[1].label,
          description:
            branchesBySlug.get("atakent")?.short_description ??
            "Bubble kokteyl · grill",
        },
      ],
      menuHero: {
        eyebrow: stringValue(heroBlock.eyebrow, fallbackMenuData.menuHero.eyebrow),
        title: stringValue(heroBlock.title, fallbackMenuData.menuHero.title),
        description: stringValue(
          heroBlock.description,
          fallbackMenuData.menuHero.description,
        ),
        mark: stringValue(heroBlock.mark, fallbackMenuData.menuHero.mark),
      },
      alsancakIntro: {
        kicker: stringValue(
          alsancakIntroBlock.kicker,
          fallbackMenuData.alsancakIntro.kicker,
        ),
        titleLines: Array.isArray(alsancakIntroBlock.titleLines)
          ? alsancakIntroBlock.titleLines.filter(
              (value): value is string => typeof value === "string",
            )
          : fallbackMenuData.alsancakIntro.titleLines,
        description: stringValue(
          alsancakIntroBlock.description,
          fallbackMenuData.alsancakIntro.description,
        ),
      },
      alsancakDraftBeers: priceTable("fici-biralar", "alsancak"),
      alsancakBottleBeers: compactList("sise-biralar", "alsancak"),
      alsancakDeliItems: deliEntries
        .filter((entry) => !specialDeliSlugs.has(entry.item.slug))
        .map(foodFromEntry),
      cheesePortions: {
        feature: featureEntry
          ? {
              name: featureEntry.item.name,
              description: featureEntry.item.description ?? "",
              price: formatTryFromCents(featureEntry.link.price_cents),
            }
          : fallbackMenuData.cheesePortions.feature,
        note: stringValue(
          deliMetadata.cheese_note,
          fallbackMenuData.cheesePortions.note,
        ),
        prices: cheeseVariants.length
          ? cheeseVariants.map((variant) => ({
              label: variant.label,
              price: formatTryFromCents(variant.price_cents),
            }))
          : fallbackMenuData.cheesePortions.prices,
        options: cheeseEntries.map((entry) => {
          const metadata = asRecord(entry.item.metadata);
          return {
            name: entry.item.name,
            detail: entry.item.detail ?? "",
            portion: stringValue(metadata.portion),
            mixed: metadata.mixed === true ? true : undefined,
          };
        }),
      },
      beerSalads: saladEntries.map((entry) => ({
        name: entry.item.name,
        description: entry.item.description ?? "",
        prices: entry.variants.map((variant) => ({
          label: variant.label,
          price: formatTryFromCents(variant.price_cents),
        })),
      })),
      alsancakWine: wineEntry
        ? {
            name: wineEntry.item.name,
            description: wineEntry.item.description ?? "",
            price: wineVariants[0]
              ? `${wineVariants[0].label} ${formatTryFromCents(wineVariants[0].price_cents)}`
              : formatTryFromCents(wineEntry.link.price_cents),
            priceDetail: wineVariants[1]
              ? `${wineVariants[1].label} ${formatTryFromCents(wineVariants[1].price_cents)}`
              : "",
          }
        : fallbackMenuData.alsancakWine,
      alsancakFryerItems: foodList("fritoz", "alsancak"),
      alsancakOvenItems: foodList("firin", "alsancak"),
      sauceBar: {
        kicker: stringValue(
          sauceMetadata.kicker,
          fallbackMenuData.sauceBar.kicker,
        ),
        title: stringValue(
          sauceMetadata.title,
          fallbackMenuData.sauceBar.title,
        ),
        items: categoryEntries("soslar", "alsancak").map(
          (entry) => entry.item.name,
        ),
      },
      coffeeGroups,
      coffeeExtras: categoryEntries("kahve-ekstralari", "alsancak").map(
        (entry) => ({
          label: entry.item.name,
          description: entry.item.description ?? "",
          price: formatTryFromCents(entry.link.price_cents),
        }),
      ),
      atakentIntro: {
        kicker: stringValue(
          atakentIntroBlock.kicker,
          fallbackMenuData.atakentIntro.kicker,
        ),
        titleLines: Array.isArray(atakentIntroBlock.titleLines)
          ? atakentIntroBlock.titleLines.filter(
              (value): value is string => typeof value === "string",
            )
          : fallbackMenuData.atakentIntro.titleLines,
        description: stringValue(
          atakentIntroBlock.description,
          fallbackMenuData.atakentIntro.description,
        ),
      },
      atakentDraftBeers: priceTable("fici-biralar", "atakent"),
      atakentBubbleCocktails: editorialList(
        "bubble-kokteyller",
        "atakent",
      ),
      atakentHouseCocktails: editorialList("house-kokteyller", "atakent"),
      atakentBottleBeers: compactList("sise-biralar", "atakent"),
      atakentWines: priceTable("saraplar", "atakent"),
      atakentHotItems: foodList("sicaklar", "atakent"),
      atakentGrillItems: foodList("izgara-sisleri", "atakent"),
      atakentDessert: (() => {
        const dessert = categoryEntries("tatli", "atakent")[0];
        return dessert
          ? {
              kicker: "Tatlı",
              name: dessert.item.name,
              description: dessert.item.description ?? "",
              allergens: dessert.item.allergen_text ?? "",
              price: formatTryFromCents(dessert.link.price_cents),
            }
          : fallbackMenuData.atakentDessert;
      })(),
    };

    return {
      data,
      source: hasMenuData ? "supabase" : "empty",
      issues: [],
    };
  } catch (error) {
    return {
      data: fallbackMenuData,
      source: "fallback",
      issues: [normaliseIssue(error, "Menü verisi")],
    };
  }
}

export const getMenuPublicData = cache(loadMenuPublicData);
