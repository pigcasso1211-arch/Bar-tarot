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
