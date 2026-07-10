import type { TarotMood } from "./tarot";

export type PlaceRecommendation = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  mapsUri?: string;
  websiteUri?: string;
  types: string[];
  isOpenTonight: boolean | null;
  statusLabel: string;
  source: "google" | "mock";
  moodTags: TarotMood[];
};

export type RecommendResponse = {
  card: import("./tarot").TarotCard;
  place: PlaceRecommendation;
  alternatives: PlaceRecommendation[];
  source: "google" | "mock";
  notice?: string;
};

export type DrinkRecommendation = {
  name: string;
  note: string;
  orderHint: string;
};

export type DrinkRecommendResponse = {
  card: import("./tarot").TarotCard;
  bar: PlaceRecommendation;
  drink: DrinkRecommendation;
  source: "google" | "mock";
  notice?: string;
};
