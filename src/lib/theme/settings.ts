import type { SectionVisibility, ThemeSettings } from "@/lib/public-data/types";

export const FONT_PRESETS = ["brand", "clean", "editorial"] as const;
export const COLOR_PRESETS = ["kantin", "midnight", "ocean"] as const;
export const HEADING_SCALES = ["compact", "balanced", "expressive"] as const;
export const BODY_SCALES = ["compact", "balanced", "comfortable"] as const;
export const CARD_DENSITIES = ["compact", "balanced", "airy"] as const;
export const HOME_SECTION_KEYS = [
  "menu",
  "merch",
  "memories",
  "events",
  "branches",
] as const;

export type FontPreset = (typeof FONT_PRESETS)[number];
export type ColorPreset = (typeof COLOR_PRESETS)[number];
export type HeadingScale = (typeof HEADING_SCALES)[number];
export type BodyScale = (typeof BODY_SCALES)[number];
export type CardDensity = (typeof CARD_DENSITIES)[number];
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  fontPreset: "brand",
  colorPreset: "kantin",
  headingScale: "balanced",
  bodyScale: "balanced",
  cardDensity: "balanced",
  homeSectionOrder: [...HOME_SECTION_KEYS],
};

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  homeHero: true,
  branches: true,
  menu: true,
  events: true,
  merch: true,
  memories: true,
  instagram: true,
  careers: true,
};

export const THEME_OPTION_LABELS = {
  fontPreset: {
    brand: "Kantin marka düzeni",
    clean: "Temiz ve sade",
    editorial: "Editorial",
  },
  colorPreset: {
    kantin: "Kantin mavisi",
    midnight: "Derin lacivert",
    ocean: "Ocean teal",
  },
  headingScale: {
    compact: "Kompakt",
    balanced: "Dengeli",
    expressive: "Vurgulu",
  },
  bodyScale: {
    compact: "Kompakt",
    balanced: "Dengeli",
    comfortable: "Rahat okunur",
  },
  cardDensity: {
    compact: "Sıkı",
    balanced: "Dengeli",
    airy: "Ferah",
  },
  homeSectionOrder: {
    menu: "Şube menüleri",
    merch: "Merch Drop",
    memories: "Anılarımız",
    events: "Etkinlikler",
    branches: "Şubeler ve Instagram",
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function oneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && allowed.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseSectionOrder(value: unknown): HomeSectionKey[] {
  if (!Array.isArray(value)) return [...DEFAULT_THEME_SETTINGS.homeSectionOrder];

  const order = value.filter(
    (item): item is HomeSectionKey =>
      typeof item === "string" && HOME_SECTION_KEYS.includes(item as HomeSectionKey),
  );
  const unique = [...new Set(order)];

  return unique.length === HOME_SECTION_KEYS.length
    ? unique
    : [...DEFAULT_THEME_SETTINGS.homeSectionOrder];
}

export function parseThemeSettings(value: unknown): ThemeSettings {
  const record = isRecord(value) ? value : {};

  return {
    fontPreset: oneOf(record.fontPreset, FONT_PRESETS, DEFAULT_THEME_SETTINGS.fontPreset),
    colorPreset: oneOf(record.colorPreset, COLOR_PRESETS, DEFAULT_THEME_SETTINGS.colorPreset),
    headingScale: oneOf(
      record.headingScale,
      HEADING_SCALES,
      DEFAULT_THEME_SETTINGS.headingScale,
    ),
    bodyScale: oneOf(record.bodyScale, BODY_SCALES, DEFAULT_THEME_SETTINGS.bodyScale),
    cardDensity: oneOf(
      record.cardDensity,
      CARD_DENSITIES,
      DEFAULT_THEME_SETTINGS.cardDensity,
    ),
    homeSectionOrder: parseSectionOrder(record.homeSectionOrder),
  };
}

export function parseSectionVisibility(value: unknown): SectionVisibility {
  const record = isRecord(value) ? value : {};

  return {
    homeHero: booleanValue(record.homeHero, DEFAULT_SECTION_VISIBILITY.homeHero),
    branches: booleanValue(record.branches, DEFAULT_SECTION_VISIBILITY.branches),
    menu: booleanValue(record.menu, DEFAULT_SECTION_VISIBILITY.menu),
    events: booleanValue(record.events, DEFAULT_SECTION_VISIBILITY.events),
    merch: booleanValue(record.merch, DEFAULT_SECTION_VISIBILITY.merch),
    memories: booleanValue(record.memories, DEFAULT_SECTION_VISIBILITY.memories),
    instagram: booleanValue(record.instagram, DEFAULT_SECTION_VISIBILITY.instagram),
    careers: booleanValue(record.careers, DEFAULT_SECTION_VISIBILITY.careers),
  };
}

export function isHomeSectionKey(value: string): value is HomeSectionKey {
  return HOME_SECTION_KEYS.includes(value as HomeSectionKey);
}
