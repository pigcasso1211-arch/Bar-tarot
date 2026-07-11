import express from "express";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pickTarotCard, tarotCards, type TarotCard } from "../shared/tarot";
import type { DrinkRecommendation, PlaceRecommendation } from "../shared/places";
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

app.get("/api/bar-suggestions", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : "Singapore";
  const query = typeof req.query.query === "string" ? req.query.query.trim() : "";

  if (query.length < 2) {
    res.json({ places: [] });
    return;
  }

  const card = pickTarotCard();

  try {
    const places = await findNamedBars(query, city, card);
    res.json({
      places: places.length > 0 ? places.slice(0, 8) : mockSuggestions(query, card),
      source: places.length > 0 ? "google" : "mock"
    });
  } catch (error) {
    res.json({ places: mockSuggestions(query, card), source: "mock" });
  }
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

app.post("/api/drink-recommend", async (req, res) => {
  const city = typeof req.body?.city === "string" ? req.body.city : "Singapore";
  const barName = typeof req.body?.barName === "string" ? req.body.barName.trim() : "";

  if (!barName) {
    res.status(400).json({ error: "barName is required" });
    return;
  }

  const card = pickTarotCard(typeof req.body?.cardId === "string" ? req.body.cardId : undefined);

  try {
    const bars = await findNamedBars(barName, city, card);
    const bar = bars[0] ?? mockBarForName(barName, city, card);

    res.json({
      card,
      bar,
      drink: buildDrinkRecommendation(card, bar),
      source: bars.length > 0 ? "google" : "mock",
      notice:
        bars.length > 0
          ? "Google Places 已匹配到这家 bar；具体酒单以店内菜单为准。"
          : "暂时无法实时确认这家 bar，已按你输入的店名生成点单建议。"
    });
  } catch (error) {
    const bar = mockBarForName(barName, city, card);
    res.json({
      card,
      bar,
      drink: buildDrinkRecommendation(card, bar),
      source: "mock",
      notice: "Google Places 暂不可用，已按你输入的店名生成点单建议。"
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

async function findNamedBars(barName: string, city: string, card: TarotCard): Promise<PlaceRecommendation[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

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
        textQuery: `${barName} bar ${city}`,
        includedType: "bar",
        regionCode: "SG",
        languageCode: "zh-CN",
        pageSize: 5
      })
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { places?: GooglePlace[] };

    return dedupePlaces(
      (data.places ?? [])
        .filter((place) => place.businessStatus === "OPERATIONAL")
        .map((place) => normalizeGooglePlace(place, card))
    );
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

function mockBarForName(barName: string, city: string, card: TarotCard): PlaceRecommendation {
  const fallback = mockForCard(card)[0];

  return {
    ...fallback,
    id: `typed-${barName.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
    name: barName,
    address: city,
    mapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${barName} ${city}`)}`,
    source: "mock",
    moodTags: [card.mood]
  };
}

function mockSuggestions(query: string, card: TarotCard) {
  const normalized = query.toLowerCase();
  const matched = mockPlaces.filter((place) => place.name.toLowerCase().includes(normalized));
  const fallback = mockPlaces.filter((place) => !matched.includes(place));
  return [...matched, ...fallback].slice(0, 8).map((place) => ({
    ...place,
    moodTags: place.moodTags.length > 0 ? place.moodTags : [card.mood]
  }));
}

function buildDrinkRecommendation(card: TarotCard, bar: PlaceRecommendation): DrinkRecommendation {
  const orderHintByMood: Record<TarotCard["mood"], string> = {
    mysterious: "在酒单里找 speakeasy、smoky、bitter、spirit-forward 这一类；没有同名就请 bartender 做一杯暗色、苦甜、酒感清楚的版本。",
    social: "在酒单里找 highball、spritz、fizz 或适合开场的清爽长饮；今晚这张牌不适合太沉重。",
    romantic: "在酒单里找 floral、champagne、berry、wine-based 或酸甜柔和的杯型，适合慢慢喝。",
    rooftop: "在酒单里找 citrus、tropical、sparkling 或 signature long drink，最好是一杯能配夜景的亮口味。",
    quiet: "在酒单里找 highball、old fashioned、toddy 或低调经典款，不需要过多装饰。",
    experimental: "在酒单里找 clarified、smoked、fermented、herbal 或 bartender's choice，把选择权交给吧台。",
    luxury: "在酒单里找 champagne、martini、hotel signature 或 premium spirits，今晚值得点一杯做工细的。",
    music: "在酒单里找 whiskey sour、rum、jazz-age classics 或节奏感强的酸甜款。",
    classic: "在酒单里找 martini、negroni、manhattan、daiquiri 这些经典结构，重点是比例准确。",
    wildcard: "在酒单里找 daily special、seasonal、bartender's choice 或你平常不会点的那一杯。"
  };

  return {
    name: card.signatureDrink,
    note: `${card.drinkNote} 这张牌给 ${bar.name} 的点单方向是：先看菜单里有没有接近它的 signature。`,
    orderHint: orderHintByMood[card.mood]
  };
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
