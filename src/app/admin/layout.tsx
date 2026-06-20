import type { ReactNode } from "react";
import AdminBodyClass from "@/components/admin/AdminBodyClass";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminBodyClass />
      {children}
    </>
  );
}
