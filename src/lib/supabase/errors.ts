export type SupabaseAppErrorCode =
  | "configuration"
  | "network"
  | "permission_denied"
  | "not_found"
  | "validation"
  | "unknown";

export type SupabaseAppError = Readonly<{
  code: SupabaseAppErrorCode;
  message: string;
  originalCode?: string;
  details?: string;
}>;

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  status?: unknown;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function inferCode(error: ErrorLike): SupabaseAppErrorCode {
  const originalCode = asString(error.code);
  const status = typeof error.status === "number" ? error.status : undefined;

  if (status === 401 || status === 403 || originalCode === "42501") {
    return "permission_denied";
  }

  if (status === 404 || originalCode === "PGRST116") {
    return "not_found";
  }

  if (originalCode?.startsWith("22") || originalCode === "23514") {
    return "validation";
  }

  return "unknown";
}

export function normaliseSupabaseError(
  error: unknown,
  fallbackMessage = "Supabase işlemi tamamlanamadı.",
): SupabaseAppError {
  if (error instanceof TypeError) {
    return {
      code: "network",
      message: "Supabase bağlantısı kurulamadı. İnternet bağlantısını kontrol edin.",
      details: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: error.message.includes("NEXT_PUBLIC_SUPABASE_")
        ? "configuration"
        : "unknown",
      message: error.message || fallbackMessage,
    };
  }

  if (typeof error === "object" && error !== null) {
    const errorLike = error as ErrorLike;

    return {
      code: inferCode(errorLike),
      message: asString(errorLike.message) ?? fallbackMessage,
      originalCode: asString(errorLike.code),
      details: asString(errorLike.details),
    };
  }

  return { code: "unknown", message: fallbackMessage };
}
