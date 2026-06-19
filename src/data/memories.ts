export type MemoryPhotoLayout =
  | "feature"
  | "portrait"
  | "wide"
  | "standard";

export type MemoryPhoto = {
  src: string;
  alt: string;
  caption: string;
  label: string;
  layout: MemoryPhotoLayout;
};

export const memoriesSection = {
  eyebrow: "Aralık 2023’ten bugüne",
  title: "Anılarımız",
  introduction:
    "Kantin; soğuk içecekleri beklemeden alıp sohbete kaldığın, hızlı self-servis ritmi sokak kültürüyle buluşturan samimi bir pub olarak doğdu.",
  statement:
    "Aynı sokak, aynı ruh. Sadece artık biraz daha fazla yerimiz var.",
  chapters: [
    {
      label: "Alsancak · İlk durak",
      title: "Sokağın ritmine göre.",
      description:
        "Tepsini al, soğuk biranı seç ve arkadaşlarının yanına dön. Alsancak’ta amaç en başından beri basitti: beklemeyi azaltmak, masadaki sohbeti bölmemek ve sokağın enerjisine karışmak.",
    },
    {
      label: "Atakent · Bubble Bar",
      title: "Köpüğü kokteyle taşıdık.",
      description:
        "Bira kadar rahat içilen ve ikinci turu doğal hissettiren kokteyllerin peşine düştük. Karbonasyon, kimya, tekrar tekrar denenen tarifler ve bol merak; Atakent’in bahçesinde hızlı servis edilen Bubble ve house kokteyllere dönüştü.",
    },
  ],
  closingLine:
    "Samimi ekip, hızlı servis, paylaşmalık tabaklar ve arkadaşlarla uzayan akşamlar.",
} as const;

export const memoryPhotos: MemoryPhoto[] = [
  {
    src: "/assets/img/memories/team-door.webp",
    alt: "Kantin ekibinden dört kişi şubenin girişinde birlikte poz veriyor.",
    caption: "Kapının önünde, aynı ruhun etrafında.",
    label: "Ekip",
    layout: "feature",
  },
  {
    src: "/assets/img/memories/door-conversation.webp",
    alt: "Kantin girişinde sohbet eden üç ekip üyesi.",
    caption: "Günün temposu çoğu zaman kapının önünde başlıyor.",
    label: "Ekip",
    layout: "portrait",
  },
  {
    src: "/assets/img/memories/apron-tray.webp",
    alt: "Kantin önlüğü giyen bir ekip üyesi elinde servis tepsisiyle gülümsüyor.",
    caption: "Servise hazır, enerjisi hep yerinde.",
    label: "Kantin ekibi",
    layout: "portrait",
  },
  {
    src: "/assets/img/memories/beer-cheers.webp",
    alt: "Bir misafir elinde bira ve atıştırmalıkla gülümsüyor.",
    caption: "Bir bardak, birkaç lokma ve uzayan sohbetler.",
    label: "Akşamüstü",
    layout: "standard",
  },
  {
    src: "/assets/img/memories/memory-card.webp",
    alt: "Bir kişi elinde Kantin'e ait küçük bir kart tutuyor.",
    caption: "Küçük detaylar da anılara karışıyor.",
    label: "Hatıra",
    layout: "portrait",
  },
  {
    src: "/assets/img/memories/night-closeup.webp",
    alt: "Gece çekiminde Kantin önlüğü giyen ekip üyeleri yakın planda görülüyor.",
    caption: "Gece uzadığında tempo düşmüyor.",
    label: "Gece vardiyası",
    layout: "standard",
  },
  {
    src: "/assets/img/memories/kitchen-laugh.webp",
    alt: "İki ekip üyesi mutfakta sandviç hazırlarken gülüyor.",
    caption: "Paylaşmalık tabaklar, mutfakta bol kahkaha.",
    label: "Mutfak",
    layout: "wide",
  },
  {
    src: "/assets/img/memories/counter-rhythm.webp",
    alt: "Bir ekip üyesi servis tezgâhının arkasında çalışıyor.",
    caption: "Tezgâhın arkasındaki günlük ritim.",
    label: "Self-servis",
    layout: "portrait",
  },
  {
    src: "/assets/img/memories/keg-run.webp",
    alt: "İki Kantin ekip üyesi şubenin önünde bira fıçılarını taşıyor.",
    caption: "Bir sonraki tur için hazırlık.",
    label: "Günlük akış",
    layout: "standard",
  },
];
