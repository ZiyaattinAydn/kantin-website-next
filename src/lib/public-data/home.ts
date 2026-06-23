import "server-only";
import { getPublicBranchRows } from "./branches";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getEventPublicData } from "./events";
import { fallbackHomeData } from "./fallbacks";
import {
  arrayOfRecords,
  asRecord,
  formatDisplayDate,
  getPageBlocks,
  normaliseIssue,
  resolveMediaUrl,
  stringArray,
  stringValue,
  type PublicMediaRow,
  type TableRow,
} from "./helpers";
import type {
  HomeHeroData,
  HomePublicData,
  MemoriesSectionData,
  PublicDataEnvelope,
} from "./types";
import type {
  HomeMenuBranch,
  InstagramPost,
  LocationBranch,
  MerchDoodle,
  MerchProductContent,
} from "@/types/content";
import type { MemoryPhoto, MemoryPhotoLayout } from "@/data/memories";
import type { BranchId } from "@/types/domain";

function parseHero(value: Record<string, unknown> | undefined): HomeHeroData {
  if (!value) return fallbackHomeData.hero;

  const primaryAction = asRecord(value.primaryAction);
  const secondaryAction = asRecord(value.secondaryAction);
  const title = stringArray(value.title, fallbackHomeData.hero.title);
  const features = arrayOfRecords(value.features)
    .map((feature) => ({
      label: stringValue(feature.label),
      href: stringValue(feature.href),
    }))
    .filter((feature) => feature.label && feature.href);

  return {
    eyebrow: stringValue(value.eyebrow, fallbackHomeData.hero.eyebrow),
    title: title.length >= 2 ? title : fallbackHomeData.hero.title,
    description: stringValue(
      value.description,
      fallbackHomeData.hero.description,
    ),
    primaryAction: {
      href: stringValue(
        primaryAction.href,
        fallbackHomeData.hero.primaryAction.href,
      ),
      label: stringValue(
        primaryAction.label,
        fallbackHomeData.hero.primaryAction.label,
      ),
    },
    secondaryAction: {
      href: stringValue(
        secondaryAction.href,
        fallbackHomeData.hero.secondaryAction.href,
      ),
      label: stringValue(
        secondaryAction.label,
        fallbackHomeData.hero.secondaryAction.label,
      ),
    },
    features: features.length ? features : fallbackHomeData.hero.features,
    marquee: stringValue(value.marquee, fallbackHomeData.hero.marquee),
  };
}

function parseMenuBranches(
  value: Record<string, unknown> | undefined,
): HomeMenuBranch[] {
  if (!value) return fallbackHomeData.menuBranches;

  return arrayOfRecords(value.items)
    .map((item): HomeMenuBranch | null => {
      const slug = item.slug;
      const code = item.code;
      const image = asRecord(item.image);

      if (typeof slug !== "string" || !slug.trim()) return null;
      if (typeof code !== "string" || !code.trim()) return null;

      return {
        slug,
        code,
        name: stringValue(item.name),
        image: {
          src: stringValue(image.src),
          width: typeof image.width === "number" ? image.width : 1080,
          height: typeof image.height === "number" ? image.height : 1350,
        },
        title: stringValue(item.title),
        description: stringValue(item.description),
        tags: stringArray(item.tags),
        delayClass: stringValue(item.delayClass) || undefined,
      };
    })
    .filter((item): item is HomeMenuBranch => Boolean(item));
}

function parseLocations(
  value: Record<string, unknown> | undefined,
): LocationBranch[] {
  if (!value) return fallbackHomeData.locationBranches;

  return arrayOfRecords(value.items)
    .map((item): LocationBranch | null => {
      const slug = item.slug;
      const code = item.code;
      const visualClass = item.visualClass;

      if (typeof slug !== "string" || !slug.trim()) return null;
      if (typeof code !== "string" || !code.trim()) return null;
      if (typeof visualClass !== "string" || !visualClass.trim()) return null;

      const images = arrayOfRecords(item.images)
        .map((image) => ({
          src: stringValue(image.src),
          width: typeof image.width === "number" ? image.width : 1080,
          height: typeof image.height === "number" ? image.height : 1350,
        }))
        .filter((image) => image.src);

      return {
        slug,
        code,
        visualClass,
        eyebrow: stringValue(item.eyebrow),
        title: stringValue(item.title),
        address: stringValue(item.address),
        mapsUrl: stringValue(item.mapsUrl),
        images,
        delayClass: stringValue(item.delayClass) || undefined,
      };
    })
    .filter((item): item is LocationBranch => Boolean(item));
}

