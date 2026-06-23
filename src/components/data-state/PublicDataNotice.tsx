import styles from "./PublicDataNotice.module.css";

export function PublicDataNotice({ issues }: { issues: string[] }) {
  if (!issues.length) return null;

  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <span className={styles.statusDot} aria-hidden="true" />
      <p>
        <strong>Yerel içerik gösteriliyor.</strong>{" "}
        Canlı veri bağlantısı düzeldiğinde sayfa otomatik olarak güncel içeriğe döner.
      </p>
    </div>
  );
}

export function PublicEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className={styles.empty} role="status">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
