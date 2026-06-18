import Link from "next/link";
import { footerNavigation, siteIdentity } from "@/data/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <Link className={styles.brand} href="/" aria-label="Kantin ana sayfa">
            kantin<span>.</span>
          </Link>
          <p className={styles.intro}>
            {siteIdentity.sloganLines[0]}
            <br />
            {siteIdentity.sloganLines[1]}
          </p>
        </div>

        {footerNavigation.map((group) => (
          <nav key={group.title} className={styles.links} aria-label={`${group.title} bağlantıları`}>
            <p className={styles.label}>{group.title}</p>
            {group.links.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        ))}
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} kantin.</span>
        <span>İzmir’de iyi akşamlar için.</span>
      </div>
    </footer>
  );
}
