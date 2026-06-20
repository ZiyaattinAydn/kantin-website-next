import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env/public";
import type { Database } from "@/lib/supabase/database.types";

const ADMIN_LOGIN_PATH = "/admin/login";

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.pathname = ADMIN_LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", nextPath);

  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
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

  const { data: claimData } = await supabase.auth.getClaims();
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
