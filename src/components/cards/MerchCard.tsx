import { formatTry } from "@/lib/formatters";
import type { MerchProductContent } from "@/types/content";

type MerchCardProps = {
  product: MerchProductContent;
  variant: "visual" | "detail";
  onPreview?: (
    product: MerchProductContent,
    trigger: HTMLButtonElement,
  ) => void;
};

function MissingMerchImage({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="Ürün görseli henüz yayınlanmadı."
      className={`${compact ? "merch-detail-preview" : "home-merch-product-preview"} merch-image-empty`}
      role="img"
    >
      <span>Görsel yok</span>
    </div>
  );
}

export default function MerchCard({
  product,
  variant,
  onPreview,
}: MerchCardProps) {
  const price = formatTry(product.price);
  const hasImage = Boolean(product.image);
  const showDetailMediaColumn = Boolean(onPreview) || !hasImage;

  if (variant === "detail") {
    return (
      <article className={showDetailMediaColumn ? "merch-detail-product" : undefined}>
        {onPreview && hasImage ? (
          <button
            aria-label={`${product.name} görselini büyüt`}
            className="merch-detail-preview"
            onClick={(event) => onPreview(product, event.currentTarget)}
            type="button"
          >
            <img alt="" src={product.image} />
            <span aria-hidden="true">↗</span>
          </button>
        ) : !hasImage ? (
          <MissingMerchImage compact />
        ) : null}
        <div className={showDetailMediaColumn ? "merch-detail-copy" : undefined}>
          <div className="merch-price-line">
            <strong>
              {product.index}. {product.name}
            </strong>
            <span>{price}</span>
          </div>
          <p>{product.description}</p>
          <small>{product.detail}</small>
        </div>
      </article>
    );
  }

  return (
    <article className="home-merch-product">
      {hasImage && onPreview ? (
        <button
          aria-label={`${product.name} görselini büyüt`}
          className="home-merch-product-preview"
          onClick={(event) => onPreview(product, event.currentTarget)}
          type="button"
        >
          <img alt={product.imageAlt} src={product.image} />
          <span aria-hidden="true">Büyüt ↗</span>
        </button>
      ) : hasImage ? (
        <img alt={product.imageAlt} src={product.image} />
      ) : (
        <MissingMerchImage />
      )}
      <div>
        <div className="home-merch-product-title">
          <h4>{product.name}</h4>
          <strong>{price}</strong>
        </div>
        <p>{product.description}</p>
      </div>
    </article>
  );
}
