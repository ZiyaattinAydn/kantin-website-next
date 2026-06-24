import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminAccess } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    reason?: string | string[];
    signedOut?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const [params, access] = await Promise.all([searchParams, getAdminAccess()]);

  if (access.status === "authorized") {
    redirect("/admin");
  }

  const reason = first(params.reason);
  const signedOut = first(params.signedOut);
  const nextPath = first(params.next) ?? "/admin";

  const isUnauthorized =
    reason === "unauthorized" || access.status === "unauthorized";
  const initialMessage = isUnauthorized
    ? "Açık oturumun yönetici yetkisine sahip değil. Yetkili hesapla giriş yap."
    : signedOut === "1"
      ? "Oturum güvenli biçimde kapatıldı."
      : undefined;

  return (
    <>
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link className="brand" href="/">
            kantin<span>.</span>
          </Link>
          <span className="admin-mode-badge">Güvenli yönetici girişi</span>
        </div>
      </header>

      <main className="admin-main">
        <section className="container admin-login">
          <div className="admin-login-card">
            <p className="eyebrow">Yetkili girişi</p>
            <h1>
              Yönetici paneli<span>.</span>
            </h1>
            <AdminLoginForm
              initialMessage={initialMessage}
              initialMessageIsError={isUnauthorized}
              nextPath={nextPath}
            />
          </div>
        </section>
      </main>
    </>
  );
}
