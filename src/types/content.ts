import type { BranchId, MerchProduct } from "./domain";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

export type MerchDoodle = {
  src: string;
  className: string;
};

export type MerchProductContent = MerchProduct & {
  index: string;
  detail: string;
  image: string;
  imageAlt: string;
};

export type MerchBundle = {
  name: string;
  price: number;
};

export type HomeMenuBranch = {
  slug: BranchId;
  code: "ALS" | "ATA";
  name: string;
  image: ImageAsset;
  title: string;
  description: string;
  tags: string[];
  delayClass?: string;
};

export type LocationBranch = {
  slug: BranchId;
  code: "ALS" | "ATA";
  visualClass: "branch-alsancak" | "branch-atakent";
  eyebrow: string;
  title: string;
  address: string;
  mapsUrl: string;
  images: ImageAsset[];
  delayClass?: string;
};

export type NavigationItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};
