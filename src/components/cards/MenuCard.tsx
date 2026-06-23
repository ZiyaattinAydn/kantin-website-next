import ActionLink from "@/components/ui/ActionLink";
import type { HomeMenuBranch } from "@/types/content";

export default function MenuCard({ branch }: { branch: HomeMenuBranch }) {
  return (
    <article
      className={`home-menu-branch home-menu-branch-${branch.code.toLowerCase()} reveal${
        branch.delayClass ? ` ${branch.delayClass}` : ""
      }`}
    >
      {branch.image ? (
        <div aria-hidden="true" className="home-menu-media">
          <img
            alt=""
            decoding="async"
            height={branch.image.height}
            loading="lazy"
            src={branch.image.src}
            width={branch.image.width}
          />
        </div>
      ) : null}

      <div className="home-menu-code">{branch.code}</div>
      <p className="eyebrow eyebrow-light">{branch.name}</p>
      <h3>{branch.title}</h3>
      <p>{branch.description}</p>

      <div className="home-menu-tags">
        {branch.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <ActionLink href={`/menu?sube=${branch.slug}`} variant="white">
        {branch.name} menüsü ↗
      </ActionLink>
    </article>
  );
}
