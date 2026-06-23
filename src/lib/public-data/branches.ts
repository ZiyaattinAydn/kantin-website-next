import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { TableRow } from "./helpers";

export const PUBLIC_BRANCH_COLUMNS =
  "id, slug, code, name, address_line, district, city, maps_url, short_description, phone, public_email, opening_hours, features, is_active, sort_order" as const;

export type PublicBranchRow = Pick<
  TableRow<"branches">,
  | "id"
  | "slug"
  | "code"
  | "name"
  | "address_line"
  | "district"
  | "city"
  | "maps_url"
  | "short_description"
  | "phone"
  | "public_email"
  | "opening_hours"
  | "features"
  | "is_active"
  | "sort_order"
>;

async function loadPublicBranchRows(): Promise<PublicBranchRow[]> {
  const client = createPublicClient();

  const { data, error } = await client
    .from("branches")
    .select(PUBLIC_BRANCH_COLUMNS)
    .order("sort_order");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export const getPublicBranchRows = cache(loadPublicBranchRows);