import "server-only";

import { getSupabasePublicEnv } from "@/lib/env/public";
import {
  normaliseSupabaseError,
  type SupabaseAppError,
} from "@/lib/supabase/errors";

export type SupabaseHealthResult =
  | Readonly<{ ok: true; checkedAt: string; service: "auth" }>
  | Readonly<{
      ok: false;
      checkedAt: string;
      service: "auth";
      error: SupabaseAppError;
    }>;

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

export async function checkSupabaseConnection(): Promise<SupabaseHealthResult> {
  const checkedAt = new Date().toISOString();

  try {
    const { url, publishableKey } = getSupabasePublicEnv();
    const response = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        ok: false,
        checkedAt,
        service: "auth",
        error: {
          code:
            response.status === 401 || response.status === 403
              ? "permission_denied"
              : "network",
          message: `Supabase bağlantı kontrolü ${response.status} yanıtı verdi. Proje URL'si ile publishable key'in aynı projeye ait olduğunu kontrol edin.`,
        },
      };
    }

    return { ok: true, checkedAt, service: "auth" };
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      service: "auth",
      error: normaliseSupabaseError(
        error,
        "Supabase bağlantı kontrolü başarısız.",
      ),
    };
  }
}