function parseMemoriesSection(
  value: Record<string, unknown> | undefined,
): MemoriesSectionData {
  if (!value) return fallbackHomeData.memoriesSection;

  const chapters = arrayOfRecords(value.chapters)
    .map((chapter) => ({
      label: stringValue(chapter.label),
      title: stringValue(chapter.title),
      description: stringValue(chapter.description),
    }))
    .filter((chapter) => chapter.title && chapter.description);

  return {
    eyebrow: stringValue(
      value.eyebrow,
      fallbackHomeData.memoriesSection.eyebrow,
    ),
    title: stringValue(value.title, fallbackHomeData.memoriesSection.title),
    introduction: stringValue(
      value.introduction,
      fallbackHomeData.memoriesSection.introduction,
    ),
    statement: stringValue(
      value.statement,
      fallbackHomeData.memoriesSection.statement,
    ),
    chapters: chapters.length
      ? chapters
      : fallbackHomeData.memoriesSection.chapters,
    closingLine: stringValue(
      value.closingLine,
      fallbackHomeData.memoriesSection.closingLine,
    ),
  };
}

function parseMemoryPhotos(
  value: Record<string, unknown> | undefined,
): MemoryPhoto[] {
  if (!value) return fallbackHomeData.memoryPhotos;

  const allowedLayouts = new Set<MemoryPhotoLayout>([
    "feature",
    "portrait",
    "wide",
    "standard",
  ]);

  return arrayOfRecords(value.items)
    .map((item): MemoryPhoto | null => {
      const layout = item.layout;
      if (typeof layout !== "string" || !allowedLayouts.has(layout as MemoryPhotoLayout)) {
        return null;
      }

      const photo = {
        src: stringValue(item.src),
        alt: stringValue(item.alt),
        caption: stringValue(item.caption),
        label: stringValue(item.label),
        layout: layout as MemoryPhotoLayout,
      };

      return photo.src && photo.alt ? photo : null;
    })
    .filter((item): item is MemoryPhoto => Boolean(item));
}

function parseDoodles(value: Record<string, unknown> | undefined): MerchDoodle[] {
  if (!value) return fallbackHomeData.merchDoodles;

  return arrayOfRecords(value.items)
    .map((item) => ({
      src: stringValue(item.src),
      className: stringValue(item.className),
    }))
    .filter((item) => item.src && item.className);
}

export function mergeMenuBranchesWithAdmin(
  branches: HomeMenuBranch[],
  rows: Array<Pick<
    TableRow<"branches">,
    "slug" | "code" | "name" | "short_description" | "features"
  >>,
): HomeMenuBranch[] {
  if (!rows.length) return branches;

  const configuredBySlug = new Map(
    branches.map((branch) => [branch.slug, branch]),
  );

  return rows.map((row, index) => {
    const configured = configuredBySlug.get(row.slug);

    return {
      slug: row.slug,
      code: row.code,
      name: row.name,
      image: configured?.image,
      title: configured?.title ?? `${row.name} menüsü`,
      description:
        row.short_description ??
        configured?.description ??
        `${row.name} şubesine özel güncel menüyü incele.`,
      tags: row.features.length
        ? [...row.features]
        : configured?.tags ?? [],
      delayClass:
        configured?.delayClass ?? (index > 0 ? "reveal-delay-1" : undefined),
    };
  });
}

export function mergeLocationsWithAdmin(
  branches: LocationBranch[],
  rows: Array<Pick<
    TableRow<"branches">,
    | "slug"
    | "code"
    | "name"
    | "address_line"
    | "district"
    | "city"
    | "short_description"
    | "maps_url"
  >>,
): LocationBranch[] {
  if (!rows.length) return branches;

  const configuredBySlug = new Map(
    branches.map((branch) => [branch.slug, branch]),
  );

  return rows.map((row, index) => {
    const configured = configuredBySlug.get(row.slug);

    return {
      slug: row.slug,
      code: row.code,
      visualClass: configured?.visualClass ?? "branch-generic",
      eyebrow: configured?.eyebrow ?? `${row.name} şubesi`,
      title: row.address_line,
      address: `${row.district} / ${row.city}`,
      description: row.short_description ?? configured?.description,
      mapsUrl: row.maps_url,
      images: configured?.images ?? [],
      delayClass:
        configured?.delayClass ?? (index > 0 ? "reveal-delay-1" : undefined),
    };
  });
}

