import Script from "next/script";
import SiteFooter from "./SiteFooter";
import SiteHeader, { type ActivePage } from "./SiteHeader";

type LegacyScript = {
  id: string;
  src: string;
  type?: "module";
};

type PublicPageShellProps = {
  activePage: ActivePage;
  markup: string;
  scripts?: LegacyScript[];
};

export default function PublicPageShell({
  activePage,
  markup,
  scripts = [],
}: PublicPageShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>

      <SiteHeader activePage={activePage} />

      {/*
        Bu içerik mevcut ve güvenilir statik proje kaynaklarından geliyor.
        Görsel eşitliği koruyan geçiş katmanıdır; bölümler sonraki adımlarda
        tek tek gerçek React bileşenlerine ayrılacaktır.
      */}
      <main id="main" dangerouslySetInnerHTML={{ __html: markup }} />

      <SiteFooter />

      <Script
        id={`kantin-main-${activePage}`}
        src="/assets/js/main.js?v=next-migration-1"
        strategy="afterInteractive"
      />

      {scripts.map((script) => (
        <Script
          key={script.id}
          id={script.id}
          src={script.src}
          type={script.type}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}
