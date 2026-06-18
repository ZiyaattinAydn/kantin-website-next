import type {
  MerchBundle,
  MerchDoodle,
  MerchProductContent,
} from "@/types/content";

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

export const merchProducts = [
  {
    id: "oversize-tshirt",
    slug: "oversize-tshirt",
    index: "01",
    name: "Oversize Tişört",
    price: 690,
    currency: "TRY",
    description:
      "500 GSM pamuk single jersey kumaş, rahat ve oversize kesim unisex tişört.",
    detail: "Beden: S–XL · Materyal: %100 Organik Pamuk",
    image: "/assets/img/merch/tee-front.jpg",
    imageAlt: "Ön yüzünde küçük mavi k. logosu bulunan krem oversize tişört.",
    branchIds: ["alsancak"],
    active: true,
    sortOrder: 1,
  },
  {
    id: "tote-canta",
    slug: "tote-canta",
    index: "02",
    name: "Tote Çanta",
    price: 440,
    currency: "TRY",
    description:
      "Orta boy, iç cepli, sağlam saplı, çok amaçlı pamuk kanvas tote çanta.",
    detail: "Beden: Tek beden · Materyal: %100 Pamuk Kanvas",
    image: "/assets/img/merch/tote-front.jpg",
    imageAlt: "Krem Kantin tote çanta.",
    branchIds: ["alsancak"],
    active: true,
    sortOrder: 2,
  },
  {
    id: "baseball-sapka",
    slug: "baseball-sapka",
    index: "03",
    name: "Baseball Şapka",
    price: 420,
    currency: "TRY",
    description:
      "Önde nakışlı logo, arkada metal tokalı ayarlanabilir kayışa sahip Kantin mavi baseball şapka.",
    detail: "Beden: Tek beden · Materyal: %100 Organik Pamuk",
    image: "/assets/img/merch/cap-front.jpg",
    imageAlt: "Mavi Kantin baseball şapka.",
    branchIds: ["alsancak"],
    active: true,
    sortOrder: 3,
  },
] as const satisfies readonly MerchProductContent[];

export const merchSideProducts = merchProducts.filter(
  (product) => product.id !== "oversize-tshirt",
);

export const merchBundles = [
  { name: "Oversize Tişört", price: 690 },
  { name: "Full Set · Tişört + Çanta + Şapka", price: 1350 },
  { name: "2’li Kombin · seçili iki parça", price: 990 },
] as const satisfies readonly MerchBundle[];

export const merchBundleOffers = merchBundles.filter(
  (bundle) => bundle.name !== "Oversize Tişört",
);
