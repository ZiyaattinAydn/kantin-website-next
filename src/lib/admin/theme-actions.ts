"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import {
  BODY_SCALES,
  CARD_DENSITIES,
  COLOR_PRESETS,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_THEME_SETTINGS,
  FONT_PRESETS,
  HEADING_SCALES,
  HOME_SECTION_KEYS,
  isHomeSectionKey,
  type HomeSectionKey,
} from "@/lib/theme/settings";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function allowedValue<T extends readonly string[]>(
  value: string,
  allowed: T,
  fallback: T[number],
): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function parseOrder(formData: FormData): HomeSectionKey[] {
  const order = formData
    .getAll("homeSectionOrder")
    .filter((value): value is string => typeof value === "string")
    .filter(isHomeSectionKey);
  const unique = [...new Set(order)];

  if (unique.length !== HOME_SECTION_KEYS.length) {
    throw new Error("Ana sayfa bölüm sırası eksik veya geçersiz.");
  }

  return unique;
}

function safeMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.slice(0, 220);
  return "Tasarım ayarları kaydedilemedi.";
}

export async function saveThemeSettings(formData: FormData): Promise<never> {
  const admin = await requireAdmin();
  const reset = textValue(formData, "_intent") === "reset";
  let destination: string;

  try {
    const theme = reset
      ? DEFAULT_THEME_SETTINGS
      : {
          fontPreset: allowedValue(
            textValue(formData, "fontPreset"),
            FONT_PRESETS,
            DEFAULT_THEME_SETTINGS.fontPreset,
          ),
          colorPreset: allowedValue(
            textValue(formData, "colorPreset"),
            COLOR_PRESETS,
            DEFAULT_THEME_SETTINGS.colorPreset,
          ),
          headingScale: allowedValue(
            textValue(formData, "headingScale"),
            HEADING_SCALES,
            DEFAULT_THEME_SETTINGS.headingScale,
          ),
          bodyScale: allowedValue(
            textValue(formData, "bodyScale"),
            BODY_SCALES,
            DEFAULT_THEME_SETTINGS.bodyScale,
          ),
          cardDensity: allowedValue(
            textValue(formData, "cardDensity"),
            CARD_DENSITIES,
            DEFAULT_THEME_SETTINGS.cardDensity,
          ),
          homeSectionOrder: parseOrder(formData),
        };

    const visibility = reset
      ? DEFAULT_SECTION_VISIBILITY
      : {
          homeHero: checked(formData, "visibility.homeHero"),
          branches: checked(formData, "visibility.branches"),
          menu: checked(formData, "visibility.menu"),
          events: checked(formData, "visibility.events"),
          merch: checked(formData, "visibility.merch"),
          memories: checked(formData, "visibility.memories"),
          instagram: checked(formData, "visibility.instagram"),
          careers: checked(formData, "visibility.careers"),
        };

    const supabase = await createClient();
    const { error } = await supabase.from("site_settings").upsert(
      [
        {
          key: "theme.settings",
          value: theme as unknown as Json,
          description:
            "Kontrollü font, renk, başlık, gövde, kart yoğunluğu ve ana sayfa sıralama ayarları.",
          is_public: true,
          status: "published",
          is_active: true,
          sort_order: 9,
        },
        {
          key: "sections.visibility",
          value: visibility as unknown as Json,
          description: "Public site bölüm görünürlükleri.",
          is_public: true,
          status: "published",
          is_active: true,
          sort_order: 5,
        },
      ] as never,
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);

    await logAdminAction({
      actorId: admin.userId,
      action: reset ? "theme_reset" : "theme_update",
      entityType: "site_settings",
      entityId: null,
      entityLabel: reset ? "Varsayılan tasarım ayarları" : "Kontrollü tasarım ayarları",
      metadata: {
        theme,
        visibility,
      },
    });

    destination = `/admin/theme?notice=${encodeURIComponent(
      reset ? "Tasarım ayarları güvenli varsayılanlara döndürüldü." : "Tasarım ayarları kaydedildi.",
    )}`;
  } catch (error) {
    destination = `/admin/theme?error=${encodeURIComponent(safeMessage(error))}`;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/theme");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  revalidatePath("/careers");
  redirect(destination);
}
