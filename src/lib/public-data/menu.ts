import "server-only";

import { getPublicBranchRows } from "./branches";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { fallbackMenuData } from "./fallbacks";
import {
  asRecord,
  formatTryFromCents,
  getPageBlocks,
  getPublicMediaRows,
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

type BranchSlug = string;

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
  | "id"
  | "menu_item_id"
  | "branch_id"
  | "price_cents"
  | "price_label"
  | "price_note"
  | "availability_note"
  | "sort_order"
>;
type MenuItemVariantRow = Pick<
  TableRow<"menu_item_variants">,
  | "id"
  | "menu_item_branch_id"
  | "slug"
  | "label"
  | "detail"
  | "price_cents"
  | "price_note"
  | "sort_order"
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
      branchRows,
      categoriesResult,
      categoryLinksResult,
      itemsResult,
      itemLinksResult,
      variantsResult,
    ] = await Promise.all([
      getPageBlocks(client, "menu"),
      getPublicBranchRows(),
      client
        .from("menu_categories")
        .select("id, slug, name, description, display_type, metadata, sort_order")
        .order("sort_order"),
      client
        .from("menu_category_branches")
        .select("category_id, branch_id, display_name, description, sort_order")
        .order("sort_order"),
      client
        .from("menu_items")
        .select("id, category_id, slug, name, description, detail, highlight_text, allergen_text, badges, image_media_id, metadata, sort_order")
        .order("sort_order"),
      client
        .from("menu_item_branches")
        .select("id, menu_item_id, branch_id, price_cents, price_label, price_note, availability_note, sort_order")
        .order("sort_order"),
      client
        .from("menu_item_variants")
        .select("id, menu_item_branch_id, slug, label, detail, price_cents, price_note, sort_order")
        .order("sort_order"),
    ]);

    for (const result of [
      categoriesResult,
      categoryLinksResult,
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
    const mediaRows = await getPublicMediaRows(client, mediaIds);

    const branchByUuid = new Map(
      branchRows.map((branch) => [branch.id, branch]),
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
        if (!item || !branchSlug) {
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
    const categoryLinkByKey = new Map(
      (categoryLinksResult.data ?? []).map((link) => [
        `${link.branch_id}:${link.category_id}`,
        link,
      ]),
    );
    const itemImages = mapMenuItemImages(client, entries, mediaRows);
    const imageByBranchAndItem = new Map(
      itemImages.map((image) => [
        `${image.branch}:${image.itemId}`,
        image,
      ]),
    );
    const genericBranches = branchRows
      .map((branch) => {
        const categories = (categoriesResult.data ?? [])
          .map((category) => {
            const categoryItems = entries
              .filter(
                (entry) =>
                  entry.branch === branch.slug &&
                  entry.categorySlug === category.slug,
              )
              .sort(
                (first, second) =>
                  first.link.sort_order - second.link.sort_order ||
                  first.item.sort_order - second.item.sort_order,
              );
            if (!categoryItems.length) return null;

            const link = categoryLinkByKey.get(
              `${branch.id}:${category.id}`,
            );

            return {
              id: category.id,
              slug: category.slug,
              name: link?.display_name ?? category.name,
              description:
                link?.description ?? category.description ?? undefined,
              displayType: category.display_type,
              sortOrder: link?.sort_order ?? category.sort_order,
              items: categoryItems.map((entry) => ({
                id: entry.item.id,
                slug: entry.item.slug,
                name: entry.item.name,
                description: entry.item.description ?? undefined,
                detail: entry.item.detail ?? undefined,
                highlight: entry.item.highlight_text ?? undefined,
                allergens: entry.item.allergen_text ?? undefined,
                badges: [...entry.item.badges],
                price: formatTryFromCents(entry.link.price_cents),
                priceLabel: entry.link.price_label ?? undefined,
                priceNote: entry.link.price_note ?? undefined,
                availabilityNote:
                  entry.link.availability_note ?? undefined,
                image: imageByBranchAndItem.get(
                  `${branch.slug}:${entry.item.id}`,
                ),
                variants: entry.variants.map((variant) => ({
                  id: variant.id,
                  slug: variant.slug,
                  label: variant.label,
                  detail: variant.detail ?? undefined,
                  price: formatTryFromCents(variant.price_cents),
                  priceNote: variant.price_note ?? undefined,
                  sortOrder: variant.sort_order,
                })),
                sortOrder: entry.link.sort_order,
              })),
            };
          })
          .filter((category): category is NonNullable<typeof category> => Boolean(category))
          .sort((first, second) => first.sortOrder - second.sortOrder);

        return {
          id: branch.id,
          slug: branch.slug,
          code: branch.code,
          name: branch.name,
          description:
            branch.short_description ??
            `${branch.name} şubesine özel güncel menü.`,
          categories,
        };
      })
      .filter((branch) => branch.categories.length > 0);

    const hasMenuData = genericBranches.length > 0;
    const data: MenuPublicData = {
      hasMenuData,
      itemImages,
      branchOptions: genericBranches.map((branch) => ({
        id: branch.slug,
        code: branch.code,
        label: branch.name,
        description: branch.description,
      })),
      branches: genericBranches,
      menuHero: {
        eyebrow: stringValue(heroBlock.eyebrow, fallbackMenuData.menuHero.eyebrow),
        title: stringValue(heroBlock.title, fallbackMenuData.menuHero.title),
        description: stringValue(
          heroBlock.description,
          genericBranches.length
            ? `${genericBranches.map((branch) => branch.name).join(", ")} şubelerinin ürün ve fiyatları birbirinden farklı olabilir. Gideceğin şubeyi seçerek güncel menüyü incele.`
            : fallbackMenuData.menuHero.description,
        ),
        mark: stringValue(
          heroBlock.mark,
          genericBranches.map((branch) => branch.code).join("—") || fallbackMenuData.menuHero.mark,
        ),
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
