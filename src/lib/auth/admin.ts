import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { reportAuthUnavailable } from "./availability";

type AppRole = Database["public"]["Enums"]["app_role"];

type AdminIdentity = {
  userId: string;
  email: string | null;
  displayName: string | null;
  role: AppRole;
};

export type AdminAccess =
  | { status: "signed_out" }
  | { status: "unavailable" }
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
  try {
    return await getAvailableAdminAccess();
  } catch {
    reportAuthUnavailable("access");
    return { status: "unavailable" };
  }
});

async function getAvailableAdminAccess(): Promise<AdminAccess> {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (claimError && (claimError.name === "AuthRetryableFetchError" || ("status" in claimError && Number(claimError.status) >= 500))) {
    throw new Error("Authentication unavailable");
  }
  if (claimError || !userId) {
    return { status: "signed_out" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw new Error("Profile lookup unavailable");
  if (!profile) {
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
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const access = await getAdminAccess();

  if (access.status === "unavailable") {
    redirect("/admin/login?reason=unavailable");
  }
  if (access.status === "signed_out") {
    redirect("/admin/login?next=/admin");
  }

  if (access.status === "unauthorized") {
    redirect("/admin/login?reason=unauthorized");
  }

  return access.admin;
}
