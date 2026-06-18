import type { RefObject } from "react";
import AmbientDoodles from "@/components/effects/AmbientDoodles";
import MenuMerchShowcase from "@/components/merch/MenuMerchShowcase";
import {
  alsancakBottleBeers,
  alsancakDeliItems,
  alsancakDraftBeers,
  alsancakFryerItems,
  alsancakIntro,
  alsancakOvenItems,
  alsancakWine,
  atakentBottleBeers,
  atakentBubbleCocktails,
  atakentDessert,
  atakentDraftBeers,
  atakentGrillItems,
  atakentHotItems,
  atakentHouseCocktails,
  atakentIntro,
  atakentWines,
  beerSalads,
  cheesePortions,
  coffeeExtras,
  coffeeGroups,
  menuHero,
  sauceBar,
} from "@/data/menu";
import {
  AtakentFoodItem,
  BranchFoodItem,
  CompactList,
  EditorialItems,
  EditorialTitle,
  PriceTable,
  SheetTitle,
} from "./MenuPrimitives";

type PanelProps = {
  hidden: boolean;
  panelRef?: RefObject<HTMLElement | null>;
};

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
    <header className={`branch-menu-intro reveal${light ? " branch-menu-intro-light" : ""}`}>
      <p className="menu-kicker">{kicker}</p>
      <h2>
        {titleLines.map((line, index) => (
          <span key={line} className={index === 0 && light ? "title-nowrap" : undefined}>
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

function CheeseFeature() {
  return (
    <article className="branch-food-item deli-feature-item">
      <div>
        <h4>{cheesePortions.feature.name}</h4>
        <p>{cheesePortions.feature.description}</p>
      </div>
      <strong>{cheesePortions.feature.price}</strong>
      <div aria-label="Küp peynir porsiyon seçenekleri" className="cheese-portion-panel">
        <div className="cheese-portion-heading">
          <div>
            <span className="cheese-portion-kicker">Küp peynir porsiyonları</span>
            <p>{cheesePortions.note}</p>
          </div>
          <div aria-label="Porsiyon fiyatları" className="cheese-portion-prices">
            {cheesePortions.prices.map((item) => (
              <span key={item.label}>{item.label}<strong>{item.price}</strong></span>
            ))}
          </div>
        </div>
        <div className="cheese-portion-options">
          {cheesePortions.options.map((option) => (
            <div key={option.name} className={`cheese-option${"mixed" in option ? " cheese-option-mixed" : ""}`}>
              <b>{option.name}</b>
              <small>{option.detail}</small>
              <span>{option.portion}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function BeerSalads() {
  return (
    <>
      <div className="beer-salad-heading">
        <div><p className="menu-kicker">Bira Salataları</p><h4>İki vegan seçenek.</h4></div>
        <span className="vegan-badge">VEGAN</span>
      </div>
      <div className="cute-note salad-note">İki salatayı aynı tabakta yarım + yarım olarak seçebilirsin ♡</div>
      <div className="beer-salad-grid">
        {beerSalads.map((salad) => (
          <article key={salad.name} className="beer-salad-card">
            <div><h4>{salad.name}</h4><p>{salad.description}</p></div>
            <div aria-label={`${salad.name} porsiyon fiyatları`} className="portion-prices">
              {salad.prices.map((item) => <span key={item.label}>{item.label}<strong>{item.price}</strong></span>)}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function CoffeeGroup({ group }: { group: (typeof coffeeGroups)[number] }) {
  return (
    <section className="coffee-menu-column">
      <div className="coffee-section-heading"><h4>{group.title}</h4>{group.subtitle ? <small>{group.subtitle}</small> : null}</div>
      <div className="coffee-editorial-list">
        {group.items.map((item) => (
          <div key={item.name}><span>{item.name}{item.detail ? <small>{item.detail}</small> : null}</span><strong>{item.price}</strong></div>
        ))}
      </div>
    </section>
  );
}

function CoffeeBar() {
  const [coffee, specials, nonCoffee] = coffeeGroups;

  return (
    <section className="coffee-bar-section dotted-paper reveal" id="kahve-bari">
      <AmbientDoodles />
      <div className="coffee-bar-inner">
        <header className="coffee-menu-intro">
          <div className="coffee-intro-copy">
            <p className="menu-kicker">Alsancak Coffee Bar</p>
            <p>Klasik kahveler, imza içecekler ve matcha seçenekleri gün boyunca hazırlanır.</p>
            <div aria-label="Kahve barı bilgileri" className="coffee-menu-note"><span>Sıcak / soğuk hazırlanabilir</span><span>Yalnızca Alsancak</span></div>
          </div>
          <h3>Kahve +<br />diğer içecekler<span>.</span></h3>
        </header>
        <div className="coffee-menu-editorial-grid">
          <CoffeeGroup group={coffee} />
          <div className="coffee-menu-column-stack"><CoffeeGroup group={specials} /><CoffeeGroup group={nonCoffee} /></div>
        </div>
        <section aria-label="Tatlılar, ekstralar ve alternatif sütler" className="coffee-extras-line">
          {coffeeExtras.map((extra) => <div key={extra.label}><span><b>{extra.label}</b> · {extra.description}</span><strong>{extra.price}</strong></div>)}
        </section>
      </div>
    </section>
  );
}

export function MenuHero() {
  return (
    <section className="page-hero page-hero-menu dotted-paper">
      <AmbientDoodles />
      <div className="container page-hero-grid">
        <div className="reveal"><p className="eyebrow">{menuHero.eyebrow}</p><h1>{menuHero.title}<span>.</span></h1><p>{menuHero.description}</p></div>
        <div aria-hidden="true" className="page-hero-mark reveal reveal-delay-1">
          <span>{menuHero.mark}</span>
          <svg viewBox="0 0 320 270"><path d="M65 198c36-45 70-68 102-68 34 0 62 24 88 70" /><path d="M84 72h74l-14 126H98L84 72ZM173 88h79l-18 110h-45L173 88Z" /><path d="M95 122c18 9 35 9 52 0M184 137c20 8 39 8 59 0" /></svg>
        </div>
      </div>
    </section>
  );
}

export function AlsancakMenuPanel({ hidden, panelRef }: PanelProps) {
  return (
    <section ref={panelRef} aria-labelledby="tab-alsancak" className="branch-menu-panel alsancak-menu-panel" id="panel-alsancak" role="tabpanel" hidden={hidden}>
      <div className="container">
        <BranchIntro {...alsancakIntro} />
        <div className="alsancak-menu-grid">
          <section className="menu-sheet-block reveal"><SheetTitle>Fıçı Biralar</SheetTitle><p className="draft-beer-note">Tüm fıçı biralar Mexican hazırlanabilir.</p><PriceTable headers={["Ürün", "20 cl", "50 cl", "66 cl"]} rows={alsancakDraftBeers} headClassName="dark-head" rowClassName="four-cols" /></section>
          <section className="menu-sheet-block reveal reveal-delay-1"><SheetTitle>Şişe Biralar</SheetTitle><CompactList items={alsancakBottleBeers} className="bottle-grid-als" /></section>
          <div className="menu-sheet-column menu-sheet-column-right">
            <section className="menu-sheet-block reveal"><SheetTitle>Şaraplar</SheetTitle><article className="editorial-item editorial-dark"><div><h4>{alsancakWine.name}</h4><p>{alsancakWine.description}</p></div><strong>{alsancakWine.price}<br /><small>{alsancakWine.priceDetail}</small></strong></article></section>
            <section className="menu-sheet-block reveal reveal-delay-1"><SheetTitle>Fritöz</SheetTitle>{alsancakFryerItems.map((item) => <BranchFoodItem key={item.name} item={item} />)}</section>
            <section className="menu-sheet-block reveal"><SheetTitle>Fırın</SheetTitle><div className="cute-note">Paylaşmaya hazır: bütün sandviçler ikiye bölünerek servis edilir ♡</div>{alsancakOvenItems.map((item) => <BranchFoodItem key={item.name} item={item} />)}</section>
          </div>
          <div className="menu-sheet-column menu-sheet-column-left">
            <section className="menu-sheet-block reveal reveal-delay-1"><SheetTitle>Deli + Salata</SheetTitle><CheeseFeature />{alsancakDeliItems.map((item) => <BranchFoodItem key={item.name} item={item} />)}<BeerSalads /></section>
          </div>
        </div>
        <aside className="sauce-bar reveal"><div><p className="menu-kicker">{sauceBar.kicker}</p><h3>{sauceBar.title}</h3></div><p>{sauceBar.items.join(" · ")}</p></aside>
        <CoffeeBar />
        <MenuMerchShowcase />
      </div>
    </section>
  );
}

export function AtakentMenuPanel({ hidden, panelRef }: PanelProps) {
  return (
    <section ref={panelRef} aria-labelledby="tab-atakent" className="branch-menu-panel atakent-menu-panel" id="panel-atakent" role="tabpanel" hidden={hidden}>
      <div className="atakent-drinks">
        <div className="container">
          <BranchIntro {...atakentIntro} light />
          <div className="menu-editorial-grid">
            <section className="menu-editorial-block reveal"><EditorialTitle>Fıçıdan</EditorialTitle><p className="draft-beer-note draft-beer-note-light">Tüm fıçı biralar Mexican hazırlanabilir.</p><PriceTable headers={["Ürün", "33 cl", "50 cl"]} rows={atakentDraftBeers} /></section>
            <section className="menu-editorial-block reveal reveal-delay-1"><EditorialTitle>Bubble Kokteyller</EditorialTitle><EditorialItems items={atakentBubbleCocktails} /></section>
            <section className="menu-editorial-block menu-editorial-wide reveal"><EditorialTitle>House Kokteyller</EditorialTitle><EditorialItems items={atakentHouseCocktails} className="cocktail-grid" /></section>
            <section className="menu-editorial-block reveal"><EditorialTitle>Şişe Biralar</EditorialTitle><CompactList items={atakentBottleBeers} /></section>
            <section className="menu-editorial-block reveal reveal-delay-1"><EditorialTitle>Şaraplar</EditorialTitle><PriceTable headers={["Şarap", "Kadeh", "Şişe"]} rows={atakentWines} headClassName="wine-head" /></section>
          </div>
        </div>
      </div>
      <div className="atakent-food dotted-paper">
        <AmbientDoodles />
        <div className="container">
          <BranchIntro kicker="Atakent Aperitifs + Grill" titleLines={["Ortaya söyle"]} description="Izgara şişleri 17:00’dan itibaren servis edilir." />
          <div className="food-menu-layout">
            <section className="food-column reveal"><div className="food-section-heading"><h3>Sıcaklar</h3></div>{atakentHotItems.map((item) => <AtakentFoodItem key={item.name} item={item} />)}</section>
            <section className="food-column reveal reveal-delay-1"><div className="food-section-heading"><h3>Izgara Şişleri</h3><small>17:00’dan itibaren</small></div>{atakentGrillItems.map((item) => <AtakentFoodItem key={item.name} item={item} />)}</section>
          </div>
          <section className="dessert-line reveal"><div><p className="menu-kicker">{atakentDessert.kicker}</p><h3>{atakentDessert.name}</h3><p>{atakentDessert.description}</p><small>{atakentDessert.allergens}</small></div><strong>{atakentDessert.price}</strong></section>
        </div>
      </div>
    </section>
  );
}

export function MenuTruthNote() {
  return <section className="menu-truth-note dotted-paper"><div className="container reveal"><p>Menüde bir ürün görünüyorsa yalnızca seçili şube için geçerlidir.</p></div></section>;
}
