import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env/public";
import type { Database } from "@/lib/supabase/database.types";

const PUBLIC_DATA_TIMEOUT_MS = 8_000;

function createTimedSignal(parentSignal?: AbortSignal | null): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(PUBLIC_DATA_TIMEOUT_MS);

  if (!parentSignal) return timeoutSignal;
  return AbortSignal.any([parentSignal, timeoutSignal]);
}

export function createPublicClient() {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch(input, init) {
        return fetch(input, {
          ...init,
          cache: "no-store",
          signal: createTimedSignal(init?.signal),
        });
      },
    },
  });
}
