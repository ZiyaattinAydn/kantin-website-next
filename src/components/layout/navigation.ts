export type NavigationItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "Ana sayfa", exact: true },
  { href: "/events", label: "Etkinlikler" },
  { href: "/menu", label: "Menü" },
  { href: "/#subeler", label: "Şubeler", exact: true },
];
