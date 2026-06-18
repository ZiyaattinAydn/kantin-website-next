import Link from "next/link";
import type { HomeMenuBranch } from "@/content/home";

export default function HomeMenuBranchCard({ branch }: { branch: HomeMenuBranch }) {
  return (
    <article
      className={`home-menu-branch home-menu-branch-${branch.code.toLowerCase()} reveal${
        branch.delayClass ? ` ${branch.delayClass}` : ""
      }`}
    >
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

      <div className="home-menu-code">{branch.code}</div>
      <p className="eyebrow eyebrow-light">{branch.name}</p>
      <h3>{branch.title}</h3>
      <p>{branch.description}</p>

      <div className="home-menu-tags">
        {branch.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <Link className="button button-white" href={`/menu?sube=${branch.slug}`}>
        {branch.name} menüsü ↗
      </Link>
    </article>
  );
}
