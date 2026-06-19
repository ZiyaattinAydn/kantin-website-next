import Link from "next/link";
import { branches } from "@/data/branches";
import { footerNavigation, siteIdentity } from "@/data/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <img
        aria-hidden="true"
        alt=""
        className={`${styles.doodle} ${styles.doodleLeft}`}
        src="/assets/img/merch/doodles/table-friends.png"
      />
      <img
        aria-hidden="true"
        alt=""
        className={`${styles.doodle} ${styles.doodleRight}`}
        src="/assets/img/merch/doodles/walking.png"
      />

      <div className={`container ${styles.topGrid}`}>
        <section className={styles.brandBlock} aria-labelledby="footer-brand-title">
          <Link className={styles.brand} href="/" aria-label="Kantin ana sayfa">
            kantin<span>.</span>
          </Link>
          <h2 id="footer-brand-title">İki şube, tek ruh.</h2>
          <p className={styles.intro}>
            Alsancak’ın sokak temposu, Atakent’in bahçe ve kokteyl ritmi.
            İkisinde de hızlı servis, samimi ekip ve uzayan sohbetler.
          </p>

          <div className={styles.brandActions}>
            <a
              className={styles.primaryAction}
              href={siteIdentity.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram’a git <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.secondaryAction} href={`mailto:${siteIdentity.email}`}>
              Bize yaz
            </a>
          </div>
        </section>

        <div className={styles.branchGrid}>
          {branches.map((branch) => (
            <article key={branch.id} className={styles.branchCard}>
              <div className={styles.branchHeading}>
                <div>
                  <span className={styles.branchCode}>{branch.code}</span>
                  <h3>{branch.name}</h3>
                </div>
                <span className={styles.cityPill}>{branch.city}</span>
              </div>

              <address>
                {branch.addressLine}
                <br />
                {branch.district} / {branch.city}
              </address>

              <div className={styles.featureList} aria-label={`${branch.name} özellikleri`}>
                {branch.features.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>

              <p className={styles.hoursNote}>
                Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et.
              </p>

              <div className={styles.branchActions}>
                <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Yol tarifi <span aria-hidden="true">↗</span>
                </a>
                <Link href={`/menu?sube=${branch.id}`}>Menüyü gör</Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={`container ${styles.secondaryGrid}`}>
        <div className={styles.navigationGroups}>
          {footerNavigation.map((group) => (
            <nav
              key={group.title}
              className={styles.links}
              aria-label={`${group.title} bağlantıları`}
            >
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
              {group.title === "Keşfet" ? <Link href="/#anilarimiz">Anılarımız</Link> : null}
            </nav>
          ))}
        </div>

        <section className={styles.workCard} aria-labelledby="footer-work-title">
          <div>
            <p className={styles.label}>Ekibe katıl</p>
            <h3 id="footer-work-title">Kantin’in bir parçası olmak ister misin?</h3>
            <p>
              Servis, mutfak, bar ve kasa ekipleri için vardiya tercihlerini belirleyip başvuru formunu doldur.
            </p>
          </div>
          <Link href="/careers">
            Başvuru formuna git <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} kantin.</span>
        <span>{siteIdentity.slogan}</span>
        <span>İzmir’de iyi akşamlar için.</span>
      </div>
    </footer>
  );
}
