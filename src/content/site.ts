export type NavigationItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export const siteIdentity = {
  name: "kantin.",
  sloganLines: ["savor the sip,", "share the bite."],
  instagramUrl: "https://www.instagram.com/kantinizmir/",
  email: "hello@kantin.pub",
} as const;

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "Ana sayfa", exact: true },
  { href: "/events", label: "Etkinlikler" },
  { href: "/menu", label: "Menü" },
  { href: "/#subeler", label: "Şubeler", exact: true },
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
      { href: `mailto:${siteIdentity.email}`, label: siteIdentity.email },
    ],
  },
];
