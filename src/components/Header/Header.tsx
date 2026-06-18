import Link from "next/link";
import styles from "./Header.module.css";

type HeaderProps = {
  siteName: string;
};

export default function Header({ siteName }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          {siteName}
        </Link>

        <nav aria-label="Ana navigasyon">
          <ul className={styles.navigation}>
            <li>
              <Link href="/">Ana Sayfa</Link>
            </li>

            <li>
              <Link href="/menu">Menü</Link>
            </li>

            <li>
              <Link href="/events">Etkinlikler</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}