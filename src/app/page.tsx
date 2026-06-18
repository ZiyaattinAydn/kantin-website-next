import type { Metadata } from "next";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { homeMarkup } from "@/content/home";

export const metadata: Metadata = {
  title: "kantin. — savor the sip, share the bite",
};

export default function HomePage() {
  return (
    <PublicPageShell
      page="home"
      markup={homeMarkup}
      scripts={[
        {
          id: "kantin-events-home",
          src: "/assets/js/events-public.js?v=react-layout-1",
          type: "module",
        },
      ]}
    />
  );
}
