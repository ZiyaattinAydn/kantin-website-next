export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <a className="brand footer-brand" href="/">
            kantin<span>.</span>
          </a>
          <p>
            savor the sip,
            <br />
            share the bite.
          </p>
        </div>

        <div className="footer-links">
          <p className="footer-label">Keşfet</p>
          <a href="/events">Etkinlikler</a>
          <a href="/menu">Şube menüleri</a>
          <a href="/#subeler">Konumlar</a>
        </div>

        <div className="footer-links">
          <p className="footer-label">Sosyal</p>
          <a
            href="https://www.instagram.com/kantinizmir/"
            target="_blank"
            rel="noopener"
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
