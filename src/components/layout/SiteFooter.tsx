import Link from "next/link";
import DoodleParallaxStage from "@/components/effects/DoodleParallaxStage";
import { fallbackCommonData } from "@/lib/public-data/fallbacks";
import type { CommonPublicData } from "@/lib/public-data/types";
import styles from "./SiteFooter.module.css";

export default function SiteFooter({
  data = fallbackCommonData,
}: {
  data?: CommonPublicData;
}) {
  const year = new Date().getFullYear();
  const {
    branches,
    footerContent,
    footerNavigation,
    publicEmail,
    siteIdentity,
    sectionVisibility,
  } = data;

  return (
    <footer className={styles.footer}>
      <DoodleParallaxStage className={styles.doodleStage} movementX={10} movementY={7}>
        <img
          alt=""
          className={`${styles.doodle} ${styles.doodleLeft}`}
          src="/assets/img/merch/doodles/table-friends.png"
        />
        <img
          alt=""
          className={`${styles.doodle} ${styles.doodleRight}`}
          src="/assets/img/merch/doodles/walking.png"
        />
      </DoodleParallaxStage>

      <div className={`container ${styles.topGrid}`}>
        <section className={styles.brandBlock} aria-labelledby="footer-brand-title">
          <Link className={styles.brand} href="/" aria-label="Kantin ana sayfa">
            {siteIdentity.name.replace(/\.$/, "")}<span>.</span>
          </Link>
          <h2 id="footer-brand-title">{footerContent.title}</h2>
          <p className={styles.intro}>{footerContent.intro}</p>

          <div className={styles.brandActions}>
            <a
              className={styles.primaryAction}
              href={siteIdentity.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram’a git <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.secondaryAction} href={`mailto:${publicEmail}`}>
              {publicEmail}
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

              {branch.shortDescription ? (
                <p className={styles.branchDescription}>{branch.shortDescription}</p>
              ) : null}

              <div className={styles.featureList} aria-label={`${branch.name} özellikleri`}>
                {branch.features.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>

              <div className={styles.hoursNote}>
                {(branch.openingHours?.length
                  ? branch.openingHours
                  : ["Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et."]
                ).map((line) => <p key={line}>{line}</p>)}
              </div>

              {branch.phone || branch.publicEmail ? (
                <div className={styles.branchContacts}>
                  {branch.phone ? (
                    <a href={`tel:${branch.phone.replace(/[^+\d]/g, "")}`}>
                      {branch.phone}
                    </a>
                  ) : null}
                  {branch.publicEmail ? (
                    <a href={`mailto:${branch.publicEmail}`}>{branch.publicEmail}</a>
                  ) : null}
                </div>
              ) : null}

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
              {group.title === "Keşfet" && sectionVisibility.memories ? (
                <Link href="/#anilarimiz">Anılarımız</Link>
              ) : null}
            </nav>
          ))}
        </div>

        {sectionVisibility.careers ? (
          <section className={styles.workCard} aria-labelledby="footer-work-title">
            <div>
              <p className={styles.label}>Ekibe katıl</p>
              <h3 id="footer-work-title">{footerContent.workTitle}</h3>
              <p>{footerContent.workDescription}</p>
            </div>
            <Link href="/careers">
              Başvuru formuna git <span aria-hidden="true">↗</span>
            </Link>
          </section>
        ) : null}
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} {siteIdentity.name}</span>
        <span>{siteIdentity.slogan}</span>
        <span>{footerContent.bottomLine}</span>
      </div>
    </footer>
  );
}
