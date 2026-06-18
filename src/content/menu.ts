export type MenuBranch = "alsancak" | "atakent";

export type BranchOption = {
  id: MenuBranch;
  label: string;
  description: string;
};

export type PriceTableRow = {
  name: string;
  detail?: string;
  prices: string[];
};

export type CompactMenuItem = {
  name: string;
  detail?: string;
  price: string;
};

export type FoodMenuItem = {
  name: string;
  description?: string;
  highlight?: string;
  allergens?: string;
  price: string;
  priceNote?: string;
  badge?: "ACILI" | "VEGAN";
  className?: string;
};

export type EditorialMenuItem = {
  name: string;
  description: string;
  price: string;
};

export type CoffeeMenuGroup = {
  title: string;
  subtitle?: string;
  items: CompactMenuItem[];
};

export const branchOptions: BranchOption[] = [
  {
    id: "alsancak",
    label: "Alsancak",
    description: "Self-servis · kokteyl yok",
  },
  {
    id: "atakent",
    label: "Atakent",
    description: "Bubble kokteyl · grill",
  },
];

export const menuHero = {
  eyebrow: "Menüler şubeye göre değişir",
  title: "Şubeni seç",
  description:
    "Alsancak ve Atakent’in ortak ürünleri olsa da kokteyl ve yiyecek seçenekleri aynı değildir. Aşağıdan gideceğin şubeyi seç.",
  mark: "ALS—ATA",
} as const;

export const alsancakIntro = {
  kicker: "Alsancak Menu.",
  titleLines: ["Bira +", "yanında"],
  description:
    "Alsancak menüsünde kokteyl bulunmaz. Fıçı ve şişe bira, şarap, fritöz ürünleri, sandviçler ve deli tabakları servis edilir.",
} as const;

export const alsancakDraftBeers: PriceTableRow[] = [
  { name: "Becks", prices: ["₺100", "₺215", "₺245"] },
  { name: "Belfast", prices: ["₺90", "₺200", "₺230"] },
  { name: "Efes Pilsen", prices: ["₺90", "₺200", "₺230"] },
];

export const alsancakBottleBeers: CompactMenuItem[] = [
  { name: "Amsterdam", detail: "50 cl", price: "₺300" },
  { name: "Becks", detail: "33 cl / 50 cl", price: "₺230 / ₺250" },
  { name: "Bomonti Filtresiz", detail: "50 cl", price: "₺240" },
  { name: "Bud", detail: "33 cl / 50 cl", price: "₺250 / ₺275" },
  { name: "Corona", detail: "35,5 cl", price: "₺275" },
  { name: "Duvel", detail: "33 cl", price: "₺300" },
  { name: "Efes Pilsen", detail: "30 cl / 50 cl", price: "₺150 / ₺230" },
  { name: "Efes Malt", detail: "50 cl", price: "₺230" },
  { name: "Efes Glutensiz", detail: "50 cl", price: "₺250" },
  { name: "Efes Özel Seri", detail: "50 cl", price: "₺230" },
  { name: "Erdinger", detail: "33 cl", price: "₺300" },
  { name: "Miller", detail: "33 cl", price: "₺250" },
  { name: "Hoegaarden", detail: "33 cl", price: "₺300" },
];

export const alsancakDeliItems: FoodMenuItem[] = [
  {
    name: "Chorizo Şiş",
    description: "Baby enginar · chorizo · top peyniri · şeker domates.",
    price: "₺200",
  },
  {
    name: "Peynir Şiş",
    description: "Top peyniri · şeker domates.",
    price: "₺120",
  },
  {
    name: "Turşu Şiş",
    description:
      "Biberli zeytin · kornişon turşu · peynir dolgulu kiraz biber · biber turşusu.",
    price: "₺75",
  },
  {
    name: "Kuru İncir Şiş",
    description: "Kuru incir · eski kaşar peyniri · siyah üzüm.",
    price: "₺140",
  },
  { name: "Çerez", price: "₺80", className: "beer-salad-preceding-item" },
];

export const cheesePortions = {
  feature: {
    name: "Sanayi Tabağı",
    description:
      "5 adet küp tulum peyniri · 5 adet küp eski kaşar peyniri · 2 adet turşu şiş.",
    price: "₺185",
  },
  note: "Tulum, eski kaşar veya yarım yarım karışık olarak hazırlanabilir.",
  prices: [
    { label: "Yarım", price: "₺50" },
    { label: "Tam", price: "₺100" },
  ],
  options: [
    {
      name: "Tulum Peyniri",
      detail: "Orta sertlikte · menşei Bergama",
      portion: "Yarım: 6 küp · Tam: 12 küp",
    },
    {
      name: "Eski Kaşar Peyniri",
      detail: "Antep Fıstığı Ezmesi · Stracciatella Peyniri · Mortadella · Roka",
      portion: "Yarım: 6 küp · Tam: 12 küp",
    },
    {
      name: "Karışık Küp Peynir",
      detail: "Tulum + eski kaşar birlikte",
      portion: "Yarım: 3 tulum + 3 kaşar · Tam: 6 tulum + 6 kaşar",
      mixed: true,
    },
  ],
} as const;

