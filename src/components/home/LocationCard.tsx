import ActionLink from "@/components/ui/ActionLink";
import type { LocationBranch } from "@/types/content";

export default function LocationCard({ branch }: { branch: LocationBranch }) {
  return (
    <article className={`branch-card reveal${branch.delayClass ? ` ${branch.delayClass}` : ""}`}>
      <div aria-hidden="true" className={`branch-visual ${branch.visualClass}`}>
        <span className="branch-watermark branch-watermark-back">{branch.code}</span>
        <div className="branch-photo-grid">
          {branch.images.map((image, index) => (
            <figure
              key={image.src}
              className={`branch-photo-frame branch-photo-frame-${index === 0 ? "main" : "secondary"}`}
            >
              <img
                alt=""
                className="branch-photo"
                decoding="async"
                height={image.height}
                loading="lazy"
                src={image.src}
                width={image.width}
              />
            </figure>
          ))}
        </div>
        <span className="branch-watermark branch-watermark-front">{branch.code}</span>
      </div>

      <div className="branch-content branch-content-v3">
        <div>
          <p className="eyebrow">{branch.eyebrow}</p>
          <h3>{branch.title}</h3>
          <p>{branch.address}</p>
        </div>
        <div className="branch-actions">
          <ActionLink href={branch.mapsUrl} variant="primary" external>
            Yol tarifi ↗
          </ActionLink>
          <ActionLink href={`/menu?sube=${branch.slug}`} variant="ghost">
            Menüyü gör
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
