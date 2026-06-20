import type { FooterLink, HomeMenuBranch, InstagramPost, LocationBranch, MerchBundle, MerchDoodle, MerchProductContent, NavigationItem } from "@/types/content";
import type { Branch } from "@/types/domain";
import type { CoffeeMenuGroup, CompactMenuItem, EditorialMenuItem, FoodMenuItem, PriceTableRow } from "@/types/menu";
import type { MemoryPhoto } from "@/data/memories";
import type { KantinEvent } from "@/lib/events";

export type PublicDataSource = "supabase" | "fallback" | "empty";

export type PublicDataEnvelope<T> = {
  data: T;
  source: PublicDataSource;
  issues: string[];
};

export type SiteIdentityData = {
  name: string;
  slogan: string;
  sloganLines: string[];
  instagramUrl: string;
};

export type FooterNavigationGroup = {
  title: string;
  links: FooterLink[];
};

export type FooterContentData = {
  title: string;
  intro: string;
  workTitle: string;
  workDescription: string;
  bottomLine: string;
};

export type SectionVisibility = {
  homeHero: boolean;
  branches: boolean;
  menu: boolean;
  events: boolean;
  merch: boolean;
  memories: boolean;
  instagram: boolean;
  careers: boolean;
};

export type CommonPublicData = {
  branches: Branch[];
  siteIdentity: SiteIdentityData;
  publicEmail: string;
  primaryNavigation: NavigationItem[];
  footerNavigation: FooterNavigationGroup[];
  footerContent: FooterContentData;
  sectionVisibility: SectionVisibility;
};

export type HomeHeroData = {
  eyebrow: string;
  title: string[];
  description: string;
  primaryAction: { href: string; label: string };
  secondaryAction: { href: string; label: string };
  features: Array<{ label: string; href: string }>;
  marquee: string;
};

export type MemoriesSectionData = {
  eyebrow: string;
  title: string;
  introduction: string;
  statement: string;
  chapters: Array<{ label: string; title: string; description: string }>;
  closingLine: string;
};

export type HomePublicData = {
  hero: HomeHeroData;
  menuBranches: HomeMenuBranch[];
  locationBranches: LocationBranch[];
  memoriesSection: MemoriesSectionData;
  memoryPhotos: MemoryPhoto[];
  merchDoodles: MerchDoodle[];
  merchProducts: MerchProductContent[];
  merchBundles: MerchBundle[];
  instagramPosts: InstagramPost[];
  eventData: EventPublicData;
};

export type BranchIntroData = {
  kicker: string;
  titleLines: string[];
  description: string;
};

export type CheesePortionsData = {
  feature: { name: string; description: string; price: string };
  note: string;
  prices: Array<{ label: string; price: string }>;
  options: Array<{
    name: string;
    detail: string;
    portion: string;
    mixed?: boolean;
  }>;
};

export type BeerSaladData = {
  name: string;
  description: string;
  prices: Array<{ label: string; price: string }>;
};

export type MenuHeroData = {
  eyebrow: string;
  title: string;
  description: string;
  mark: string;
};

export type MenuPublicData = {
  hasMenuData: boolean;
  branchOptions: Array<{ id: "alsancak" | "atakent"; label: string; description: string }>;
  menuHero: MenuHeroData;
  alsancakIntro: BranchIntroData;
  alsancakDraftBeers: PriceTableRow[];
  alsancakBottleBeers: CompactMenuItem[];
  alsancakDeliItems: FoodMenuItem[];
  cheesePortions: CheesePortionsData;
  beerSalads: BeerSaladData[];
  alsancakWine: { name: string; description: string; price: string; priceDetail: string };
  alsancakFryerItems: FoodMenuItem[];
  alsancakOvenItems: FoodMenuItem[];
  sauceBar: { kicker: string; title: string; items: string[] };
  coffeeGroups: CoffeeMenuGroup[];
  coffeeExtras: Array<{ label: string; description: string; price: string }>;
  atakentIntro: BranchIntroData;
  atakentDraftBeers: PriceTableRow[];
  atakentBubbleCocktails: EditorialMenuItem[];
  atakentHouseCocktails: EditorialMenuItem[];
  atakentBottleBeers: CompactMenuItem[];
  atakentWines: PriceTableRow[];
  atakentHotItems: FoodMenuItem[];
  atakentGrillItems: FoodMenuItem[];
  atakentDessert: {
    kicker: string;
    name: string;
    description: string;
    allergens: string;
    price: string;
  };
};

export type EventPublicData = {
  events: KantinEvent[];
  branchLabels: Record<"alsancak" | "atakent" | "both", string>;
  branchAddresses: Record<"alsancak" | "atakent" | "both", string>;
  instagramUrl: string;
};
