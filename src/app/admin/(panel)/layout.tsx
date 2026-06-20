import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const identity = admin.displayName || admin.email || "Yetkili kullanıcı";
  return <AdminShell identity={identity}>{children}</AdminShell>;
}
