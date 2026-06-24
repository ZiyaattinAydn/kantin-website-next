import Link from "next/link";
import { siteIdentity } from "@/data/site";
import { eventBranchLabels } from "@/data/events";
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

function contentLabel(event: KantinEvent) {
  return event.contentType === "announcement" ? "Duyuru" : "Etkinlik";
}

function branchLabel(event: KantinEvent, branchLabels: BranchMap) {
  if (event.branch === "both") return "Tüm şubeler";
  return branchLabels[event.branch] ?? "Kantin";
}

export default function EventCard({
  event,
  variant,
  branchLabels = eventBranchLabels,
}: EventCardProps) {
  const externalLink = safeExternalUrl(event.link);
  const imageUrl = safeImageUrl(event.imageUrl);
  const isAnnouncement = event.contentType === "announcement";
  const ctaLabel = event.ctaLabel || (isAnnouncement ? "Detayları gör" : "Kayıt / detay");

  if (variant === "home") {
    if (!event.startAt) return null;

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
            <span>{branchLabel(event, branchLabels)}</span>
            <span>{formatEventTime(event.startAt)}</span>
          </div>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          {externalLink ? (
            <a href={externalLink} rel="noopener" target="_blank">
              {ctaLabel} &#8599;
            </a>
          ) : (
            <Link href="/events">Detaya git &#8599;</Link>
          )}
        </div>
      </article>
    );
  }

  const timeRange = event.startAt
    ? `${formatEventTime(event.startAt)}${event.endAt ? `-${formatEventTime(event.endAt)}` : ""}`
    : null;

  return (
    <article
      className={`${styles.listCard}${imageUrl ? ` ${styles.hasImage}` : ""}`}
      data-branch={event.branch}
      data-content-type={event.contentType}
    >
      {event.startAt ? (
        <div className={styles.listDate}>
          <span>{formatEventMonth(event.startAt)}</span>
          <strong>{formatEventDay(event.startAt)}</strong>
          <small>{formatEventWeekday(event.startAt)}</small>
        </div>
      ) : (
        <div className={`${styles.listDate} ${styles.announcementDate}`}>
          <span>Merkez</span>
          <strong>!</strong>
          <small>Duyuru</small>
        </div>
      )}
      {imageUrl ? (
        <figure className={styles.listImage}>
          <img
            alt={`${event.title} ${isAnnouncement ? "duyuru" : "etkinlik"} görseli`}
            decoding="async"
            loading="lazy"
            src={imageUrl}
          />
        </figure>
      ) : null}
      <div className={styles.listBody}>
        <div className={`${styles.listTags} event-tags`}>
          <span className={styles.typeBadge}>{contentLabel(event)}</span>
          <span>{branchLabel(event, branchLabels)}</span>
          {event.startAt ? <span>{formatEventTime(event.startAt)}</span> : null}
        </div>
        <h2>{event.title}</h2>
        {event.description ? <p>{event.description}</p> : null}
        <div className={styles.listFooter}>
          <span>
            {event.startAt && timeRange
              ? `${formatEventFullDate(event.startAt)} · ${timeRange}`
              : "Yayınlanan duyuru"}
          </span>
          {externalLink ? (
            <a
              className={styles.calendarButton}
              href={externalLink}
              rel="noopener"
              target="_blank"
            >
              {ctaLabel} &#8599;
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EventsZeroState({
  instagramUrl = siteIdentity.instagramUrl,
  variant = "all",
}: {
  instagramUrl?: string;
  variant?: "all" | "events" | "announcements";
}) {
  const title = variant === "announcements"
    ? "Duyuru panosu sakin."
    : variant === "events"
      ? "Takvim sakin."
      : "Merkez şimdilik sakin.";
  const eyebrow = variant === "announcements"
    ? "Şu an yayınlanmış duyuru yok"
    : variant === "events"
      ? "Şu an yayınlanmış etkinlik yok"
      : "Şu an yayınlanmış içerik yok";
  const description = variant === "all"
    ? "Yeni bir etkinlik ya da duyuru eklendiğinde burada görünecek."
    : variant === "announcements"
      ? "Yeni bir duyuru yayınlandığında burada görünecek."
      : "Yeni bir etkinlik eklendiğinde tarih, saat ve şube bilgisi burada görünecek.";

  return (
    <article className={styles.zeroState}>
      <div className={styles.zeroMark}>00</div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>
          {title}
          <br />
          Bu da gayet normal.
        </h2>
        <p>{description}</p>
      </div>
      <a
        className="button button-primary"
        href={instagramUrl}
        rel="noopener"
        target="_blank"
      >
        Instagram&apos;ı takip et &#8599;
      </a>
    </article>
  );
}
