import "server-only";

import { getPublicBranchRows } from "./branches";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { normalisePublishedEvents, type KantinEvent, type RawEvent } from "@/lib/events";
import { fallbackCommonData } from "./fallbacks";
import { normaliseIssue, resolveMediaUrl, type PublicMediaRow } from "./helpers";
import type { EventPublicData, PublicDataEnvelope } from "./types";

function fallbackBranchMaps() {
  const alsancak = fallbackCommonData.branches.find(
    (branch) => branch.id === "alsancak",
  )!;
  const atakent = fallbackCommonData.branches.find(
    (branch) => branch.id === "atakent",
  )!;

  return {
    branchLabels: {
      alsancak: alsancak.name,
      atakent: atakent.name,
      both: "İki şube",
    } as const,
    branchAddresses: {
      alsancak: `${alsancak.addressLine}, ${alsancak.district} / ${alsancak.city}`,
      atakent: `${atakent.addressLine}, ${atakent.district} / ${atakent.city}`,
      both: `${alsancak.name} + ${atakent.name}`,
    } as const,
  };
}

async function loadEventPublicData(): Promise<PublicDataEnvelope<EventPublicData>> {
  const fallbackMaps = fallbackBranchMaps();

  try {
    const client = createPublicClient();
    const [eventsResult, linksResult, branchRows] = await Promise.all([
      client
        .from("events")
        .select("id, title, description, start_at, end_at, venue_name, location_text, external_url, image_media_id")
        .order("start_at"),
      client
        .from("event_branches")
        .select("event_id, branch_id, sort_order")
        .order("sort_order"),
      getPublicBranchRows(),
    ]);

    if (eventsResult.error) throw eventsResult.error;
    if (linksResult.error) throw linksResult.error;
    const mediaIds = [...new Set(
      (eventsResult.data ?? [])
        .map((event) => event.image_media_id)
        .filter((id): id is string => Boolean(id)),
    )];
    let mediaRows: PublicMediaRow[] = [];
    if (mediaIds.length) {
      const mediaResult = await client
        .from("media")
        .select("id, source, bucket_name, object_path, external_url, local_path, alt_text, width, height")
        .in("id", mediaIds);
      if (mediaResult.error) throw mediaResult.error;
      mediaRows = mediaResult.data ?? [];
    }

    const branchByUuid = new Map(
      branchRows.map((branch) => [branch.id, branch]),
    );
    const mediaByUuid = new Map(
      mediaRows.map((media) => [media.id, media]),
    );
    const branchIdsByEvent = new Map<string, string[]>();

    for (const link of linksResult.data ?? []) {
      const ids = branchIdsByEvent.get(link.event_id) ?? [];
      ids.push(link.branch_id);
      branchIdsByEvent.set(link.event_id, ids);
    }

    const rawEvents: RawEvent[] = (eventsResult.data ?? []).map((event) => {
      const branchSlugs = (branchIdsByEvent.get(event.id) ?? [])
        .map((id) => branchByUuid.get(id)?.slug)
        .filter((slug): slug is "alsancak" | "atakent" =>
          slug === "alsancak" || slug === "atakent",
        );

      const branch =
        branchSlugs.length > 1
          ? "both"
          : branchSlugs[0] ?? "both";
      const media = event.image_media_id
        ? mediaByUuid.get(event.image_media_id)
        : null;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startAt: event.start_at,
        endAt: event.end_at,
        branch,
        status: "published",
        location: event.location_text ?? event.venue_name ?? undefined,
        link: event.external_url ?? undefined,
        imageUrl: resolveMediaUrl(client, media) ?? undefined,
      };
    });

    const events: KantinEvent[] = normalisePublishedEvents(rawEvents);
    const branchBySlug = new Map(
      branchRows.map((branch) => [branch.slug, branch]),
    );
    const alsancak = branchBySlug.get("alsancak");
    const atakent = branchBySlug.get("atakent");

    return {
      data: {
        events,
        branchLabels: {
          alsancak: alsancak?.name ?? fallbackMaps.branchLabels.alsancak,
          atakent: atakent?.name ?? fallbackMaps.branchLabels.atakent,
          both: "İki şube",
        },
        branchAddresses: {
          alsancak: alsancak
            ? `${alsancak.address_line}, ${alsancak.district} / ${alsancak.city}`
            : fallbackMaps.branchAddresses.alsancak,
          atakent: atakent
            ? `${atakent.address_line}, ${atakent.district} / ${atakent.city}`
            : fallbackMaps.branchAddresses.atakent,
          both: `${alsancak?.name ?? "Alsancak"} + ${atakent?.name ?? "Atakent"}`,
        },
        instagramUrl: fallbackCommonData.siteIdentity.instagramUrl,
      },
      source: eventsResult.data?.length ? "supabase" : "empty",
      issues: [],
    };
  } catch (error) {
    return {
      data: {
        events: [],
        ...fallbackMaps,
        instagramUrl: fallbackCommonData.siteIdentity.instagramUrl,
      },
      source: "fallback",
      issues: [normaliseIssue(error, "Etkinlik verisi")],
    };
  }
}

export const getEventPublicData = cache(loadEventPublicData);
