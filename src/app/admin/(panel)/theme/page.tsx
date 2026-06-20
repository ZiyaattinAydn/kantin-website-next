import ThemeSettingsForm from "./ThemeSettingsForm";
import styles from "./ThemeSettings.module.css";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_THEME_SETTINGS,
  parseSectionVisibility,
  parseThemeSettings,
} from "@/lib/theme/settings";

export const dynamic = "force-dynamic";

type ThemePageProps = {
  searchParams: Promise<{ notice?: string; error?: string }>;
};

export default async function ThemeSettingsPage({ searchParams }: ThemePageProps) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["theme.settings", "sections.visibility"]);

  const settings = new Map((data ?? []).map((row) => [row.key, row.value]));
  const theme = error
    ? DEFAULT_THEME_SETTINGS
    : parseThemeSettings(settings.get("theme.settings"));
  const visibility = error
    ? DEFAULT_SECTION_VISIBILITY
    : parseSectionVisibility(settings.get("sections.visibility"));

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Kontrollü tasarım yönetimi</p>
          <h1>
            Tema ayarları<span>.</span>
          </h1>
          <p>
            Marka dilini bozmadan renk, tipografi, kart yoğunluğu, bölüm görünürlüğü
            ve ana sayfa sıralamasını yönet.
          </p>
        </div>
        <a href="/" rel="noreferrer" target="_blank">
          Public siteyi aç ↗
        </a>
      </header>

      {params.notice ? <div className={styles.notice}>{params.notice}</div> : null}
      {params.error || error ? (
        <div className={styles.error} role="alert">
          {params.error || "Tasarım ayarları okunamadı; güvenli varsayılanlar gösteriliyor."}
        </div>
      ) : null}

      <ThemeSettingsForm initialTheme={theme} initialVisibility={visibility} />
    </section>
  );
}
