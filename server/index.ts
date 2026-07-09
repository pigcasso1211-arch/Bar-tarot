import express from "express";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pickTarotCard, tarotCards, type TarotCard } from "../shared/tarot";
import type { PlaceRecommendation } from "../shared/places";
import { mockPlaces } from "./mockPlaces";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  businessStatus?: string;
  currentOpeningHours?: { openNow?: boolean };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  types?: string[];
};

loadLocalEnv();

const app = express();
const port = Number(process.env.PORT ?? 8787);
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
const serverDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(serverDir, "../dist");
const fieldMask = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.businessStatus",
  "places.currentOpeningHours",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.types"
].join(",");

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, usesGoogle: Boolean(process.env.GOOGLE_MAPS_API_KEY) });
});

app.get("/api/tarot-cards", (_req, res) => {
  res.json({ cards: tarotCards });
});

app.post("/api/recommend", async (req, res) => {
  const city = typeof req.body?.city === "string" ? req.body.city : "Singapore";
  const card = pickTarotCard(typeof req.body?.cardId === "string" ? req.body.cardId : undefined);

  try {
    const places = await findPlaces(card, city);
    const candidates = places.length > 0 ? places : mockForCard(card);
    const picked = weightedPick(candidates, card);
    const alternatives = candidates.filter((place) => place.id !== picked.id).slice(0, 3);

    res.json({
      card,
      place: picked,
      alternatives,
      source: places.length > 0 ? "google" : "mock",
      notice: places.length > 0 ? undefined : "Google Places 暂不可用，已使用内置示例酒吧。"
    });
  } catch (error) {
    const candidates = mockForCard(card);
    const picked = weightedPick(candidates, card);
    res.json({
      card,
      place: picked,
      alternatives: candidates.filter((place) => place.id !== picked.id).slice(0, 3),
      source: "mock",
      notice: "Google Places 暂不可用，已使用内置示例酒吧。"
    });
  }
});

if (process.env.NODE_ENV === "production" && existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(resolve(distDir, "index.html"));
  });
}

async function findPlaces(card: TarotCard, city: string): Promise<PlaceRecommendation[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const query = card.queries[Math.floor(Math.random() * card.queries.length)].replace(/Singapore/gi, city);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask
      },
      body: JSON.stringify({
        textQuery: query,
        includedType: "bar",
        strictTypeFiltering: true,
        regionCode: "SG",
        languageCode: "zh-CN",
        pageSize: 12
      })
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { places?: GooglePlace[] };
    const places = (data.places ?? [])
      .filter((place) => place.businessStatus === "OPERATIONAL")
      .map((place) => normalizeGooglePlace(place, card))
      .sort((a, b) => {
        const openDiff = Number(b.isOpenTonight === true) - Number(a.isOpenTonight === true);
        if (openDiff !== 0) return openDiff;
        return scorePlace(b, card) - scorePlace(a, card);
      });

    return dedupePlaces(places);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeGooglePlace(place: GooglePlace, card: TarotCard): PlaceRecommendation {
  const isOpenTonight =
    typeof place.currentOpeningHours?.openNow === "boolean" ? place.currentOpeningHours.openNow : null;

  return {
    id: place.id ?? place.googleMapsUri ?? place.displayName?.text ?? crypto.randomUUID(),
    name: place.displayName?.text ?? "Unnamed bar",
    address: place.formattedAddress ?? "Singapore",
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    priceLevel: place.priceLevel,
    mapsUri: place.googleMapsUri,
    websiteUri: place.websiteUri,
    types: place.types ?? [],
    isOpenTonight,
    statusLabel: isOpenTonight === true ? "今晚营业" : isOpenTonight === false ? "目前未营业" : "营业时间需确认",
    source: "google",
    moodTags: [card.mood]
  };
}

function mockForCard(card: TarotCard) {
  const exact = mockPlaces.filter((place) => place.moodTags.includes(card.mood));
  const merged = [...exact, ...mockPlaces.filter((place) => !exact.includes(place))];
  return merged.slice(0, 8);
}

function weightedPick(places: PlaceRecommendation[], card: TarotCard) {
  const scored = places.map((place) => ({ place, score: Math.max(1, scorePlace(place, card)) }));
  const total = scored.reduce((sum, item) => sum + item.score, 0);
  let cursor = Math.random() * total;

  for (const item of scored) {
    cursor -= item.score;
    if (cursor <= 0) return item.place;
  }

  return places[0];
}

function scorePlace(place: PlaceRecommendation, card: TarotCard) {
  const rating = place.rating ? place.rating * 12 : 36;
  const reviewWeight = place.userRatingCount ? Math.min(22, Math.log10(place.userRatingCount + 1) * 8) : 6;
  const openWeight = place.isOpenTonight === true ? 18 : place.isOpenTonight === null ? 8 : -10;
  const moodWeight = place.moodTags.includes(card.mood) ? 24 : 8;
  const priceWeight = place.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE" ? -4 : 4;
  return rating + reviewWeight + openWeight + moodWeight + priceWeight;
}

function dedupePlaces(places: PlaceRecommendation[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = place.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

app.listen(port, host, () => {
  console.log(`Bar Tarot listening on http://${host}:${port}`);
});

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
