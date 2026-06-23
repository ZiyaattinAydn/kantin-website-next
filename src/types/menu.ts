export type MenuBranch = string;

export type BranchOption = {
  id: MenuBranch;
  code?: string;
  label: string;
  description: string;
};

export type PriceTableRow = {
  name: string;
  detail?: string;
  prices: string[];
};

export type CompactMenuItem = {
  name: string;
  detail?: string;
  price: string;
};

export type FoodMenuItem = {
  name: string;
  description?: string;
  highlight?: string;
  allergens?: string;
  price: string;
  priceNote?: string;
  badge?: "ACILI" | "VEGAN";
  className?: string;
};

export type EditorialMenuItem = {
  name: string;
  description: string;
  price: string;
};

export type CoffeeMenuGroup = {
  title: string;
  subtitle?: string;
  items: CompactMenuItem[];
};
