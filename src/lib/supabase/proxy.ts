import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env/public";
import type { Database } from "@/lib/supabase/database.types";
import { reportAuthUnavailable } from "@/lib/auth/availability";

const ADMIN_LOGIN_PATH = "/admin/login";

function loginRedirect(request: NextRequest, unavailable = false) {
  const url = request.nextUrl.clone();
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.pathname = ADMIN_LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", nextPath);
  if (unavailable) url.searchParams.set("reason", "unavailable");

  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function updateSession(request: NextRequest) {
  try {
    return await updateAvailableSession(request);
  } catch {
    reportAuthUnavailable("proxy");
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { ok: false, error: "Bu işlem şu anda tamamlanamadı. Tekrar deneyin." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (request.nextUrl.pathname === ADMIN_LOGIN_PATH) {
      // The login page independently checks access and renders a safe outage state.
      const response = NextResponse.next({ request });
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    return loginRedirect(request, true);
  }
}

async function updateAvailableSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: claimData, error } = await supabase.auth.getClaims();
  // Auth's transient/network errors must not render a protected page or throw a 500.
  if (error && (error.name === "AuthRetryableFetchError" || ("status" in error && Number(error.status) >= 500))) {
    throw new Error("Authentication unavailable");
  }
  const claims = claimData?.claims;

  const pathname = request.nextUrl.pathname;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isProtectedAdminPage =
    pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH;

  if (!claims && isAdminApi) {
    return NextResponse.json(
      { ok: false, error: "Oturum gerekli." },
      { status: 401 },
    );
  }

  if (!claims && isProtectedAdminPage) {
    return loginRedirect(request);
  }

  return response;
}
