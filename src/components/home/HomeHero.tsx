import Link from "next/link";
import ActionLink from "@/components/ui/ActionLink";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";
import type { HomeHeroData } from "@/lib/public-data/types";

const marqueeItems = Array.from({ length: 4 }, (_, index) => index);

export default function HomeHero({
  data = fallbackHomeData.hero,
}: {
  data?: HomeHeroData;
}) {
  return (
    <section className="hero dotted-paper">
      <AmbientDoodles />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1>
            {data.title[0]}
            <br />
            <span>{data.title[1]}</span>
          </h1>
          <p className="hero-lead">{data.description}</p>
          <div className="hero-actions">
            <ActionLink href={data.primaryAction.href} variant="primary">
              {data.primaryAction.label} <span aria-hidden="true">↗</span>
            </ActionLink>
            <ActionLink href={data.secondaryAction.href} variant="ghost">
              {data.secondaryAction.label}
            </ActionLink>
          </div>
          <div aria-label="Kantin özellikleri" className="hero-meta">
            {data.features.map((feature) => (
              <Link className="hero-meta-link" href={feature.href} key={feature.label}>
                <span>{feature.label}</span>
                <span aria-hidden="true" className="hero-meta-arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="hero-art reveal reveal-delay-1">
          <div className="hero-sticker sticker-top">sip.</div>
          <svg className="hero-illustration" viewBox="0 0 560 620">
            <path d="M95 484c43-47 90-61 133-47 34 11 46 40 82 44 58 7 92-51 153-39 31 6 53 26 67 52" />
            <path d="M152 443 119 204h171l-32 239" />
            <path d="M139 285c42 20 88 20 133 0" />
            <path d="M183 204c-1-51 20-81 63-91" />
            <path d="M210 111c32-5 58 4 78 28" />
            <path d="m399 148-75 295h113l52-206" />
            <path d="M344 363c29 21 66 29 110 23" />
            <path d="M398 148c24-12 48-10 71 6" />
            <path d="M113 520h369" />
            <path d="M213 522c19 17 29 38 30 62M391 521c-19 17-29 38-30 62" />
            <circle cx="346" cy="204" r="19" />
            <path d="M351 185c8-24 24-38 48-43" />
          </svg>
          <div className="hero-sticker sticker-bottom">share.</div>
        </div>
      </div>

      <div aria-hidden="true" className="marquee">
        <div className="marquee-track">
          {["first", "second"].map((group) => (
            <div key={group} className="marquee-group">
              {marqueeItems.map((item) => (
                <span key={`${group}-${item}`}>{data.marquee}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
