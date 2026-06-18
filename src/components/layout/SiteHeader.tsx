export type ActivePage = "home" | "events" | "menu";

type SiteHeaderProps = {
  activePage: ActivePage;
};

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  const activeClass = (page: ActivePage) =>
    activePage === page ? "active" : undefined;

  return (
    <header className="site-header" data-header>
      <div className="container nav-wrap">
        <a className="brand" href="/" aria-label="Kantin ana sayfa">
          kantin<span>.</span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="site-nav"
          aria-label="Menüyü aç"
          data-nav-toggle
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className="site-nav"
          id="site-nav"
          aria-label="Ana navigasyon"
          data-nav
        >
          <a className={activeClass("home")} href="/">
            Ana sayfa
          </a>
          <a className={activeClass("events")} href="/events">
            Etkinlikler
          </a>
          <a className={activeClass("menu")} href="/menu">
            Menü
          </a>
          <a href="/#subeler">Şubeler</a>
          <a className="nav-cta" href="/menu">
            Şubeni seç
          </a>
        </nav>
      </div>
    </header>
  );
}
