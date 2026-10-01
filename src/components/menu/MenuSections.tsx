import type { Ref, ReactNode } from "react";
import {
  categoryNeedsManagedPresentation,
  defaultMenuGroup,
} from "@/lib/menu/presentation";
import managedStyles from "./ManagedMenu.module.css";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import MenuMerchShowcase from "@/components/merch/MenuMerchShowcase";
import { GenericMenuCategoryList } from "./GenericMenuPanel";
import { MenuQuickViewButton } from "./MenuProductQuickView";
import SauceExplorer from "./SauceExplorer";
import type { MenuPublicData } from "@/lib/public-data/types";
import type {
  MerchBundle,
  MerchDoodle,
  MerchProductContent,
} from "@/types/content";
import type { CoffeeMenuGroup } from "@/types/menu";
import { sortAlsancakDraftBeers } from "@/lib/menu/alsancak-draft-beer-order";
import {
  AtakentFoodItem,
  BranchFoodItem,
  CompactList,
  EditorialItems,
  EditorialTitle,
  MenuItemImages,
  PriceTable,
  SheetTitle,
} from "./MenuPrimitives";

type PanelProps = {
  hidden: boolean;
  data: MenuPublicData;
  panelRef?: Ref<HTMLElement>;
  merchProducts?: MerchProductContent[];
  merchBundles?: MerchBundle[];
  merchDoodles?: MerchDoodle[];
};

const ALSANCAK_RICH_CATEGORY_SLUGS = new Set([
  "fici-biralar",
  "sise-biralar",
  "deli-salata",
  "saraplar",
  "fritoz",
  "firin",
  "soslar",
  "kahve",
  "spesiyaller",
  "kahve-disi",
  "kahve-ekstralari",
]);

const ATAKENT_RICH_CATEGORY_SLUGS = new Set([
  "fici-biralar",
  "bubble-kokteyller",
  "house-kokteyller",
  "sise-biralar",
  "saraplar",
  "sicaklar",
  "izgara-sisleri",
  "tatli",
]);

function extraBranchCategories(
  data: MenuPublicData,
  branchSlug: string,
  handled: Set<string>,
) {
  return (
    data.branches
      .find((branch) => branch.slug === branchSlug)
      ?.categories.filter((category) => !handled.has(category.slug)) ?? []
  );
}

function BranchIntro({
  kicker,
  titleLines,
  description,
  light = false,
}: {
  kicker: string;
  titleLines: readonly string[];
  description: string;
  light?: boolean;
}) {
  return (
    <header
      className={`branch-menu-intro reveal${light ? " branch-menu-intro-light" : ""}`}
    >
      <p className="menu-kicker">{kicker}</p>
      <h2>
        {titleLines.map((line, index) => (
          <span
            key={line}
            className={index === 0 && light ? "title-nowrap" : undefined}
          >
            {line}
            {index < titleLines.length - 1 ? <br /> : null}
          </span>
        ))}
        <span>.</span>
      </h2>
      <p>{description}</p>
    </header>
  );
}

