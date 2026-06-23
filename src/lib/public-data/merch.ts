import "server-only";

import { getPublicBranchRows } from "./branches";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { fallbackHomeData } from "./fallbacks";
import {
  arrayOfRecords,
  asRecord,
  getPageBlocks,
  getPublicMediaReferenceSet,
  getPublicMediaRows,
  isAllowedPublicMediaReference,
  normaliseIssue,
  resolveMediaUrl,
  stringValue,
} from "./helpers";
import type { MerchPublicData, PublicDataEnvelope } from "./types";
import type { MerchDoodle, MerchProductContent } from "@/types/content";
import type { BranchId } from "@/types/domain";

function parseMerchDoodles(
  value: Record<string, unknown> | undefined,
  activeMediaReferences: ReadonlySet<string>,
): MerchDoodle[] {
  if (!value) return fallbackHomeData.merchDoodles;

  return arrayOfRecords(value.items)
    .map((item) => ({
      src: stringValue(item.src),
      className: stringValue(item.className),
    }))
    .filter((item) =>
      item.src
      && item.className
      && isAllowedPublicMediaReference(item.src, activeMediaReferences),
    );
}

async function loadMenuMerchPublicData(): Promise<PublicDataEnvelope<MerchPublicData>> {
  try {
    const client = createPublicClient();
    const [blocks, productsResult, linksResult, branchRows, activeMediaReferences] =
    await Promise.all([
      getPageBlocks(client, "home"),
      client
        .from("merch_products")
        .select("id, slug, product_type, name, price_cents, description, detail, image_media_id, metadata, is_active, sort_order")
        .order("sort_order"),
      client
        .from("merch_product_branches")
        .select("merch_product_id, branch_id, is_available, sort_order")
        .order("sort_order"),
      getPublicBranchRows(),
      getPublicMediaReferenceSet(client),
    ]);

    for (const result of [productsResult, linksResult]) {
      if (result.error) throw result.error;
    }

    const mediaIds = [...new Set(
      (productsResult.data ?? [])
        .map((product) => product.image_media_id)
        .filter((id): id is string => Boolean(id)),
    )];
    const mediaRows = await getPublicMediaRows(client, mediaIds);

    const mediaById = new Map(mediaRows.map((media) => [media.id, media]));
    const branchById = new Map(
      branchRows.map((branch) => [branch.id, branch.slug]),
    );
    const branchIdsByProduct = new Map<string, BranchId[]>();
    for (const link of linksResult.data ?? []) {
      if (!link.is_available) continue;
      const slug = branchById.get(link.branch_id);
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
          ? mediaById.get(product.image_media_id)
          : undefined;
        return {
          id: product.slug,
          slug: product.slug,
          index: stringValue(metadata.index, String(product.sort_order).padStart(2, "0")),
          name: product.name,
          price: product.price_cents / 100,
          currency: "TRY",
          description: product.description,
          detail: product.detail ?? "",
          image:
            resolveMediaUrl(client, media) ??
            fallbackHomeData.merchProducts.find((fallback) => fallback.slug === product.slug)?.image ??
            "",
          imageAlt: stringValue(metadata.image_alt, media?.alt_text ?? product.name),
          branchIds: branchIdsByProduct.get(product.id) ?? [],
          active: product.is_active,
          sortOrder: product.sort_order,
        };
      });

    const bundles = (productsResult.data ?? [])
      .filter((product) => (branchIdsByProduct.get(product.id) ?? []).length > 0)
      .filter((product) => product.product_type === "bundle" || product.slug === "oversize-tshirt")
      .map((product) => ({ name: product.name, price: product.price_cents / 100 }));

    return {
      data: {
        merchDoodles: parseMerchDoodles(
          blocks.get("merch-doodles"),
          activeMediaReferences,
        ),
        merchProducts,
        merchBundles: bundles,
      },
      source: productsResult.data?.length || blocks.size ? "supabase" : "empty",
      issues: [],
    };
  } catch (error) {
    return {
      data: {
        merchDoodles: fallbackHomeData.merchDoodles,
        merchProducts: fallbackHomeData.merchProducts,
        merchBundles: fallbackHomeData.merchBundles,
      },
      source: "fallback",
      issues: [normaliseIssue(error, "Merch verisi")],
    };
  }
}

export const getMenuMerchPublicData = cache(loadMenuMerchPublicData);
