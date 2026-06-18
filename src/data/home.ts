import { branchById } from "./branches";
import { siteIdentity } from "./site";
import type { HomeMenuBranch, LocationBranch } from "@/types/content";

export const homeHero = {
  eyebrow: "Alsancak · Atakent · İzmir",
  title: siteIdentity.sloganLines,
  description:
    "İki şube, iki farklı menü. Alsancak’ta self-servis sokak pub ruhu; Atakent’te bahçe, kokteyller ve daha geniş mutfak seçkisi.",
  primaryAction: { href: "/menu", label: "Şubeni ve menünü seç" },
  secondaryAction: { href: "#subeler", label: "Konumlara bak" },
  features: [
    { label: "Şubeye özel menü", href: "#menuler" },
    { label: "Paylaşmalık tabaklar", href: "/menu?sube=alsancak" },
    { label: "İyi müzik", href: "#etkinlikler" },
  ],
  marquee: siteIdentity.slogan,
} as const;

export const homeMenuBranches: HomeMenuBranch[] = [
  {
    slug: branchById.alsancak.id,
    code: branchById.alsancak.code,
    name: branchById.alsancak.name,
    image: {
      src: "/assets/img/branches/alsancak-1.jpg",
      width: 1080,
      height: 1350,
    },
    title: "Bira, şarap ve hızlı atıştırmalıklar.",
    description:
      "Fıçı ve şişe biralar, sandviçler, fritöz ürünleri, deli şişleri ve gün boyu açık kahve barı. Kokteyl bu şubenin menüsünde yer almıyor.",
    tags: [...branchById.alsancak.features],
  },
  {
    slug: branchById.atakent.id,
    code: branchById.atakent.code,
    name: branchById.atakent.name,
    image: {
      src: "/assets/img/branches/atakent-1.webp",
      width: 841,
      height: 1155,
    },
    title: "Bubble kokteyller, aperitifler ve grill.",
    description:
      "Fıçı ve şişe biraların yanında bubble ve house kokteyller; sıcak tabaklar, 17:00 sonrası ızgara şişleri ve tatlı.",
    tags: [...branchById.atakent.features],
    delayClass: "reveal-delay-1",
  },
];

export const locationBranches: LocationBranch[] = [
  {
    slug: branchById.alsancak.id,
    code: branchById.alsancak.code,
    visualClass: "branch-alsancak",
    eyebrow: "Alsancak · Self-servis",
    title: branchById.alsancak.addressLine,
    address: `${branchById.alsancak.district} / ${branchById.alsancak.city}`,
    mapsUrl: branchById.alsancak.mapsUrl,
    images: [
      { src: "/assets/img/branches/alsancak-1.jpg", width: 1080, height: 1350 },
      { src: "/assets/img/branches/alsancak-2.jpg", width: 1080, height: 1350 },
    ],
  },
  {
    slug: branchById.atakent.id,
    code: branchById.atakent.code,
    visualClass: "branch-atakent",
    eyebrow: "Atakent · Bahçe",
    title: branchById.atakent.addressLine,
    address: `${branchById.atakent.district} / ${branchById.atakent.city}`,
    mapsUrl: branchById.atakent.mapsUrl,
    images: [
      { src: "/assets/img/branches/atakent-1.webp", width: 841, height: 1155 },
      { src: "/assets/img/branches/atakent-2.webp", width: 773, height: 1143 },
    ],
    delayClass: "reveal-delay-1",
  },
];
