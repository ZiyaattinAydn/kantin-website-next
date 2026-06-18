import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" href="/" aria-label="Kantin ana sayfa">
            kantin<span>.</span>
          </Link>
          <p>
            savor the sip,
            <br />
            share the bite.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer keşfet bağlantıları">
          <p className="footer-label">Keşfet</p>
          <Link href="/events">Etkinlikler</Link>
          <Link href="/menu">Şube menüleri</Link>
          <Link href="/#subeler">Konumlar</Link>
        </nav>

        <div className="footer-links">
          <p className="footer-label">Sosyal</p>
          <a
            href="https://www.instagram.com/kantinizmir/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>
          <a href="mailto:hello@kantin.pub">hello@kantin.pub</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} kantin.</span>
        <span>İzmir’de iyi akşamlar için.</span>
      </div>
    </footer>
  );
}
