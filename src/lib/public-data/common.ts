import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { fallbackCommonData } from "./fallbacks";
import {
  arrayOfRecords,
  asRecord,
  normaliseIssue,
  stringArray,
  stringValue,
} from "./helpers";
import type {
  CommonPublicData,
  FooterNavigationGroup,
  PublicDataEnvelope,
} from "./types";
import type { Branch } from "@/types/domain";
import type { FooterLink, NavigationItem } from "@/types/content";
import { parseSectionVisibility, parseThemeSettings } from "@/lib/theme/settings";

function parsePrimaryNavigation(value: unknown): NavigationItem[] {
  return arrayOfRecords(value)
    .map((item) => ({
      href: stringValue(item.href),
      label: stringValue(item.label),
      exact: typeof item.exact === "boolean" ? item.exact : undefined,
    }))
    .filter((item) => item.href && item.label);
}

function parseFooterNavigation(value: unknown): FooterNavigationGroup[] {
  return arrayOfRecords(value)
    .map((group) => ({
      title: stringValue(group.title),
      links: arrayOfRecords(group.links)
        .map(
          (link): FooterLink => ({
            href: stringValue(link.href),
            label: stringValue(link.label),
            external:
              typeof link.external === "boolean" ? link.external : undefined,
          }),
        )
        .filter((link) => link.href && link.label),
    }))
    .filter((group) => group.title && group.links.length);
}

function mapBranch(row: {
  slug: string;
  code: string;
  name: string;
  address_line: string;
  district: string;
  city: string;
  maps_url: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
}): Branch | null {
  if (row.slug !== "alsancak" && row.slug !== "atakent") return null;
  if (row.code !== "ALS" && row.code !== "ATA") return null;

  return {
    id: row.slug,
    code: row.code,
    name: row.name,
    addressLine: row.address_line,
    district: row.district,
    city: row.city,
    mapsUrl: row.maps_url,
    features: [...row.features],
    active: row.is_active,
    sortOrder: row.sort_order,
  };
}


export async function getCommonPublicData(): Promise<PublicDataEnvelope<CommonPublicData>> {
  try {
    const client = createPublicClient();
    const [branchesResult, settingsResult] = await Promise.all([
      client.from("branches").select("*").order("sort_order"),
      client
        .from("site_settings")
        .select("key, value")
        .eq("is_public", true)
        .order("sort_order"),
    ]);

    if (branchesResult.error) throw branchesResult.error;
    if (settingsResult.error) throw settingsResult.error;

    const settings = new Map(
      (settingsResult.data ?? []).map((setting) => [setting.key, setting.value]),
    );

    const identity = asRecord(settings.get("site.identity"));
    const contact = asRecord(settings.get("site.contact"));
    const footerContent = asRecord(settings.get("footer.content"));

    const mappedBranches = (branchesResult.data ?? [])
      .map(mapBranch)
      .filter((branch): branch is Branch => Boolean(branch));

    const primaryNavigation = parsePrimaryNavigation(
      settings.get("navigation.primary"),
    );
    const footerNavigation = parseFooterNavigation(
      settings.get("navigation.footer"),
    );

    const data: CommonPublicData = {
      branches: mappedBranches,
      siteIdentity: {
        name: stringValue(identity.name, fallbackCommonData.siteIdentity.name),
        slogan: stringValue(
          identity.slogan,
          fallbackCommonData.siteIdentity.slogan,
        ),
        sloganLines: stringArray(
          identity.sloganLines,
          fallbackCommonData.siteIdentity.sloganLines,
        ),
        instagramUrl: stringValue(
          identity.instagramUrl,
          fallbackCommonData.siteIdentity.instagramUrl,
        ),
      },
      publicEmail: stringValue(
        contact.publicEmail,
        fallbackCommonData.publicEmail,
      ),
      primaryNavigation: primaryNavigation.length
        ? primaryNavigation
        : fallbackCommonData.primaryNavigation,
      footerNavigation: footerNavigation.length
        ? footerNavigation
        : fallbackCommonData.footerNavigation,
      footerContent: {
        title: stringValue(
          footerContent.title,
          fallbackCommonData.footerContent.title,
        ),
        intro: stringValue(
          footerContent.intro,
          fallbackCommonData.footerContent.intro,
        ),
        workTitle: stringValue(
          footerContent.workTitle,
          fallbackCommonData.footerContent.workTitle,
        ),
        workDescription: stringValue(
          footerContent.workDescription,
          fallbackCommonData.footerContent.workDescription,
        ),
        bottomLine: stringValue(
          footerContent.bottomLine,
          fallbackCommonData.footerContent.bottomLine,
        ),
      },
      sectionVisibility: parseSectionVisibility(settings.get("sections.visibility")),
      themeSettings: parseThemeSettings(settings.get("theme.settings")),
    };

    return {
      data,
      source:
        mappedBranches.length || settingsResult.data?.length
          ? "supabase"
          : "empty",
      issues: [],
    };
  } catch (error) {
    return {
      data: fallbackCommonData,
      source: "fallback",
      issues: [normaliseIssue(error, "Ortak site verisi")],
    };
  }
}
