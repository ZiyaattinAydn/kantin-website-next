import type { ReactNode } from "react";
import PublicEnhancements from "@/components/effects/PublicEnhancements";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type PublicPageShellProps = {
  children: ReactNode;
};

export default function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>

      <SiteHeader />

      <main id="main">{children}</main>

      <SiteFooter />
      <PublicEnhancements />
    </>
  );
}
