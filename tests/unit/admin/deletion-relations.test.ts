import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
  "supabase/migrations/20260620010000_initial_schema.sql",
  "utf8",
);

describe("admin kalıcı silme ilişkileri", () => {
  it("ürün silinirken kategori korunur, ürünün şube ve varyant alt kayıtları cascade olur", () => {
    expect(schema).toMatch(
      /create table public\.menu_items[\s\S]*category_id uuid not null references public\.menu_categories\(id\) on delete restrict/,
    );
    expect(schema).toMatch(
      /create table public\.menu_item_branches[\s\S]*menu_item_id uuid not null references public\.menu_items\(id\) on delete cascade/,
    );
    expect(schema).toMatch(
      /create table public\.menu_item_variants[\s\S]*menu_item_branch_id uuid not null references public\.menu_item_branches\(id\) on delete cascade/,
    );
  });
});
