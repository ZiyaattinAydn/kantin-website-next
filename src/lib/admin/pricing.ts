const MAX_PRICE_CENTS = 100_000_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseTryPrice(value: string, nullable: true): number | null;
export function parseTryPrice(value: string, nullable?: false): number;
export function parseTryPrice(value: string, nullable = false): number | null {
  const raw = value.trim();
  if (!raw) {
    if (nullable) return null;
    throw new Error("Fiyat zorunlu.");
  }

  const compact = raw.replace(/[₺\s]/g, "");
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(compact)) {
    throw new Error("Fiyatı 85 veya 85,50 biçiminde gir.");
  }

  const amount = Number(compact.replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Fiyat sıfır veya daha büyük olmalı.");
  }

  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || cents > MAX_PRICE_CENTS) {
    throw new Error("Fiyat izin verilen aralığın dışında.");
  }

  return cents;
}

export function formatTryPriceInput(value: number | null | undefined): string {
  if (typeof value !== "number") return "";
  const amount = value / 100;
  return (value % 100 === 0 ? String(amount) : amount.toFixed(2)).replace(".", ",");
}

export function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

export function assertUuid(value: string, label: string): string {
  if (!isUuid(value)) throw new Error(`${label} geçersiz.`);
  return value;
}

export function optionalText(value: FormDataEntryValue | null, maxLength: number): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  if (text.length > maxLength) throw new Error(`Metin en fazla ${maxLength} karakter olabilir.`);
  return text;
}

const RETURN_QUERY_KEYS = new Set([
  "q",
  "category",
  "branch",
  "active",
  "missing",
  "page",
]);

export function safePricingReturnPath(value: string | null | undefined): string {
  if (!value || value.length > 600) return "/admin/pricing";

  try {
    const url = new URL(value, "https://kantin.local");
    if (url.origin !== "https://kantin.local" || url.pathname !== "/admin/pricing") {
      return "/admin/pricing";
    }

    const params = new URLSearchParams();
    for (const [key, entry] of url.searchParams.entries()) {
      if (RETURN_QUERY_KEYS.has(key) && entry.length <= 120) params.set(key, entry);
    }

    const search = params.toString();
    return `/admin/pricing${search ? `?${search}` : ""}`;
  } catch {
    return "/admin/pricing";
  }
}

export function pricingResultPath(
  returnTo: string | null | undefined,
  type: "notice" | "error",
  message: string,
): string {
  const safePath = safePricingReturnPath(returnTo);
  const url = new URL(safePath, "https://kantin.local");
  url.searchParams.delete(type === "notice" ? "error" : "notice");
  url.searchParams.set(type, message.slice(0, 220));
  return `${url.pathname}?${url.searchParams.toString()}`;
}
