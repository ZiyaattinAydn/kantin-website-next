import type { Metadata } from "next";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { menuMarkup } from "@/content/menu";

export const metadata: Metadata = {
  title: "Şube Menüleri",
  description: "Kantin Alsancak ve Atakent şubelerine özel menüler.",
};

export default function MenuPage() {
  return (
    <PublicPageShell
      page="menu"
      markup={menuMarkup}
      scripts={[
        {
          id: "kantin-menu-branches",
          src: "/assets/js/menu-branches.js?v=react-layout-1",
        },
      ]}
    />
  );
}
