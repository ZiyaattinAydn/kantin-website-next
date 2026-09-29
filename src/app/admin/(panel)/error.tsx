"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reportAdminRenderError } from "@/lib/admin/render-error-actions";
export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const pathname = usePathname();
  useEffect(() => {
    void reportAdminRenderError(pathname).catch(() => {});
  }, [pathname]);
  return (
    <section>
      <h1>Bu ekran yüklenemedi.</h1>
      <p>Bağlantı sorunu oluşmuş olabilir. Tekrar deneyin.</p>
      <button type="button" onClick={reset}>
        Tekrar dene
      </button>
    </section>
  );
}
