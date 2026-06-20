import type { FooterLink, NavigationItem } from "@/types/content";

export const siteIdentity = {
  name: "kantin.",
  slogan: "Savor the sip. Share the bite.",
  sloganLines: ["Savor the sip.", "Share the bite."],
  instagramUrl: "https://www.instagram.com/kantinizmir/",
} as const;

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "Ana sayfa", exact: true },
  { href: "/menu", label: "Menü" },
  { href: "/events", label: "Etkinlikler" },
];

export const footerNavigation: ReadonlyArray<{
  title: string;
  links: FooterLink[];
}> = [
  {
    title: "Keşfet",
    links: [
      { href: "/events", label: "Etkinlikler" },
      { href: "/menu", label: "Şube menüleri" },
      { href: "/#subeler", label: "Konumlar" },
    ],
  },
  {
    title: "Sosyal",
    links: [
      {
        href: siteIdentity.instagramUrl,
        label: "Instagram ↗",
        external: true,
      },
    ],
  },
];