export const beerSalads = [
  {
    name: "Pasta Fredda",
    description: "Fusilli makarna · biber · soğan · mısır · balzamik sos · turşu.",
    prices: [
      { label: "Tam", price: "₺200" },
      { label: "Yarım", price: "₺100" },
    ],
  },
  {
    name: "Patates Salata",
    description: "Patates · Dijon hardal · dereotu · taze soğan · hardal tohumu.",
    prices: [
      { label: "Tam", price: "₺200" },
      { label: "Yarım", price: "₺100" },
    ],
  },
] as const;

export const alsancakWine = {
  name: "LA Smyrna",
  description: "Beyaz · Rosé · Kırmızı",
  price: "Kadeh ₺300",
  priceDetail: "Karaf 75 cl ₺1200",
} as const;

export const alsancakFryerItems: FoodMenuItem[] = [
  {
    name: "Tortilla Cips",
    description: "Yanında seçtiğin {highlight}.",
    highlight: "1 sos ücretsiz",
    price: "₺125",
  },
  {
    name: "Patates Kızartması",
    description: "Yanında seçtiğin {highlight}. Tulum veya trüf dokunuşu +₺70.",
    highlight: "2 sos ücretsiz",
    price: "₺220",
  },
  {
    name: "Tavuk Kızartması",
    description: "Coleslaw ile birlikte servis edilir.",
    price: "₺275",
  },
  {
    name: "Çıtır Chili Tavuk",
    description: "Çıtır ve belirgin acılı tavuk.",
    price: "₺285",
    badge: "ACILI",
  },
  {
    name: "Frankfurter",
    description: "Coleslaw ile servis edilir. Glutensiz seçeneği bulunur.",
    price: "₺250",
  },
];

export const alsancakOvenItems: FoodMenuItem[] = [
  {
    name: "Ege Sandviç",
    description: "Stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.",
    price: "₺260",
  },
  {
    name: "Kasap Sandviç",
    description:
      "Hindi füme · stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.",
    price: "₺320",
  },
  {
    name: "Ballı Jambon Sandviç",
    description: "Antep fıstığı ezmesi · stracciatella peyniri · mortadella · roka.",
    price: "₺380",
  },
  {
    name: "Pretzel",
    description: "Cheddar sos ile servis edilir.",
    price: "₺125",
  },
];

export const sauceBar = {
  kicker: "Ekstra sos +₺30",
  title: "Sosunu seç.",
  items: [
    "Kantin Sos",
    "Dereotlu Mayonez",
    "Acı Barbekü",
    "Cheddar Dip",
    "Acı Mayonez",
    "Trüf Mayonez",
    "Sweet Chili",
  ],
} as const;

export const coffeeGroups: CoffeeMenuGroup[] = [
  {
    title: "Kahve",
    subtitle: "Sıcak / Soğuk",
    items: [
      { name: "Espresso", price: "₺180" },
      { name: "Americano", price: "₺180" },
      { name: "Cappuccino", price: "₺200" },
      { name: "Latte", price: "₺200" },
      { name: "Flat White", price: "₺200" },
      { name: "Macchiato", price: "₺200" },
      { name: "Mocha", price: "₺200" },
      { name: "Filtre Kahve", price: "₺180" },
      { name: "Cold Brew", detail: "18H", price: "₺220" },
    ],
  },
  {
    title: "Spesiyaller",
    items: [
      { name: "Mont Blanc Latte", price: "₺240" },
      { name: "Pink Brew", price: "₺240" },
      { name: "Black Sesame Hojicha", price: "₺330" },
      { name: "Matcha Berry", price: "₺330" },
      { name: "Lotus Latte", price: "₺260" },
    ],
  },
  {
    title: "Kahve Dışı",
    items: [
      { name: "Matcha Latte", price: "₺280" },
      { name: "Cloud Matcha", price: "₺260" },
      { name: "Yuzu Cooler", price: "₺260" },
      { name: "Coco Matcha", price: "₺330" },
      { name: "Hojicha Latte", price: "₺280" },
    ],
  },
];

export const coffeeExtras = [
  { label: "Tatlılar", description: "Kantin Rolls", price: "₺230" },
  {
    label: "Ekstralar",
    description: "Karamel · Vanilya · Beyaz Çikolata",
    price: "₺30",
  },
  {
    label: "Alternatif sütler",
    description: "Badem · Soya · Yulaf · Hindistan Cevizi",
    price: "₺40",
  },
] as const;

export const atakentIntro = {
  kicker: "Atakent Bubbles + Drinks",
  titleLines: ["Kokteyl +", "fıçı"],
  description:
    "Bubble ve house kokteyller yalnızca Atakent menüsündedir. Bira, şarap ve kokteyllerin ardından aşağıda Atakent mutfağı yer alır.",
} as const;