function CheeseFeature({ data }: { data: MenuPublicData["cheesePortions"] }) {
  if (!data.feature.name && !data.options.length) return null;
  return (
    <article className="branch-food-item deli-feature-item">
      {data.feature.name ? (
        <div>
          <h4>
            {data.feature.name}
            <MenuQuickViewButton
              name={data.feature.name}
              description={data.feature.description}
              price={data.feature.price}
              category="Deli + Salata"
              subcategory="Peynir"
            />
          </h4>
          <p>{data.feature.description}</p>
        </div>
      ) : null}
      {data.feature.name ? <strong>{data.feature.price}</strong> : null}
      <div
        aria-label="Küp peynir porsiyon seçenekleri"
        className="cheese-portion-panel"
      >
        <div className="cheese-portion-heading">
          <div>
            <span className="cheese-portion-kicker">
              Küp peynir porsiyonları
            </span>
            <p>{data.note}</p>
          </div>
          <div
            aria-label="Porsiyon fiyatları"
            className="cheese-portion-prices"
          >
            {data.prices.map((item) => (
              <span key={item.label}>
                {item.label}
                <strong>{item.price}</strong>
              </span>
            ))}
          </div>
        </div>
        <div className="cheese-portion-options">
          {data.options.map((option) => (
            <div
              key={option.name}
              className={`cheese-option${option.mixed ? " cheese-option-mixed" : ""}`}
            >
              <b>
                {option.name}
                <MenuQuickViewButton
                  name={option.name}
                  detail={option.detail}
                  price={data.prices
                    .map((item) => `${item.label}: ${item.price}`)
                    .join(" · ")}
                  note={option.portion}
                  category="Deli + Salata"
                  subcategory="Peynir"
                />
              </b>
              <small>{option.detail}</small>
              <span>{option.portion}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function BeerSalads({ salads }: { salads: MenuPublicData["beerSalads"] }) {
  if (!salads.length) return null;
  return (
    <>
      <div className="beer-salad-heading">
        <div>
          <p className="menu-kicker">Bira Salataları</p>
          <h4>İki vegan seçenek.</h4>
        </div>
        <span className="vegan-badge">VEGAN</span>
      </div>
      <div className="cute-note salad-note">
        İki salatayı aynı tabakta yarım + yarım olarak seçebilirsin ♡
      </div>
      <div className="beer-salad-grid">
        {salads.map((salad) => (
          <article key={salad.name} className="beer-salad-card">
            <div>
              <h4>
                {salad.name}
                <MenuQuickViewButton
                  name={salad.name}
                  description={salad.description}
                  price={salad.prices
                    .map((item) => `${item.label}: ${item.price}`)
                    .join(" · ")}
                  badge="VEGAN"
                  category="Deli + Salata"
                  subcategory="Salata"
                />
              </h4>
              <p>{salad.description}</p>
            </div>
            <div
              aria-label={`${salad.name} porsiyon fiyatları`}
              className="portion-prices"
            >
              {salad.prices.map((item) => (
                <span key={item.label}>
                  {item.label}
                  <strong>{item.price}</strong>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function CoffeeGroup({ group }: { group: CoffeeMenuGroup }) {
  return (
    <section className="coffee-menu-column">
      <div className="coffee-section-heading">
        <h4>{group.title}</h4>
        {group.subtitle ? <small>{group.subtitle}</small> : null}
      </div>
      <div className="coffee-editorial-list">
        {group.items.map((item) => (
          <div key={item.name}>
            <span>
              {item.name}
              <MenuQuickViewButton
                name={item.name}
                detail={item.detail}
                price={item.price}
                category="İçecek"
                subcategory={group.title}
              />
              {item.detail ? <small>{item.detail}</small> : null}
            </span>
            <strong>{item.price}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function CoffeeBar({ data }: { data: MenuPublicData }) {
  const [coffee, specials, nonCoffee] = data.coffeeGroups;
  if (
    !data.coffeeGroups.some((g) => g.items.length) &&
    !data.coffeeExtras.length
  )
    return null;

  return (
    <section className="coffee-bar-section dotted-paper reveal" id="kahve-bari">
      <AmbientDoodles parallax={false} />
      <div className="coffee-bar-inner">
        <header className="coffee-menu-intro">
          <div className="coffee-intro-copy">
            <p className="menu-kicker">Alsancak Coffee Bar</p>
            <p>
              Klasik kahveler, imza içecekler ve matcha seçenekleri gün boyunca
              hazırlanır.
            </p>
            <div aria-label="Kahve barı bilgileri" className="coffee-menu-note">
              <span>Sıcak / soğuk hazırlanabilir</span>
              <span>Yalnızca Alsancak</span>
            </div>
          </div>
          <h3>
            Kahve +<br />
            diğer içecekler<span>.</span>
          </h3>
        </header>
        <div className="coffee-menu-editorial-grid">
          {coffee?.items.length ? <CoffeeGroup group={coffee} /> : null}
          <div className="coffee-menu-column-stack">
            {specials?.items.length ? <CoffeeGroup group={specials} /> : null}
            {nonCoffee?.items.length ? <CoffeeGroup group={nonCoffee} /> : null}
          </div>
        </div>
        <section
          aria-label="Tatlılar, ekstralar ve alternatif sütler"
          className="coffee-extras-line"
        >
          {data.coffeeExtras.map((extra) => (
            <div key={extra.label}>
              <span>
                <b>
                  {extra.label}
                  <MenuQuickViewButton
                    name={extra.label}
                    description={extra.description}
                    price={extra.price}
                    category="İçecek"
                    subcategory="Ekstra"
                  />
                </b>{" "}
                · {extra.description}
              </span>
              <strong>{extra.price}</strong>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

export function MenuHero({ data }: { data: MenuPublicData["menuHero"] }) {
  return (
    <section className="page-hero page-hero-menu dotted-paper">
      <AmbientDoodles />
      <div className="container page-hero-grid">
        <div className="reveal">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1>
            {data.title}
            <span>.</span>
          </h1>
          <p>{data.description}</p>
        </div>
        <div
          aria-hidden="true"
          className="page-hero-mark reveal reveal-delay-1"
        >
          <span>{data.mark}</span>
          <svg viewBox="0 0 320 270">
            <path d="M65 198c36-45 70-68 102-68 34 0 62 24 88 70" />
            <path d="M84 72h74l-14 126H98L84 72ZM173 88h79l-18 110h-45L173 88Z" />
            <path d="M95 122c18 9 35 9 52 0M184 137c20 8 39 8 59 0" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function requiresManagedLayout(data: MenuPublicData, slug: string) {
  return (
    data.branches
      .find((b) => b.slug === slug)
      ?.categories.some(categoryNeedsManagedPresentation) ?? false
  );
}

function richCategorySortOrder(
  data: MenuPublicData,
  branchSlug: string,
  categorySlug: string,
) {
  return (
    data.branches
      .find((branch) => branch.slug === branchSlug)
      ?.categories.find((category) => category.slug === categorySlug)
      ?.sortOrder ?? Number.MAX_SAFE_INTEGER
  );
}
function ManagedBranchMenu({
  slug,
  hidden,
  panelRef,
  data,
  merchProducts,
  merchBundles,
  merchDoodles,
}: PanelProps & { slug: string }) {
  const categories =
    data.branches.find((b) => b.slug === slug)?.categories ?? [];
  const groups = [
    ...new Map(
      categories.map((c) => {
        const group = c.group ?? defaultMenuGroup(c.slug);
        return [group.key, group];
      }),
    ).values(),
  ].sort(
    (a, b) =>
      (a.key === "main" ? 0 : a.key === "coffee" ? 1 : 2) -
      (b.key === "main" ? 0 : b.key === "coffee" ? 1 : 2),
  );
  function richContent(category: (typeof categories)[number]): ReactNode {
    if (category.presentationOverride)
      return <GenericMenuCategoryList categories={[category]} />;
    const key = category.slug;
    if (slug === "alsancak") {
      if (key === "fici-biralar")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            <PriceTable
              headers={["Ürün", "20 cl", "50 cl", "66 cl"]}
              rows={data.alsancakDraftBeers}
              headClassName="dark-head"
              rowClassName="four-cols"
              category="Bira"
              subcategory="Fıçı"
            />
          </>
        );
      if (key === "sise-biralar")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            <CompactList
              items={data.alsancakBottleBeers}
              className="bottle-grid-als"
              category="Bira"
              subcategory="Şişe"
            />
          </>
        );
      if (key === "deli-salata")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            <CheeseFeature data={data.cheesePortions} />
            {data.alsancakDeliItems.map((item) => (
              <BranchFoodItem
                key={item.name}
                item={item}
                category="Deli + Salata"
                subcategory="Deli"
              />
            ))}
            <BeerSalads salads={data.beerSalads} />
          </>
        );
      if (key === "saraplar")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            <article className="editorial-item editorial-dark">
              <div>
                <h4>
                  {data.alsancakWine.name}
                  <MenuQuickViewButton
                    name={data.alsancakWine.name}
                    description={data.alsancakWine.description}
                    price={data.alsancakWine.price}
                    note={data.alsancakWine.priceDetail}
                    category="Şarap"
                    subcategory="Kadeh / Şişe"
                  />
                </h4>
                <p>{data.alsancakWine.description}</p>
              </div>
              <strong>
                {data.alsancakWine.price}
                <br />
                <small>{data.alsancakWine.priceDetail}</small>
              </strong>
            </article>
          </>
        );
      if (key === "fritoz" || key === "firin")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            {(key === "fritoz"
              ? data.alsancakFryerItems
              : data.alsancakOvenItems
            ).map((item) => (
              <BranchFoodItem
                key={item.name}
                item={item}
                category="Yemek"
                subcategory={key === "fritoz" ? "Fritöz" : "Fırın"}
              />
            ))}
          </>
        );
      if (key === "soslar")
        return (
          <aside className="sauce-bar">
            <div>
              <p className="menu-kicker">{data.sauceBar.kicker}</p>
              <h3>{category.name}</h3>
            </div>
            <p>{data.sauceBar.items.join(" · ")}</p>
            <SauceExplorer
              items={data.sauceBar.items}
              kicker={data.sauceBar.kicker}
            />
          </aside>
        );
    }
    if (slug === "atakent") {
      if (key === "fici-biralar" || key === "saraplar")
        return (
          <>
            <EditorialTitle>{category.name}</EditorialTitle>
            <PriceTable
              headers={
                key === "saraplar"
                  ? ["Şarap", "Kadeh", "Şişe"]
                  : ["Ürün", "25 cl", "50 cl"]
              }
              rows={
                key === "saraplar" ? data.atakentWines : data.atakentDraftBeers
              }
              category={key === "saraplar" ? "Şarap" : "Bira"}
              subcategory={key === "saraplar" ? "Kadeh / Şişe" : "Fıçı"}
            />
          </>
        );
      if (key === "sise-biralar")
        return (
          <>
            <EditorialTitle>{category.name}</EditorialTitle>
            <CompactList
              items={data.atakentBottleBeers}
              category="Bira"
              subcategory="Şişe"
            />
          </>
        );
      if (key === "bubble-kokteyller" || key === "house-kokteyller")
        return (
          <>
            <EditorialTitle>{category.name}</EditorialTitle>
            <EditorialItems
              items={
                key === "bubble-kokteyller"
                  ? data.atakentBubbleCocktails
                  : data.atakentHouseCocktails
              }
              category="Kokteyl"
              subcategory={
                key === "bubble-kokteyller" ? "Bubble" : "House"
              }
            />
          </>
        );
      if (key === "sicaklar" || key === "izgara-sisleri")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            {(key === "sicaklar"
              ? data.atakentHotItems
              : data.atakentGrillItems
            ).map((item) => (
              <AtakentFoodItem
                key={item.name}
                item={item}
                category="Yemek"
                subcategory={key === "sicaklar" ? "Sıcaklar" : "Izgara Şişleri"}
              />
            ))}
          </>
        );
      if (key === "tatli")
        return (
          <>
            <SheetTitle>{category.name}</SheetTitle>
            <BranchFoodItem
              item={data.atakentDessert}
              category="Yemek"
              subcategory="Tatlı"
            />
          </>
        );
    }
    return <GenericMenuCategoryList categories={[category]} />;
  }
  return (
    <section
      ref={panelRef}
      aria-labelledby={`tab-${slug}`}
      className={`branch-menu-panel dotted-paper ${managedStyles.panel}`}
      id={`panel-${slug}`}
      role="tabpanel"
      hidden={hidden}
    >
      <div className="container">
        <BranchIntro
          {...(slug === "alsancak" ? data.alsancakIntro : data.atakentIntro)}
        />
        {groups.map((group) => (
          <section
            className={managedStyles.group}
            key={group.key}
            id={`menu-${group.key.replace(":", "-")}`}
          >
            <h2>{group.label}</h2>
            <div
              className={
                group.key === "coffee"
                  ? "coffee-menu-editorial-grid"
                  : managedStyles.grid
              }
            >
              {categories
                .filter(
                  (c) =>
                    (c.group ?? defaultMenuGroup(c.slug)).key === group.key,
                )
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <div
                    className={managedStyles.category}
                    data-dark={
                      slug === "atakent" &&
                      [
                        "fici-biralar",
                        "sise-biralar",
                        "saraplar",
                        "bubble-kokteyller",
                        "house-kokteyller",
                      ].includes(category.slug)
                    }
                    key={category.id}
                    id={`kategori-${category.slug}`}
                  >
                    {richContent(category)}
                  </div>
                ))}
            </div>
          </section>
        ))}
        {slug === "alsancak" ? (
          <MenuMerchShowcase
            products={merchProducts}
            bundles={merchBundles}
            doodles={merchDoodles}
          />
        ) : null}
      </div>
    </section>
  );
}

export function AlsancakMenuPanel({
  hidden,
  panelRef,
  data,
  merchProducts,
  merchBundles,
  merchDoodles,
}: PanelProps) {
  if (requiresManagedLayout(data, "alsancak"))
    return (
      <ManagedBranchMenu
        slug="alsancak"
        {...{
          hidden,
          panelRef,
          data,
          merchProducts,
          merchBundles,
          merchDoodles,
        }}
      />
    );
  return (
    <section
      ref={panelRef}
      aria-labelledby="tab-alsancak"
      className="branch-menu-panel alsancak-menu-panel"
      id="panel-alsancak"
      role="tabpanel"
      hidden={hidden}
    >
      <div className="container">
        <BranchIntro {...data.alsancakIntro} />
        <MenuItemImages
          items={data.itemImages.filter((item) => item.branch === "alsancak")}
        />
        <div className="alsancak-menu-grid">
          {data.alsancakDraftBeers.length ? (
            <section className="menu-sheet-block reveal">
              <SheetTitle>Fıçı Biralar</SheetTitle>
              <p className="draft-beer-note">
                Tüm fıçı biralar Mexican hazırlanabilir.
              </p>
              <PriceTable
                headers={["Ürün", "20 cl", "50 cl", "66 cl"]}
                rows={sortAlsancakDraftBeers(data.alsancakDraftBeers)}
                headClassName="dark-head"
                rowClassName="four-cols"
                category="Bira"
                subcategory="Fıçı"
              />
            </section>
          ) : null}
          {data.alsancakBottleBeers.length ? (
            <section className="menu-sheet-block reveal reveal-delay-1">
              <SheetTitle>Şişe Biralar</SheetTitle>
              <CompactList
                items={data.alsancakBottleBeers}
                className="bottle-grid-als"
                category="Bira"
                subcategory="Şişe"
              />
            </section>
          ) : null}
          <div className="menu-sheet-column menu-sheet-column-right">
            {["saraplar", "fritoz", "firin"]
              .sort(
                (first, second) =>
                  richCategorySortOrder(data, "alsancak", first) -
                  richCategorySortOrder(data, "alsancak", second),
              )
              .map((categorySlug) => {
                if (categorySlug === "saraplar" && data.alsancakWine.name) {
                  return (
                    <section
                      className="menu-sheet-block reveal"
                      key={categorySlug}
                    >
                      <SheetTitle>Şaraplar</SheetTitle>
                      <article className="editorial-item editorial-dark">
                        <div>
                          <h4>
                  {data.alsancakWine.name}
                  <MenuQuickViewButton
                    name={data.alsancakWine.name}
                    description={data.alsancakWine.description}
                    price={data.alsancakWine.price}
                    note={data.alsancakWine.priceDetail}
                    category="Şarap"
                    subcategory="Kadeh / Şişe"
                  />
                </h4>
                          <p>{data.alsancakWine.description}</p>
                        </div>
                        <strong>
                          {data.alsancakWine.price}
                          <br />
                          <small>{data.alsancakWine.priceDetail}</small>
                        </strong>
                      </article>
                    </section>
                  );
                }

                if (
                  categorySlug === "fritoz" &&
                  data.alsancakFryerItems.length
                ) {
                  return (
                    <section
                      className="menu-sheet-block reveal reveal-delay-1"
                      key={categorySlug}
                    >
                      <SheetTitle>Fritöz</SheetTitle>
                      {data.alsancakFryerItems.map((item) => (
                        <BranchFoodItem
                          key={item.name}
                          item={item}
                          category="Yemek"
                          subcategory="Fritöz"
                        />
                      ))}
                    </section>
                  );
                }

                if (
                  categorySlug === "firin" &&
                  data.alsancakOvenItems.length
                ) {
                  return (
                    <section
                      className="menu-sheet-block reveal"
                      key={categorySlug}
                    >
                      <SheetTitle>Fırın</SheetTitle>
                      <div className="cute-note">
                        Paylaşmaya hazır: bütün sandviçler ikiye bölünerek servis
                        edilir ♡
                      </div>
                      {data.alsancakOvenItems.map((item) => (
                        <BranchFoodItem
                          key={item.name}
                          item={item}
                          category="Yemek"
                          subcategory="Fırın"
                        />
                      ))}
                    </section>
                  );
                }

                return null;
              })}
          </div>
          <div className="menu-sheet-column menu-sheet-column-left">
            {data.alsancakDeliItems.length ||
            data.cheesePortions.feature.name ||
            data.cheesePortions.options.length ||
            data.beerSalads.length ? (
              <section className="menu-sheet-block reveal reveal-delay-1">
                <SheetTitle>Deli + Salata</SheetTitle>
                <CheeseFeature data={data.cheesePortions} />
                {data.alsancakDeliItems.map((item) => (
                  <BranchFoodItem
                    key={item.name}
                    item={item}
                    category="Deli + Salata"
                    subcategory="Deli"
                  />
                ))}
                <BeerSalads salads={data.beerSalads} />
              </section>
            ) : null}
          </div>
        </div>
        {data.sauceBar.items.length ? (
          <aside className="sauce-bar reveal">
            <div>
              <p className="menu-kicker">{data.sauceBar.kicker}</p>
              <h3>{data.sauceBar.title}</h3>
            </div>
            <p>{data.sauceBar.items.join(" · ")}</p>
            <SauceExplorer
              items={data.sauceBar.items}
              kicker={data.sauceBar.kicker}
            />
          </aside>
        ) : null}
        <GenericMenuCategoryList
          categories={extraBranchCategories(
            data,
            "alsancak",
            ALSANCAK_RICH_CATEGORY_SLUGS,
          )}
        />
        <CoffeeBar data={data} />
        <MenuMerchShowcase
          products={merchProducts}
          bundles={merchBundles}
          doodles={merchDoodles}
        />
      </div>
    </section>
  );
}

export function AtakentMenuPanel({ hidden, panelRef, data }: PanelProps) {
  if (requiresManagedLayout(data, "atakent"))
    return <ManagedBranchMenu slug="atakent" {...{ hidden, panelRef, data }} />;
  return (
    <section
      ref={panelRef}
      aria-labelledby="tab-atakent"
      className="branch-menu-panel atakent-menu-panel"
      id="panel-atakent"
      role="tabpanel"
      hidden={hidden}
    >
      <div className="atakent-drinks">
        <div className="container">
          <BranchIntro {...data.atakentIntro} light />
          <MenuItemImages
            items={data.itemImages.filter((item) => item.branch === "atakent")}
          />
          <div className="menu-editorial-grid">
            {data.atakentDraftBeers.length ? (
              <section className="menu-editorial-block reveal">
                <EditorialTitle>Fıçıdan</EditorialTitle>
                <p className="draft-beer-note draft-beer-note-light">
                  Tüm fıçı biralar Mexican hazırlanabilir.
                </p>
                <PriceTable
                  headers={["Ürün", "25 cl", "50 cl"]}
                  rows={data.atakentDraftBeers}
                  category="Bira"
                  subcategory="Fıçı"
                />
              </section>
            ) : null}
            {data.atakentBubbleCocktails.length ? (
              <section className="menu-editorial-block reveal reveal-delay-1">
                <EditorialTitle>Bubble Kokteyller</EditorialTitle>
                <EditorialItems
                  items={data.atakentBubbleCocktails}
                  category="Kokteyl"
                  subcategory="Bubble"
                />
              </section>
            ) : null}
            {data.atakentHouseCocktails.length ? (
              <section className="menu-editorial-block menu-editorial-wide reveal">
                <EditorialTitle>House Kokteyller</EditorialTitle>
                <EditorialItems
                  items={data.atakentHouseCocktails}
                  className="cocktail-grid"
                  category="Kokteyl"
                  subcategory="House"
                />
              </section>
            ) : null}
            {data.atakentBottleBeers.length ? (
              <section className="menu-editorial-block reveal">
                <EditorialTitle>Şişe Biralar</EditorialTitle>
                <CompactList
                  items={data.atakentBottleBeers}
                  category="Bira"
                  subcategory="Şişe"
                />
              </section>
            ) : null}
            {data.atakentWines.length ? (
              <section className="menu-editorial-block reveal reveal-delay-1">
                <EditorialTitle>Şaraplar</EditorialTitle>
                <PriceTable
                  headers={["Şarap", "Kadeh", "Şişe"]}
                  rows={data.atakentWines}
                  headClassName="wine-head"
                  category="Şarap"
                  subcategory="Kadeh / Şişe"
                />
              </section>
            ) : null}
          </div>
        </div>
      </div>
      <div className="atakent-food dotted-paper">
        <AmbientDoodles parallax={false} />
        <div className="container">
          {data.atakentHotItems.length || data.atakentGrillItems.length ? (
            <BranchIntro
              kicker="Atakent Aperitifs + Grill"
              titleLines={["Ortaya söyle"]}
              description="Izgara şişleri 17:00’dan itibaren servis edilir."
            />
          ) : null}
          <div className="food-menu-layout">
            {data.atakentHotItems.length ? (
              <section className="food-column reveal">
                <div className="food-section-heading">
                  <h3>Sıcaklar</h3>
                </div>
                {data.atakentHotItems.map((item) => (
                  <AtakentFoodItem
                    key={item.name}
                    item={item}
                    category="Yemek"
                    subcategory="Sıcaklar"
                  />
                ))}
              </section>
            ) : null}
            {data.atakentGrillItems.length ? (
              <section className="food-column reveal reveal-delay-1">
                <div className="food-section-heading">
                  <h3>Izgara Şişleri</h3>
                  <small>17:00’dan itibaren</small>
                </div>
                {data.atakentGrillItems.map((item) => (
                  <AtakentFoodItem
                    key={item.name}
                    item={item}
                    category="Yemek"
                    subcategory="Izgara Şişleri"
                  />
                ))}
              </section>
            ) : null}
          </div>
          {data.atakentDessert.name ? (
            <section className="dessert-line reveal">
              <div>
                <p className="menu-kicker">{data.atakentDessert.kicker}</p>
                <h3>
                  {data.atakentDessert.name}
                  <MenuQuickViewButton
                    name={data.atakentDessert.name}
                    description={data.atakentDessert.description}
                    price={data.atakentDessert.price}
                    allergens={data.atakentDessert.allergens}
                    category="Yemek"
                    subcategory="Tatlı"
                  />
                </h3>
                <p>{data.atakentDessert.description}</p>
                <small>{data.atakentDessert.allergens}</small>
              </div>
              <strong>{data.atakentDessert.price}</strong>
            </section>
          ) : null}
          <GenericMenuCategoryList
            categories={extraBranchCategories(
              data,
              "atakent",
              ATAKENT_RICH_CATEGORY_SLUGS,
            )}
          />
        </div>
      </div>
    </section>
  );
}

export function MenuTruthNote() {
  return (
    <section className="menu-truth-note dotted-paper">
      <div className="container reveal">
        <p>Menüde bir ürün görünüyorsa yalnızca seçili şube için geçerlidir.</p>
      </div>
    </section>
  );
}
