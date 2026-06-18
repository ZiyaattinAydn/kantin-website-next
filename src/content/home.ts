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