export const atakentDraftBeers: PriceTableRow[] = [
  { name: "Becks", prices: ["₺160", "₺250"] },
  { name: "Stella Artois", prices: ["₺180", "₺260"] },
  { name: "Efes Pilsen", prices: ["₺150", "₺230"] },
];

export const atakentBubbleCocktails: EditorialMenuItem[] = [
  {
    name: "Garden Fizz",
    description: "Malfy Originale, zencefil, limonotu ve tropical mate çayı.",
    price: "₺480",
  },
  {
    name: "Banana Oolong",
    description: "Havana Club Añejo 3, Malibu ve muz.",
    price: "₺480",
  },
  {
    name: "Cherry Paloma",
    description: "Olmeca, vişne, greyfurt ve saline.",
    price: "₺480",
  },
];

export const atakentHouseCocktails: EditorialMenuItem[] = [
  { name: "Greenhouse", description: "Absolut, kavun ve lime.", price: "₺520" },
  {
    name: "Peach Leaf",
    description: "Malfy Originale, şeftali, fesleğen ve Lillet Rosé.",
    price: "₺520",
  },
  {
    name: "Palo Santo",
    description: "Olmeca Altos, salatalık, bianco vermut ve mürver çiçeği.",
    price: "₺520",
  },
  {
    name: "Fig + Tonka",
    description: "Jameson Black Barrel, incir, tonka ve mahlep.",
    price: "₺520",
  },
  {
    name: "Coffee Vermouth",
    description: "Martini Fiero, kahve ve Ramazzotti.",
    price: "₺520",
  },
];

export const atakentBottleBeers: CompactMenuItem[] = [
  { name: "Amsterdam", detail: "50 cl", price: "₺300" },
  { name: "Becks", detail: "33 cl", price: "₺240" },
  { name: "Bomonti Filtresiz", detail: "50 cl", price: "₺260" },
  { name: "Bud", detail: "33 cl", price: "₺250" },
  { name: "Bud", detail: "50 cl", price: "₺300" },
  { name: "Corona", detail: "35,5 cl", price: "₺300" },
  { name: "Duvel", detail: "33 cl", price: "₺320" },
  { name: "Efes Pilsen", detail: "30 cl", price: "₺170" },
  { name: "Efes Malt", detail: "50 cl", price: "₺250" },
  { name: "Efes Glutensiz", detail: "50 cl", price: "₺270" },
  { name: "Efes Özel Seri", detail: "50 cl", price: "₺250" },
  { name: "Erdinger", detail: "33 cl", price: "₺320" },
  { name: "Miller", detail: "33 cl", price: "₺270" },
  { name: "Hoegaarden", detail: "33 cl", price: "₺320" },
];

export const atakentWines: PriceTableRow[] = [
  {
    name: "LA Smyrna",
    detail: "Beyaz · Kırmızı · Rosé",
    prices: ["₺450", "₺2000"],
  },
  { name: "Cinzano Prosecco", prices: ["₺580", "₺2600"] },
  {
    name: "LA Monreve",
    detail: "Beyaz · Kırmızı",
    prices: ["—", "₺2400"],
  },
];

export const atakentHotItems: FoodMenuItem[] = [
  {
    name: "Patates Kızartması",
    description: "Cajun baharatlı, trüf mayonez ve acı-tatlı BBQ sos ile.",
    allergens: "Alerjenler: Yumurta.",
    price: "₺230",
    priceNote: "Trüflü +₺70",
  },
  {
    name: "Tavuk Pane",
    description: "Baharatlı çıtır tavuk ve ev yapımı coleslaw.",
    allergens: "Alerjenler: Gluten, yumurta, süt ürünleri.",
    price: "₺270",
  },
  {
    name: "İstiridye Mantarı",
    description: "Tempura istiridye mantarı ve toum sos.",
    allergens: "Alerjenler: Gluten, yumurta.",
    price: "₺230",
  },
];

export const atakentGrillItems: FoodMenuItem[] = [
  {
    name: "İncik & Mısır",
    description:
      "Soya ve pirinç sirkesi ile marine edilmiş kemiksiz tavuk but, mısır püresi ile.",
    allergens: "Alerjenler: Soya, süt ürünleri.",
    price: "₺210",
    priceNote: "/ adet",
  },
  {
    name: "Karides & Ananas",
    description:
      "Sarımsak, biberiye ve kekik ile ızgaralanmış karides; ananas ve narenciye sos ile.",
    allergens: "Alerjenler: Kabuklu deniz ürünleri, süt ürünleri, sülfitler.",
    price: "₺240",
    priceNote: "/ adet",
  },
  {
    name: "Köfte & Humus",
    description: "Pekmezli misket köfte, kestane mantarı ve ev yapımı humus.",
    allergens: "Alerjenler: Gluten, yumurta, susam.",
    price: "₺210",
    priceNote: "/ adet",
  },
];

export const atakentDessert = {
  kicker: "Tatlı",
  name: "Çikolata Mousse",
  description: "Yoğun çikolatalı mousse.",
  allergens: "Alerjenler: Süt ürünleri, yumurta.",
  price: "₺225",
} as const;
