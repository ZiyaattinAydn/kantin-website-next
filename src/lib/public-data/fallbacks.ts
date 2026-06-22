import { branches } from "@/data/branches";
import { homeHero, homeMenuBranches, locationBranches } from "@/data/home";
import { instagramPosts } from "@/data/instagram";
import { memoriesSection, memoryPhotos } from "@/data/memories";
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
  branchOptions,
  cheesePortions,
  coffeeExtras,
  coffeeGroups,
  menuHero,
  sauceBar,
} from "@/data/menu";
import { merchBundles, merchDoodles, merchProducts } from "@/data/merch";
import { footerNavigation, primaryNavigation, siteIdentity } from "@/data/site";
import type { CommonPublicData, HomePublicData, MenuPublicData } from "./types";
import { DEFAULT_THEME_SETTINGS } from "@/lib/theme/settings";

export const fallbackCommonData: CommonPublicData = {
  branches: branches.map((branch) => ({ ...branch, features: [...branch.features] })),
  siteIdentity: {
    ...siteIdentity,
    sloganLines: [...siteIdentity.sloganLines],
  },
  publicEmail: "hello@kantin.pub",
  primaryNavigation: primaryNavigation.map((item) => ({ ...item })),
  footerNavigation: footerNavigation.map((group) => ({
    title: group.title,
    links: group.links.map((link) => ({ ...link })),
  })),
  footerContent: {
    title: "İki şube, tek ruh.",
    intro:
      "Alsancak’ın sokak temposu, Atakent’in bahçe ve kokteyl ritmi. İkisinde de hızlı servis, samimi ekip ve uzayan sohbetler.",
    workTitle: "Kantin’in bir parçası olmak ister misin?",
    workDescription:
      "Servis, mutfak, bar ve kasa ekipleri için vardiya tercihlerini belirleyip başvuru formunu doldur.",
    bottomLine: "İzmir’de iyi akşamlar için.",
  },
  sectionVisibility: {
    homeHero: true,
    branches: true,
    menu: true,
    events: true,
    merch: true,
    memories: true,
    instagram: true,
    careers: true,
  },
  themeSettings: {
    ...DEFAULT_THEME_SETTINGS,
    homeSectionOrder: [...DEFAULT_THEME_SETTINGS.homeSectionOrder],
  },
};

export const fallbackHomeData: HomePublicData = {
  hero: {
    ...homeHero,
    title: [...homeHero.title],
    features: homeHero.features.map((feature) => ({ ...feature })),
  },
  menuBranches: homeMenuBranches.map((branch) => ({
    ...branch,
    image: { ...branch.image },
    tags: [...branch.tags],
  })),
  locationBranches: locationBranches.map((branch) => ({
    ...branch,
    images: branch.images.map((image) => ({ ...image })),
  })),
  memoriesSection: {
    ...memoriesSection,
    chapters: memoriesSection.chapters.map((chapter) => ({ ...chapter })),
  },
  memoryPhotos: memoryPhotos.map((photo) => ({ ...photo })),
  merchDoodles: merchDoodles.map((doodle) => ({ ...doodle })),
  merchProducts: merchProducts.map((product) => ({
    ...product,
    branchIds: [...product.branchIds],
  })),
  merchBundles: merchBundles.map((bundle) => ({ ...bundle })),
  instagramPosts: instagramPosts.map((post) => ({ ...post })),
  eventData: {
    events: [],
    branchLabels: { alsancak: "Alsancak", atakent: "Atakent", both: "İki şube" },
    branchAddresses: {
      alsancak: "1464. Sokak No:71/A, Alsancak, Konak / İzmir",
      atakent: "2035 Sokak No:6, Atakent, Karşıyaka / İzmir",
      both: "Alsancak + Atakent",
    },
    instagramUrl: siteIdentity.instagramUrl,
  },
};

export const fallbackMenuData: MenuPublicData = {
  hasMenuData: true,
  itemImages: [],
  branchOptions: branchOptions.map((branch) => ({ ...branch })),
  menuHero: { ...menuHero },
  alsancakIntro: { ...alsancakIntro, titleLines: [...alsancakIntro.titleLines] },
  alsancakDraftBeers: alsancakDraftBeers.map((item) => ({ ...item, prices: [...item.prices] })),
  alsancakBottleBeers: alsancakBottleBeers.map((item) => ({ ...item })),
  alsancakDeliItems: alsancakDeliItems.map((item) => ({ ...item })),
  cheesePortions: {
    feature: { ...cheesePortions.feature },
    note: cheesePortions.note,
    prices: cheesePortions.prices.map((price) => ({ ...price })),
    options: cheesePortions.options.map((option) => ({ ...option })),
  },
  beerSalads: beerSalads.map((item) => ({
    ...item,
    prices: item.prices.map((price) => ({ ...price })),
  })),
  alsancakWine: { ...alsancakWine },
  alsancakFryerItems: alsancakFryerItems.map((item) => ({ ...item })),
  alsancakOvenItems: alsancakOvenItems.map((item) => ({ ...item })),
  sauceBar: { ...sauceBar, items: [...sauceBar.items] },
  coffeeGroups: coffeeGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item })),
  })),
  coffeeExtras: coffeeExtras.map((item) => ({ ...item })),
  atakentIntro: { ...atakentIntro, titleLines: [...atakentIntro.titleLines] },
  atakentDraftBeers: atakentDraftBeers.map((item) => ({ ...item, prices: [...item.prices] })),
  atakentBubbleCocktails: atakentBubbleCocktails.map((item) => ({ ...item })),
  atakentHouseCocktails: atakentHouseCocktails.map((item) => ({ ...item })),
  atakentBottleBeers: atakentBottleBeers.map((item) => ({ ...item })),
  atakentWines: atakentWines.map((item) => ({ ...item, prices: [...item.prices] })),
  atakentHotItems: atakentHotItems.map((item) => ({ ...item })),
  atakentGrillItems: atakentGrillItems.map((item) => ({ ...item })),
  atakentDessert: { ...atakentDessert },
};
