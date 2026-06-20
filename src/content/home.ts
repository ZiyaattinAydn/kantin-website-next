export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

export type MerchDoodle = {
  src: string;
  className: string;
};

export type MerchProduct = {
  name: string;
  price: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type MerchBundle = {
  name: string;
  price: string;
};

export type HomeMenuBranch = {
  slug: "alsancak" | "atakent";
  code: "ALS" | "ATA";
  name: string;
  image: ImageAsset;
  title: string;
  description: string;
  tags: string[];
  delayClass?: string;
};

export type LocationBranch = {
  slug: "alsancak" | "atakent";
  code: "ALS" | "ATA";
  visualClass: "branch-alsancak" | "branch-atakent";
  eyebrow: string;
  title: string;
  address: string;
  mapsUrl: string;
  images: ImageAsset[];
  delayClass?: string;
};

export const homeHero = {
  eyebrow: "Alsancak · Atakent · İzmir",
  title: ["Savor the sip.", "Share the bite."],
  description:
    "İki şube, iki farklı menü. Alsancak’ta self-servis sokak pub ruhu; Atakent’te bahçe, kokteyller ve daha geniş mutfak seçkisi.",
  primaryAction: { href: "/menu", label: "Şubeni ve menünü seç" },
  secondaryAction: { href: "#subeler", label: "Konumlara bak" },
  features: ["Şubeye özel menü", "Paylaşmalık tabaklar", "İyi müzik"],
  marquee: "Savor the sip. Share the bite.",
} as const;

export const homeMenuBranches: HomeMenuBranch[] = [
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

export const locationBranches: LocationBranch[] = [
  {
    slug: "alsancak",
    code: "ALS",
    visualClass: "branch-alsancak",
    eyebrow: "Alsancak · Self-servis",
    title: "1464. Sokak No:71/A",
    address: "Alsancak, Konak / İzmir",
    mapsUrl:
      "https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic",
    images: [
      { src: "/assets/img/branches/alsancak-1.jpg", width: 1080, height: 1350 },
      { src: "/assets/img/branches/alsancak-2.jpg", width: 1080, height: 1350 },
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
      "https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc",
    images: [
      { src: "/assets/img/branches/atakent-1.webp", width: 841, height: 1155 },
      { src: "/assets/img/branches/atakent-2.webp", width: 773, height: 1143 },
    ],
    delayClass: "reveal-delay-1",
  },
];

export const merchDoodles: MerchDoodle[] = [
  { src: "/assets/img/merch/doodles/table-friends.png", className: "merch-doodle-table" },
  { src: "/assets/img/merch/doodles/looking-up.png", className: "merch-doodle-look" },
  { src: "/assets/img/merch/doodles/bar-friends.png", className: "merch-doodle-bar" },
  { src: "/assets/img/merch/doodles/jumping.png", className: "merch-doodle-jump" },
  { src: "/assets/img/merch/doodles/cats-table.png", className: "merch-doodle-cats" },
  { src: "/assets/img/merch/doodles/sharing-drink.png", className: "merch-doodle-share" },
  { src: "/assets/img/merch/doodles/high-five.png", className: "merch-doodle-highfive" },
  { src: "/assets/img/merch/doodles/hugging.png", className: "merch-doodle-hug" },
  { src: "/assets/img/merch/doodles/walking.png", className: "merch-doodle-walk" },
];

export const merchProducts: MerchProduct[] = [
  {
    name: "Baseball Şapka",
    price: "₺420",
    description: "Önde nakışlı logo, arkada metal tokalı ayarlanabilir kayış.",
    image: "/assets/img/merch/cap-front.jpg",
    imageAlt: "Mavi Kantin baseball şapka.",
  },
  {
    name: "Tote Çanta",
    price: "₺440",
    description: "İç cepli, sağlam saplı, çok amaçlı pamuk kanvas tote.",
    image: "/assets/img/merch/tote-front.jpg",
    imageAlt: "Krem Kantin tote çanta.",
  },
];

export const merchBundles: MerchBundle[] = [
  { name: "Oversize Tişört", price: "₺690" },
  { name: "Full Set · Tişört + Çanta + Şapka", price: "₺1350" },
  { name: "2’li Kombin · seçili iki parça", price: "₺990" },
];
