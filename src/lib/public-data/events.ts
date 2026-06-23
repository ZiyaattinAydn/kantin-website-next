import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import {
  normalisePublishedEvents,
  type KantinEvent,
  type RawEvent,
} from "@/lib/events";
import { fallbackCommonData } from "./fallbacks";
import { getPublicBranchRows } from "./branches";
import {
  normaliseIssue,
  resolveMediaUrl,
  type PublicMediaRow,
} from "./helpers";
import type { EventPublicData, PublicDataEnvelope } from "./types";

function branchMapsFromRows(
  rows: Array<{
    slug: string;
    name: string;
    address_line: string;
    district: string;
    city: string;
  }>,
) {
  const branchLabels: Record<string, string> = { both: "Tüm şubeler" };
  const branchAddresses: Record<string, string> = {
    both: rows.length
      ? rows.map((branch) => branch.name).join(" + ")
      : "Kantin şubeleri",
  };

  for (const branch of rows) {
    branchLabels[branch.slug] = branch.name;
    branchAddresses[branch.slug] =
      `${branch.address_line}, ${branch.district} / ${branch.city}`;
  }

  return { branchLabels, branchAddresses };
}

function fallbackBranchMaps() {
  return branchMapsFromRows(
    fallbackCommonData.branches.map((branch) => ({
      slug: branch.id,
      name: branch.name,
      address_line: branch.addressLine,
      district: branch.district,
      city: branch.city,
    })),
  );
}

async function loadEventPublicData(): Promise<PublicDataEnvelope<EventPublicData>> {
  const fallbackMaps = fallbackBranchMaps();

  try {
    const client = createPublicClient();
    const [eventsResult, linksResult, branchRows] = await Promise.all([
      client
        .from("events")
        .select(
          "id, title, description, start_at, end_at, venue_name, location_text, external_url, image_media_id",
        )
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
        .select(
          "id, source, bucket_name, object_path, external_url, local_path, alt_text, width, height",
        )
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
        .filter((slug): slug is string => Boolean(slug));
      const branch = branchSlugs.length === 1 ? branchSlugs[0] : "both";
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
    const maps = branchMapsFromRows(branchRows);

    return {
      data: {
        events,
        ...maps,
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
