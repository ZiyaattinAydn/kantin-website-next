import Link from "next/link";
import { siteIdentity } from "@/data/site";
import {
  eventBranchAddresses,
  eventBranchLabels,
} from "@/data/events";
import styles from "./EventCard.module.css";
import {
  formatEventDay,
  formatEventFullDate,
  formatEventMonth,
  formatEventTime,
  formatEventWeekday,
  safeExternalUrl,
  safeImageUrl,
  type KantinEvent,
} from "@/lib/events";

type BranchMap = Record<string, string>;

type EventCardProps = {
  event: KantinEvent;
  variant: "home" | "list";
  branchLabels?: BranchMap;
  branchAddresses?: BranchMap;
  instagramUrl?: string;
};

export default function EventCard({
  event,
  variant,
  branchLabels = eventBranchLabels,
  branchAddresses = eventBranchAddresses,
}: EventCardProps) {
  const externalLink = safeExternalUrl(event.link);
  const imageUrl = safeImageUrl(event.imageUrl);

  if (variant === "home") {
    return (
      <article className="event-card">
        {imageUrl ? (
          <figure className="event-card-image">
            <img
              alt={`${event.title} etkinlik görseli`}
              decoding="async"
              loading="lazy"
              src={imageUrl}
            />
          </figure>
        ) : null}
        <div className="event-date">
          <strong>{formatEventDay(event.startAt)}</strong>
          <span>{formatEventMonth(event.startAt)}</span>
        </div>
        <div className="event-content">
          <div className="event-tags">
            <span>{branchLabels[event.branch] ?? "Kantin"}</span>
            <span>{formatEventTime(event.startAt)}</span>
          </div>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          {externalLink ? (
            <a href={externalLink} rel="noopener" target="_blank">
              Kayıt / detay ↗
            </a>
          ) : (
            <Link href="/events">Detaya git ↗</Link>
          )}
        </div>
      </article>
    );
  }

  const address = event.location || branchAddresses[event.branch] || "Kantin";
  const timeRange = `${formatEventTime(event.startAt)}${
    event.endAt ? `–${formatEventTime(event.endAt)}` : ""
  }`;

  return (
    <article className={styles.listCard} data-branch={event.branch}>
      <div className={styles.listDate}>
        <span>{formatEventMonth(event.startAt)}</span>
        <strong>{formatEventDay(event.startAt)}</strong>
        <small>{formatEventWeekday(event.startAt)}</small>
      </div>
      {imageUrl ? (
        <figure className={styles.listImage}>
          <img
            alt={`${event.title} etkinlik görseli`}
            decoding="async"
            loading="lazy"
            src={imageUrl}
          />
        </figure>
      ) : null}
      <div className={styles.listBody}>
        <div className="event-tags">
          <span>{branchLabels[event.branch] ?? "Kantin"}</span>
          <span>{formatEventTime(event.startAt)}</span>
          <span>{address}</span>
        </div>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <div className={styles.listFooter}>
          <span>
            {formatEventFullDate(event.startAt)} · {timeRange}
          </span>
          {externalLink ? (
            <a
              className={styles.calendarButton}
              href={externalLink}
              rel="noopener"
              target="_blank"
            >
              Kayıt / detay ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EventsZeroState({
  instagramUrl = siteIdentity.instagramUrl,
}: {
  instagramUrl?: string;
}) {
  return (
    <article className={styles.zeroState}>
      <div className={styles.zeroMark}>00</div>
      <div>
        <p className="eyebrow">Şu an yayınlanmış etkinlik yok</p>
        <h2>
          Takvim sakin.
          <br />
          Bu da gayet normal.
        </h2>
        <p>Yeni bir etkinlik eklendiğinde tarih, saat ve şube bilgisi burada görünecek.</p>
      </div>
      <a
        className="button button-primary"
        href={instagramUrl}
        rel="noopener"
        target="_blank"
      >
        Instagram’ı takip et ↗
      </a>
    </article>
  );
}
