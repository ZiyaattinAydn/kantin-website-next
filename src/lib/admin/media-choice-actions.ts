"use server";
import { isUuid } from "./pricing";
import { loadMediaChoices } from "./media-choices";
export async function loadMediaChoicePage(page = 0, search = "") {
  try {
    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page > 10000 ||
      typeof search !== "string"
    )
      return { ok: false as const, message: "Görseller yüklenemedi." };
    return {
      ok: true as const,
      media: await loadMediaChoices(undefined, page, search),
    };
  } catch {
    return {
      ok: false as const,
      message: "Görseller yüklenemedi. Tekrar deneyin.",
    };
  }
}

export async function loadSelectedMediaChoice(id: string) {
  if (!isUuid(id)) return [];
  try {
    return await loadMediaChoices([id]);
  } catch {
    return [];
  }
}
