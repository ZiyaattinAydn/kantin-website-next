"use client";

import { useMemo, useState } from "react";
import { saveThemeSettings } from "@/lib/admin/theme-actions";
import type { SectionVisibility, ThemeSettings } from "@/lib/public-data/types";
import {
  BODY_SCALES,
  CARD_DENSITIES,
  COLOR_PRESETS,
  FONT_PRESETS,
  HEADING_SCALES,
  THEME_OPTION_LABELS,
  type HomeSectionKey,
} from "@/lib/theme/settings";
import styles from "./ThemeSettings.module.css";

const visibilityOptions: Array<{
  key: keyof SectionVisibility;
  label: string;
  description: string;
}> = [
  { key: "homeHero", label: "Ana hero", description: "Ana sayfanın üst marka alanı." },
  { key: "menu", label: "Şube menüleri", description: "Ana sayfadaki menü seçim kartları." },
  { key: "merch", label: "Merch Drop", description: "Ürün ve paket tanıtım alanı." },
  { key: "memories", label: "Anılarımız", description: "Marka hikâyesi ve fotoğraf galerisi." },
  { key: "events", label: "Etkinlikler", description: "Yaklaşan etkinlik kartları." },
  { key: "branches", label: "Şubeler", description: "Konumlar ve şube kartları." },
  { key: "instagram", label: "Instagram", description: "Şubeler alanındaki gönderi şeridi." },
  { key: "careers", label: "Kariyer bağlantıları", description: "Ekibe Katıl çağrıları ve bağlantıları." },
];

type OptionCardProps = {
  name: string;
  value: string;
  label: string;
  description: string;
  defaultChecked: boolean;
};

function OptionCard({
  name,
  value,
  label,
  description,
  defaultChecked,
}: OptionCardProps) {
  return (
    <label className={styles.optionCard}>
      <input defaultChecked={defaultChecked} name={name} type="radio" value={value} />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </label>
  );
}

function moveItem(
  items: HomeSectionKey[],
  index: number,
  direction: -1 | 1,
): HomeSectionKey[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  return copy;
}

