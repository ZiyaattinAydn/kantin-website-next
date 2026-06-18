import Script from "next/script";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export type PublicPageName = "home" | "events" | "menu";

type LegacyScript = {
  id: string;
  src: string;
  type?: "module";
};

type PublicPageShellProps = {
  page: PublicPageName;
  markup: string;
  scripts?: LegacyScript[];
};

export default function PublicPageShell({
  page,
  markup,
  scripts = [],
}: PublicPageShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>

      <SiteHeader />

      {/**
       * Büyük içerik blokları görsel eşitliği korumak için şimdilik mevcut
       * güvenilir statik kaynaktan geliyor. Header ve footer artık tamamen
       * React tarafından yönetiliyor; sıradaki aşamada ana sayfa bölümleri
       * küçük bileşenlere ayrılacak.
       */}
      <main id="main" dangerouslySetInnerHTML={{ __html: markup }} />

      <SiteFooter />

      <Script
        id={`kantin-main-${page}`}
        src="/assets/js/main.js?v=react-layout-1"
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
