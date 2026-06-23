import type { Ref } from "react";
import type {
  GenericMenuBranchData,
  GenericMenuCategoryData,
  GenericMenuItemData,
} from "@/lib/public-data/types";
import styles from "./GenericMenuPanel.module.css";

function ItemPrice({ item }: { item: GenericMenuItemData }) {
  if (item.variants.length) {
    return (
      <div className={styles.variants}>
        {item.variants.map((variant) => (
          <span key={variant.id}>
            <small>{variant.label}</small>
            <strong>{variant.price}</strong>
            {variant.detail ? <em>{variant.detail}</em> : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.singlePrice}>
      {item.priceLabel ? <small>{item.priceLabel}</small> : null}
      <strong>{item.price}</strong>
    </div>
  );
}

function MenuItemCard({ item }: { item: GenericMenuItemData }) {
  return (
    <article className={styles.item}>
      {item.image ? (
        <figure className={styles.image}>
          <img
            alt={item.image.imageAlt}
            decoding="async"
            height={item.image.height}
            loading="lazy"
            src={item.image.imageUrl}
            width={item.image.width}
          />
        </figure>
      ) : null}
      <div className={styles.itemBody}>
        <div className={styles.itemHeading}>
          <div>
            <h3>{item.name}</h3>
            {item.detail ? <small>{item.detail}</small> : null}
          </div>
          <ItemPrice item={item} />
        </div>
        {item.description ? <p>{item.description}</p> : null}
        {item.highlight ? <b className={styles.highlight}>{item.highlight}</b> : null}
        {item.badges.length ? (
          <div className={styles.badges}>
            {item.badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
        ) : null}
        {item.allergens ? <small className={styles.note}>{item.allergens}</small> : null}
        {item.priceNote ? <small className={styles.note}>{item.priceNote}</small> : null}
        {item.availabilityNote ? (
          <small className={styles.availability}>{item.availabilityNote}</small>
        ) : null}
      </div>
    </article>
  );
}

export function MenuCategory({ category }: { category: GenericMenuCategoryData }) {
  return (
    <section
      className={styles.category}
      data-display={category.displayType}
      id={`kategori-${category.slug}`}
    >
      <header className={styles.categoryHeading}>
        <div>
          <p className="menu-kicker">{category.displayType.replaceAll("_", " ")}</p>
          <h2>{category.name}</h2>
        </div>
        {category.description ? <p>{category.description}</p> : null}
      </header>
      <div className={styles.items}>
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function GenericMenuCategoryList({
  categories,
}: {
  categories: GenericMenuCategoryData[];
}) {
  if (!categories.length) return null;

  return (
    <div className={styles.categories}>
      {categories.map((category) => (
        <MenuCategory key={category.id} category={category} />
      ))}
    </div>
  );
}

export default function GenericMenuPanel({
  branch,
  hidden,
  panelRef,
}: {
  branch: GenericMenuBranchData;
  hidden: boolean;
  panelRef?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={panelRef}
      aria-labelledby={`tab-${branch.slug}`}
      className={`${styles.panel} dotted-paper`}
      id={`panel-${branch.slug}`}
      role="tabpanel"
      hidden={hidden}
    >
      <div className="container">
        <header className={`${styles.intro} reveal`}>
          <p className="menu-kicker">{branch.code} · {branch.name}</p>
          <h2>{branch.name} menüsü<span>.</span></h2>
          <p>{branch.description}</p>
        </header>
        <GenericMenuCategoryList categories={branch.categories} />
      </div>
    </section>
  );
}