export default function ThemeSettingsForm({
  initialTheme,
  initialVisibility,
}: {
  initialTheme: ThemeSettings;
  initialVisibility: SectionVisibility;
}) {
  const [order, setOrder] = useState<HomeSectionKey[]>(initialTheme.homeSectionOrder);
  const previewClasses = useMemo(
    () =>
      [
        styles.preview,
        styles[`previewColor_${initialTheme.colorPreset}`],
      ]
        .filter(Boolean)
        .join(" "),
    [initialTheme.colorPreset],
  );

  return (
    <form action={saveThemeSettings} className={styles.form}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>01</span>
            <h2>Renk paleti</h2>
          </div>
          <p>Yalnız test edilmiş marka paletleri kullanılabilir.</p>
        </div>
        <div className={styles.optionGrid}>
          {COLOR_PRESETS.map((value) => (
            <OptionCard
              defaultChecked={initialTheme.colorPreset === value}
              description={
                value === "kantin"
                  ? "Orijinal mavi, krem ve koyu lacivert."
                  : value === "midnight"
                    ? "Daha koyu ve premium mavi tonları."
                    : "Mavi-yeşil eksenli ferah alternatif."
              }
              key={value}
              label={THEME_OPTION_LABELS.colorPreset[value]}
              name="colorPreset"
              value={value}
            />
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>02</span>
            <h2>Tipografi</h2>
          </div>
          <p>Önceden izin verilen font eşleşmeleri ve ölçü aralıkları.</p>
        </div>

        <h3>Font düzeni</h3>
        <div className={styles.optionGrid}>
          {FONT_PRESETS.map((value) => (
            <OptionCard
              defaultChecked={initialTheme.fontPreset === value}
              description={
                value === "brand"
                  ? "Montserrat başlık + Inter gövde."
                  : value === "clean"
                    ? "Başlık ve gövdede sade Inter."
                    : "Georgia gövde + Montserrat başlık."
              }
              key={value}
              label={THEME_OPTION_LABELS.fontPreset[value]}
              name="fontPreset"
              value={value}
            />
          ))}
        </div>

        <div className={styles.split}>
          <div>
            <h3>Başlık boyutu</h3>
            <div className={styles.stackOptions}>
              {HEADING_SCALES.map((value) => (
                <OptionCard
                  defaultChecked={initialTheme.headingScale === value}
                  description={
                    value === "compact"
                      ? "Daha sakin ve kısa başlıklar."
                      : value === "balanced"
                        ? "Mevcut tasarımın güvenli ölçüleri."
                        : "Daha yüksek marka vurgusu."
                  }
                  key={value}
                  label={THEME_OPTION_LABELS.headingScale[value]}
                  name="headingScale"
                  value={value}
                />
              ))}
            </div>
          </div>
          <div>
            <h3>Gövde yazısı</h3>
            <div className={styles.stackOptions}>
              {BODY_SCALES.map((value) => (
                <OptionCard
                  defaultChecked={initialTheme.bodyScale === value}
                  description={
                    value === "compact"
                      ? "Yoğun bilgi alanları için."
                      : value === "balanced"
                        ? "Varsayılan okunabilirlik."
                        : "Bir kademe daha büyük metin."
                  }
                  key={value}
                  label={THEME_OPTION_LABELS.bodyScale[value]}
                  name="bodyScale"
                  value={value}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>03</span>
            <h2>Kart yoğunluğu</h2>
          </div>
          <p>Bölüm boşluklarını ve kart aralıklarını güvenli sınırlar içinde değiştirir.</p>
        </div>
        <div className={styles.optionGrid}>
          {CARD_DENSITIES.map((value) => (
            <OptionCard
              defaultChecked={initialTheme.cardDensity === value}
              description={
                value === "compact"
                  ? "Daha kısa sayfa ve sıkı aralıklar."
                  : value === "balanced"
                    ? "Mevcut tasarım ritmi."
                    : "Daha geniş nefes alanları."
              }
              key={value}
              label={THEME_OPTION_LABELS.cardDensity[value]}
              name="cardDensity"
              value={value}
            />
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>04</span>
            <h2>Bölüm görünürlüğü</h2>
          </div>
          <p>İçeriği silmeden ziyaretçi sitesinde göster veya gizle.</p>
        </div>
        <div className={styles.visibilityGrid}>
          {visibilityOptions.map((option) => (
            <label className={styles.toggleCard} key={option.key}>
              <input
                defaultChecked={initialVisibility[option.key]}
                name={`visibility.${option.key}`}
                type="checkbox"
              />
              <span className={styles.toggle} aria-hidden="true" />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>05</span>
            <h2>Ana sayfa sıralaması</h2>
          </div>
          <p>Hero üstte sabit kalır; diğer ana bölümler aşağıdaki sırayla gösterilir.</p>
        </div>
        <ol className={styles.orderList}>
          {order.map((section, index) => (
            <li key={section}>
              <input name="homeSectionOrder" type="hidden" value={section} />
              <span className={styles.orderIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{THEME_OPTION_LABELS.homeSectionOrder[section]}</strong>
              <div>
                <button
                  aria-label={`${THEME_OPTION_LABELS.homeSectionOrder[section]} bölümünü yukarı taşı`}
                  disabled={index === 0}
                  onClick={() => setOrder((items) => moveItem(items, index, -1))}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label={`${THEME_OPTION_LABELS.homeSectionOrder[section]} bölümünü aşağı taşı`}
                  disabled={index === order.length - 1}
                  onClick={() => setOrder((items) => moveItem(items, index, 1))}
                  type="button"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <aside className={previewClasses}>
        <span>Güvenli tema yönetimi</span>
        <h2>Mevcut tasarım sistemi korunur.</h2>
        <p>
          Bu panel serbest CSS kabul etmez. Yalnız önceden tanımlanmış font, renk,
          ölçü, yoğunluk, görünürlük ve sıra seçenekleri kaydedilebilir.
        </p>
      </aside>

      <div className={styles.actions}>
        <button className={styles.primary} type="submit">
          Tasarım ayarlarını kaydet
        </button>
        <button className={styles.secondary} name="_intent" type="submit" value="reset">
          Güvenli varsayılanlara dön
        </button>
      </div>
    </form>
  );
}
