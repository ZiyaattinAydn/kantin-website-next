import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type AppRole = Database["public"]["Enums"]["app_role"];

type AdminIdentity = {
  userId: string;
  email: string | null;
  displayName: string | null;
  role: AppRole;
};

export type AdminAccess =
  | { status: "signed_out" }
  | {
      status: "unauthorized";
      userId: string;
      email: string | null;
      role: AppRole | null;
      isActive: boolean;
    }
  | { status: "authorized"; admin: AdminIdentity };

function claimEmail(claims: Record<string, unknown>): string | null {
  const value = claims.email;
  return typeof value === "string" ? value : null;
}

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (claimError || !userId) {
    return { status: "signed_out" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      status: "unauthorized",
      userId,
      email: claimEmail(claimData.claims as Record<string, unknown>),
      role: null,
      isActive: false,
    };
  }

  if (!profile.is_active || profile.role !== "admin") {
    return {
      status: "unauthorized",
      userId,
      email: claimEmail(claimData.claims as Record<string, unknown>),
      role: profile.role,
      isActive: profile.is_active,
    };
  }

  return {
    status: "authorized",
    admin: {
      userId,
      email: claimEmail(claimData.claims as Record<string, unknown>),
      displayName: profile.display_name,
      role: profile.role,
    },
  };
});

export async function requireAdmin(): Promise<AdminIdentity> {
  const access = await getAdminAccess();

  if (access.status === "signed_out") {
    redirect("/admin/login?next=/admin");
  }

  if (access.status === "unauthorized") {
    redirect("/admin/login?reason=unauthorized");
  }

  return access.admin;
}
