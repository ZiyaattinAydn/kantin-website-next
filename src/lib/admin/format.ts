export function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function formatAdminDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export function toDateTimeLocal(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date).replace(" ", "T");
}

export function formatMoneyCents(value: unknown): string {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: value % 100 === 0 ? 0 : 2,
  }).format(value / 100);
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return json.length > 90 ? `${json.slice(0, 87)}…` : json;
  }
  return String(value);
}
