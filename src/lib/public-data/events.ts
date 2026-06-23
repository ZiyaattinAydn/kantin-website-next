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
  getPublicMediaRows,
  normaliseIssue,
  resolveMediaUrl,
} from "./helpers";
import type { EventPublicData, PublicDataEnvelope } from "./types";

const EVENT_COLUMNS = [
  "id",
  "title",
  "description",
  "content_type",
  "start_at",
  "end_at",
  "venue_name",
  "location_text",
  "external_url",
  "cta_label",
  "image_media_id",
  "publish_start_at",
  "publish_end_at",
  "sort_order",
].join(", ");

const LEGACY_EVENT_COLUMNS = [
  "id",
  "title",
  "description",
  "start_at",
  "end_at",
  "venue_name",
  "location_text",
  "external_url",
  "image_media_id",
].join(", ");

type EventPublicRow = {
  id: string;
  title: string;
  description: string | null;
  content_type?: string | null;
  start_at: string | null;
  end_at: string | null;
  venue_name: string | null;
  location_text: string | null;
  external_url: string | null;
  cta_label?: string | null;
  image_media_id: string | null;
  publish_start_at?: string | null;
  publish_end_at?: string | null;
  sort_order?: number | null;
};

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
    const [extendedEventsResult, linksResult, branchRows] = await Promise.all([
      client
        .from("events")
        .select(EVENT_COLUMNS)
        .order("sort_order", { ascending: true }),
      client
        .from("event_branches")
        .select("event_id, branch_id, sort_order")
        .order("sort_order"),
      getPublicBranchRows(),
    ]);
    const eventsResult = extendedEventsResult.error
      ? await client
        .from("events")
        .select(LEGACY_EVENT_COLUMNS)
        .order("start_at")
      : extendedEventsResult;

    if (eventsResult.error) throw eventsResult.error;
    if (linksResult.error) throw linksResult.error;

    const eventRows = (eventsResult.data ?? []) as unknown as EventPublicRow[];
    const mediaIds = [...new Set(
      eventRows
        .map((event) => event.image_media_id)
        .filter((id): id is string => Boolean(id)),
    )];
    const mediaRows = await getPublicMediaRows(client, mediaIds);

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

    const rawEvents: RawEvent[] = eventRows.map((event) => {
      const branchSlugs = (branchIdsByEvent.get(event.id) ?? [])
        .map((id) => branchByUuid.get(id)?.slug)
        .filter((slug): slug is string => Boolean(slug));
      const branch = branchSlugs.length === 1 ? branchSlugs[0] : "both";
      const media = event.image_media_id
        ? mediaByUuid.get(event.image_media_id)
        : null;

      return {
        id: event.id,
        contentType: event.content_type === "announcement" ? "announcement" : "event",
        title: event.title,
        description: event.description ?? undefined,
        startAt: event.start_at,
        endAt: event.end_at,
        branch,
        status: "published",
        location: event.location_text ?? event.venue_name ?? undefined,
        link: event.external_url ?? undefined,
        ctaLabel: event.cta_label ?? undefined,
        imageUrl: resolveMediaUrl(client, media) ?? undefined,
        publishStartAt: event.publish_start_at,
        publishEndAt: event.publish_end_at,
        sortOrder: event.sort_order ?? undefined,
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
      source: eventRows.length ? "supabase" : "empty",
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
