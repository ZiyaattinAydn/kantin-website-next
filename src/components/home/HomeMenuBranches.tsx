import Link from "next/link";

type MenuBranch = {
  slug: "alsancak" | "atakent";
  code: "ALS" | "ATA";
  name: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  title: string;
  description: string;
  tags: string[];
  delayClass?: string;
};

const menuBranches: MenuBranch[] = [
  {
    slug: "alsancak",
    code: "ALS",
    name: "Alsancak",
    image: {
      src: "/assets/img/branches/alsancak-1.jpg",
      width: 1080,
      height: 1350,
    },
    title: "Bira, şarap ve hızlı atıştırmalıklar.",
    description:
      "Fıçı ve şişe biralar, sandviçler, fritöz ürünleri, deli şişleri ve gün boyu açık kahve barı. Kokteyl bu şubenin menüsünde yer almıyor.",
    tags: ["Self-servis", "Bira", "Kahve Barı"],
  },
  {
    slug: "atakent",
    code: "ATA",
    name: "Atakent",
    image: {
      src: "/assets/img/branches/atakent-1.webp",
      width: 841,
      height: 1155,
    },
    title: "Bubble kokteyller, aperitifler ve grill.",
    description:
      "Fıçı ve şişe biraların yanında bubble ve house kokteyller; sıcak tabaklar, 17:00 sonrası ızgara şişleri ve tatlı.",
    tags: ["Kokteyl", "Grill", "Bahçe"],
    delayClass: "reveal-delay-1",
  },
];

export default function HomeMenuBranches() {
  return (
    <section className="section section-blue">
      <div className="container">
        <div className="section-heading reveal branch-menu-heading">
          <p className="eyebrow eyebrow-light">Yanlış şubeye yanlış menü yok</p>
          <h2>
            Önce şubeni seç.
            <br />
            Sonra canının çektiğine bak.
          </h2>
        </div>

        <div className="home-menu-branches">
          {menuBranches.map((branch) => (
            <article
              key={branch.slug}
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

              <Link
                className="button button-white"
                href={`/menu?sube=${branch.slug}`}
              >
                {branch.name} menüsü ↗
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
