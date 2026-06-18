import type {
  CompactMenuItem,
  EditorialMenuItem,
  FoodMenuItem,
  PriceTableRow,
} from "@/content/menu";

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sheet-title">
      <h3>{children}</h3>
    </div>
  );
}

export function EditorialTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="menu-editorial-title">
      <h3>{children}</h3>
    </div>
  );
}

export function PriceTable({
  headers,
  rows,
  headClassName = "",
  rowClassName = "",
}: {
  headers: string[];
  rows: PriceTableRow[];
  headClassName?: string;
  rowClassName?: string;
}) {
  return (
    <>
      <div className={`menu-price-head ${headClassName}`.trim()}>
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={`${row.name}-${row.prices.join("-")}`} className={`menu-price-row ${rowClassName}`.trim()}>
          <strong>
            {row.name}
            {row.detail ? <small>{row.detail}</small> : null}
          </strong>
          {row.prices.map((price, index) => (
            <span key={`${row.name}-${index}`}>{price}</span>
          ))}
        </div>
      ))}
    </>
  );
}

export function CompactList({
  items,
  className = "",
}: {
  items: CompactMenuItem[];
  className?: string;
}) {
  return (
    <div className={`bottle-grid ${className}`.trim()}>
      {items.map((item, index) => (
        <div key={`${item.name}-${item.detail}-${index}`} className="compact-row">
          <span>
            {item.name}
            {item.detail ? <small>{item.detail}</small> : null}
          </span>
          <strong>{item.price}</strong>
        </div>
      ))}
    </div>
  );
}

function renderDescription(item: FoodMenuItem) {
  if (!item.description) return null;
  if (!item.highlight) return <p>{item.description}</p>;

  const [before, after = ""] = item.description.split("{highlight}");
  return (
    <p>
      {before}
      <b>{item.highlight}</b>
      {after}
    </p>
  );
}

export function BranchFoodItem({ item }: { item: FoodMenuItem }) {
  return (
    <article className={`branch-food-item${item.className ? ` ${item.className}` : ""}`}>
      <div>
        <h4>
          {item.name}
          {item.badge ? <span className="spicy-badge">{item.badge}</span> : null}
        </h4>
        {renderDescription(item)}
        {item.allergens ? <small>{item.allergens}</small> : null}
      </div>
      <strong>{item.price}</strong>
    </article>
  );
}

export function EditorialItems({
  items,
  className = "",
}: {
  items: EditorialMenuItem[];
  className?: string;
}) {
  return (
    <div className={className || undefined}>
      {items.map((item) => (
        <article key={item.name} className="editorial-item">
          <div>
            <h4>{item.name}</h4>
            <p>{item.description}</p>
          </div>
          <strong>{item.price}</strong>
        </article>
      ))}
    </div>
  );
}

export function AtakentFoodItem({ item }: { item: FoodMenuItem }) {
  return (
    <article className="food-item">
      <div>
        <h4>{item.name}</h4>
        {item.description ? <p>{item.description}</p> : null}
        {item.allergens ? <small>{item.allergens}</small> : null}
      </div>
      <div className="food-price">
        <strong>{item.price}</strong>
        {item.priceNote ? <span>{item.priceNote}</span> : null}
      </div>
    </article>
  );
}