async function loadHomePublicData(): Promise<PublicDataEnvelope<HomePublicData>> {
  try {
    const client = createPublicClient();
    const [
  blocks,
  productsResult,
  productLinksResult,
  instagramResult,
  branchRows,
  eventEnvelope,
] = await Promise.all([
        getPageBlocks(client, "home"),
        client
          .from("merch_products")
          .select("id, slug, product_type, name, price_cents, description, detail, image_media_id, metadata, is_active, sort_order")
          .order("sort_order"),
        client
          .from("merch_product_branches")
          .select("merch_product_id, branch_id, is_available, sort_order")
          .order("sort_order"),
        client
          .from("instagram_posts")
          .select("id, external_id, image_media_id, branch_id, metadata, image_alt, caption, published_at, permalink")
          .order("sort_order"),
        getPublicBranchRows(),
        getEventPublicData(),
      ]);

    if (productsResult.error) throw productsResult.error;
    if (productLinksResult.error) throw productLinksResult.error;
    if (instagramResult.error) throw instagramResult.error;

    const mediaIds = [...new Set([
      ...(productsResult.data ?? []).map((product) => product.image_media_id),
      ...(instagramResult.data ?? []).map((post) => post.image_media_id),
    ].filter((id): id is string => Boolean(id)))];
    let mediaRows: PublicMediaRow[] = [];
    if (mediaIds.length) {
      const mediaResult = await client
        .from("media")
        .select("id, source, bucket_name, object_path, external_url, local_path, alt_text, width, height")
        .in("id", mediaIds);
      if (mediaResult.error) throw mediaResult.error;
      mediaRows = mediaResult.data ?? [];
    }

    const mediaByUuid = new Map(
      mediaRows.map((media) => [media.id, media]),
    );
    const branchByUuid = new Map(
      branchRows.map((branch) => [branch.id, branch]),
    );
    const branchIdsByProduct = new Map<string, BranchId[]>();

    for (const link of productLinksResult.data ?? []) {
      if (!link.is_available) continue;
      const slug = branchByUuid.get(link.branch_id)?.slug;
      if (!slug) continue;
      const ids = branchIdsByProduct.get(link.merch_product_id) ?? [];
      ids.push(slug);
      branchIdsByProduct.set(link.merch_product_id, ids);
    }

    const merchProducts: MerchProductContent[] = (productsResult.data ?? [])
      .filter((product) => product.product_type === "item")
      .filter((product) => (branchIdsByProduct.get(product.id) ?? []).length > 0)
      .map((product) => {
        const metadata = asRecord(product.metadata);
        const media = product.image_media_id
          ? mediaByUuid.get(product.image_media_id)
          : null;

        return {
          id: product.slug,
          slug: product.slug,
          index: stringValue(
            metadata.index,
            String(product.sort_order).padStart(2, "0"),
          ),
          name: product.name,
          price: product.price_cents / 100,
          currency: "TRY",
          description: product.description,
          detail: product.detail ?? "",
          image:
            resolveMediaUrl(client, media) ??
            fallbackHomeData.merchProducts.find(
              (fallback) => fallback.slug === product.slug,
            )?.image ??
            "",
          imageAlt: stringValue(
            metadata.image_alt,
            media?.alt_text ?? product.name,
          ),
          branchIds: branchIdsByProduct.get(product.id) ?? [],
          active: product.is_active,
          sortOrder: product.sort_order,
        };
      });

    const shirtProduct = (productsResult.data ?? []).find(
      (product) =>
        product.product_type === "item" &&
        product.slug === "oversize-tshirt" &&
        (branchIdsByProduct.get(product.id) ?? []).length > 0,
    );
    const merchBundles = [
      ...(shirtProduct
        ? [{ name: shirtProduct.name, price: shirtProduct.price_cents / 100 }]
        : []),
      ...(productsResult.data ?? [])
        .filter((product) => product.product_type === "bundle")
        .filter((product) => (branchIdsByProduct.get(product.id) ?? []).length > 0)
        .map((product) => ({
          name: product.name,
          price: product.price_cents / 100,
        })),
    ];

    const instagramPosts: InstagramPost[] = (instagramResult.data ?? []).map(
      (post) => {
        const media = post.image_media_id
          ? mediaByUuid.get(post.image_media_id)
          : null;
        const branch = post.branch_id
          ? branchByUuid.get(post.branch_id)?.name
          : undefined;
        const metadata = asRecord(post.metadata);

        return {
          id: post.external_id ?? post.id,
          image: resolveMediaUrl(client, media) ?? "",
          imageAlt: post.image_alt,
          caption: post.caption,
          branch: branch ?? "Kantin",
          publishedAt: formatDisplayDate(
            post.published_at,
            metadata.display_date,
          ),
          permalink: post.permalink,
        };
      },
    );

    const menuBranches = mergeMenuBranchesWithAdmin(
      parseMenuBranches(blocks.get("menu-branches")),
      branchRows,
    );
    const locationBranches = mergeLocationsWithAdmin(
      parseLocations(blocks.get("locations")),
      branchRows,
    );
    const memoryPhotos = parseMemoryPhotos(blocks.get("memories-gallery"));
    const doodles = parseDoodles(blocks.get("merch-doodles"));

    return {
      data: {
        hero: parseHero(blocks.get("hero")),
        menuBranches,
        locationBranches,
        memoriesSection: parseMemoriesSection(blocks.get("memories-copy")),
        memoryPhotos,
        merchDoodles: doodles,
        merchProducts,
        merchBundles,
        instagramPosts,
        eventData: eventEnvelope.data,
      },
      source:
        blocks.size || productsResult.data?.length || instagramResult.data?.length
          ? "supabase"
          : "empty",
      issues: eventEnvelope.issues,
    };
  } catch (error) {
    return {
      data: fallbackHomeData,
      source: "fallback",
      issues: [normaliseIssue(error, "Ana sayfa verisi")],
    };
  }
}

export const getHomePublicData = cache(loadHomePublicData);
