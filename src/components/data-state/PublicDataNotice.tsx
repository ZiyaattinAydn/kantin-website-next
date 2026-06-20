import styles from "./PublicDataNotice.module.css";

export function PublicDataNotice({ issues }: { issues: string[] }) {
  if (!issues.length) return null;

  return (
    <div className={styles.notice} role="status">
      <strong>Canlı veri geçici olarak kullanılamıyor.</strong>{" "}
      Site doğrulanmış yerel içerikle çalışmaya devam ediyor.
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
