import type { ReactNode } from "react";
import PublicEnhancements from "@/components/effects/PublicEnhancements";
import { PublicDataNotice } from "@/components/data-state/PublicDataNotice";
import { getCommonPublicData } from "@/lib/public-data/common";
import type { CommonPublicData, PublicDataEnvelope } from "@/lib/public-data/types";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import styles from "./PublicPageShell.module.css";

type PublicPageShellProps = {
  children: ReactNode;
  common?: PublicDataEnvelope<CommonPublicData>;
  issues?: string[];
};

export default async function PublicPageShell({ children, common, issues = [] }: PublicPageShellProps) {
  const resolvedCommon = common ?? (await getCommonPublicData());

  const theme = resolvedCommon.data.themeSettings;
  const combinedIssues = [...new Set([...resolvedCommon.issues, ...issues])];

  return (
    <div
      className="public-theme-root"
      data-body-scale={theme.bodyScale}
      data-card-density={theme.cardDensity}
      data-color-preset={theme.colorPreset}
      data-font-preset={theme.fontPreset}
      data-heading-scale={theme.headingScale}
    >
      <a className={styles.skipLink} href="#main">
        İçeriğe geç
      </a>

      <SiteHeader navigation={resolvedCommon.data.primaryNavigation} />

      <main id="main">
        <PublicDataNotice issues={combinedIssues} />
        {children}
      </main>

      <SiteFooter data={resolvedCommon.data} />
      <PublicEnhancements />
    </div>
  );
}
