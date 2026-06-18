import AmbientDoodles from "@/components/effects/AmbientDoodles";
import Link from "next/link";

type LocationBranch = {
  slug: "alsancak" | "atakent";
  code: "ALS" | "ATA";
  visualClass: "branch-alsancak" | "branch-atakent";
  eyebrow: string;
  title: string;
  address: string;
  mapsUrl: string;
  images: Array<{
    src: string;
    width: number;
    height: number;
  }>;
  delayClass?: string;
};

const locationBranches: LocationBranch[] = [
  {
    slug: "alsancak",
    code: "ALS",
    visualClass: "branch-alsancak",
    eyebrow: "Alsancak · Self-servis",
    title: "1464. Sokak No:71/A",
    address: "Alsancak, Konak / İzmir",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Kantin+Izmir+1464+Sokak+71A+Alsancak+Konak+Izmir",
    images: [
      {
        src: "/assets/img/branches/alsancak-1.jpg",
        width: 1080,
        height: 1350,
      },
      {
        src: "/assets/img/branches/alsancak-2.jpg",
        width: 1080,
        height: 1350,
      },
    ],
  },
  {
    slug: "atakent",
    code: "ATA",
    visualClass: "branch-atakent",
    eyebrow: "Atakent · Bahçe",
    title: "2035 Sokak No:6",
    address: "Atakent, Karşıyaka / İzmir",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Kantin+Atakent+2035+Sokak+6+Atakent+Karsiyaka+Izmir",
    images: [
      {
        src: "/assets/img/branches/atakent-1.webp",
        width: 841,
        height: 1155,
      },
      {
        src: "/assets/img/branches/atakent-2.webp",
        width: 773,
        height: 1143,
      },
    ],
    delayClass: "reveal-delay-1",
  },
];

export default function HomeLocations() {
  return (
    <section className="section dotted-paper" id="subeler">
      <AmbientDoodles />
      <div className="container">
        <div className="section-header reveal">
          <div>
            <p className="eyebrow">Adres net, menü net</p>
            <h2>Şubeler</h2>
          </div>
        </div>

        <div className="branch-grid">
          {locationBranches.map((branch) => (
            <article
              key={branch.slug}
              className={`branch-card reveal${
                branch.delayClass ? ` ${branch.delayClass}` : ""
              }`}
            >
              <div
                aria-hidden="true"
                className={`branch-visual ${branch.visualClass}`}
              >
                <span className="branch-watermark branch-watermark-back">
                  {branch.code}
                </span>

                <div className="branch-photo-grid">
                  {branch.images.map((image, index) => (
                    <figure
                      key={image.src}
                      className={`branch-photo-frame branch-photo-frame-${
                        index === 0 ? "main" : "secondary"
                      }`}
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

                <span className="branch-watermark branch-watermark-front">
                  {branch.code}
                </span>
              </div>

              <div className="branch-content branch-content-v3">
                <div>
                  <p className="eyebrow">{branch.eyebrow}</p>
                  <h3>{branch.title}</h3>
                  <p>{branch.address}</p>
                </div>

                <div className="branch-actions">
                  <a
                    className="button button-primary"
                    href={branch.mapsUrl}
                    rel="noopener"
                    target="_blank"
                  >
                    Yol tarifi ↗
                  </a>
                  <Link
                    className="button button-ghost"
                    href={`/menu?sube=${branch.slug}`}
                  >
                    Menüyü aç
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="instagram-strip reveal">
          <div>
            <p className="eyebrow">Güncel saatler ve duyurular</p>
            <h3>@kantinizmir</h3>
          </div>
          <a
            className="button button-primary"
            href="https://www.instagram.com/kantinizmir/"
            rel="noopener"
            target="_blank"
          >
            Instagram’a git ↗
          </a>
        </div>
      </div>
    </section>
  );
}
