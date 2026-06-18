import { formatTry } from "@/lib/formatters";
import type { MerchProductContent } from "@/types/content";

type MerchCardProps = {
  product: MerchProductContent;
  variant: "visual" | "detail";
};

export default function MerchCard({ product, variant }: MerchCardProps) {
  const price = formatTry(product.price);

  if (variant === "detail") {
    return (
      <article>
        <div className="merch-price-line">
          <strong>
            {product.index}. {product.name}
          </strong>
          <span>{price}</span>
        </div>
        <p>{product.description}</p>
        <small>{product.detail}</small>
      </article>
    );
  }

  return (
    <article className="home-merch-product">
      <img alt={product.imageAlt} src={product.image} />
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
