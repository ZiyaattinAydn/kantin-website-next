import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminMutationPayload } from "./resource-validation";
import type { AdminTable } from "./resources";

export type AdminRow = Record<string, unknown>;

type RepositoryError = {
  code?: string;
};

class AdminRepositoryError extends Error {
  readonly code: string;

  constructor(message: string, code = "repository_error") {
    super(message);
    this.name = "AdminRepositoryError";
    this.code = code;
  }
}

function isAdminRow(value: unknown): value is AdminRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function operationError(error: RepositoryError | null, fallback: string): Error {
  if (error?.code === "23505") return new AdminRepositoryError("Aynı benzersiz değere sahip başka bir kayıt bulunuyor.", "unique");
  if (error?.code === "23503") return new AdminRepositoryError("Seçilen ilişkili kayıt bulunamadı veya artık kullanılamıyor.", "foreign_key");
  if (error?.code === "23514" || error?.code === "22P02") return new AdminRepositoryError("Alanlardan biri veritabanı kuralıyla uyuşmuyor.", "constraint");
  return new AdminRepositoryError(fallback);
}

function rowOrThrow(value: unknown): AdminRow {
  if (!isAdminRow(value)) throw new AdminRepositoryError("Veritabanı beklenen kayıt biçimini döndürmedi.", "invalid_response");
  return value;
}

export async function insertAdminRow(
  client: SupabaseClient,
  table: AdminTable,
  payload: AdminMutationPayload,
): Promise<AdminRow> {
  const { data, error } = await client.from(table).insert(payload).select("*").single();
  if (error) throw operationError(error, "Kayıt oluşturulamadı.");
  return rowOrThrow(data);
}

export async function updateAdminRow(
  client: SupabaseClient,
  table: AdminTable,
  id: string,
  payload: AdminMutationPayload,
): Promise<AdminRow> {
  const { data, error } = await client.from(table).update(payload).eq("id", id).select("*").single();
  if (error) throw operationError(error, "Kayıt güncellenemedi.");
  return rowOrThrow(data);
}

export async function readAdminRow(
  client: SupabaseClient,
  table: AdminTable,
  id: string,
): Promise<AdminRow> {
  const { data, error } = await client.from(table).select("*").eq("id", id).single();
  if (error) throw operationError(error, "Kayıt okunamadı.");
  return rowOrThrow(data);
}

export async function deleteAdminRow(
  client: SupabaseClient,
  table: AdminTable,
  id: string,
): Promise<void> {
  const { error } = await client.from(table).delete().eq("id", id);
  if (error?.code === "23503") {
    throw new AdminRepositoryError(
      "Bu kayıt başka bir ana kayıt tarafından kullanıldığı için silinemiyor. Önce bağlı kayıtları kaldır veya pasife al.",
      "foreign_key",
    );
  }
  if (error) throw operationError(error, "Kayıt kalıcı olarak silinemedi.");
}
