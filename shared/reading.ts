import type { PlaceRecommendation } from "./places";
import type { TarotCard, TarotMood } from "./tarot";

const moodAtmosphere: Record<TarotMood, string> = {
  mysterious: "灯光偏低、说话自然压低，带一点 speakeasy 式的隐秘感",
  social: "热闹但不局促，适合拼桌、搭讪和即兴的第二杯",
  romantic: "灯光柔和、座位亲密，节奏慢下来刚刚好",
  rooftop: "视野开阔，风和高处的城市灯光是主角",
  quiet: "音量克制、座位舒适，适合慢慢聊到天亮",
  experimental: "酒单有惊喜，调酒师像在吧台后做小型表演",
  luxury: "服务精致、空间有质感，今晚值得被好好接待",
  music: "背景音乐或现场演奏撑起氛围，酒是配角",
  classic: "经典鸡尾酒文化浓厚，吧台值得信赖",
  wildcard: "风格不拘一格，带一点「来了才知道」的意外感"
};

const typeHints: Record<string, string> = {
  cocktail_bar: "鸡尾酒专门店",
  bar: "综合酒吧",
  wine_bar: "葡萄酒吧",
  rooftop_bar: "屋顶酒吧",
  live_music_venue: "现场音乐场所",
  night_club: "夜生活场所",
  hotel: "酒店酒廊"
};

export type BarReading = {
  atmosphere: string;
  ratingInsight: string;
  priceDisplay: string;
  drink: { name: string; note: string };
};

export function buildBarReading(card: TarotCard, place: PlaceRecommendation): BarReading {
  const mood = moodAtmosphere[card.mood];
  const typeHint = place.types.map((type) => typeHints[type]).find(Boolean) ?? "酒吧";
  const openHint =
    place.isOpenTonight === true
      ? "此刻正在营业，"
      : place.isOpenTonight === false
        ? "目前未营业，出发前建议再确认，"
        : "";

  const atmosphere = `${place.name} 是一家${typeHint}，整体氛围${mood}。${openHint}${card.invitation}`;

  return {
    atmosphere,
    ratingInsight: formatRatingInsight(place.rating, place.userRatingCount),
    priceDisplay: formatPriceDisplay(place.priceLevel),
    drink: { name: card.signatureDrink, note: card.drinkNote }
  };
}

function formatRatingInsight(rating?: number, count?: number): string {
  if (!rating) return "暂无足够评分数据，但牌面依然指向这里。";

  const reviews = count ?? 0;
  if (rating >= 4.6 && reviews >= 500) {
    return `Google 评分 ${rating.toFixed(1)}（${reviews} 条评价），口碑扎实，是经得起复访的选择。`;
  }
  if (rating >= 4.4 && reviews >= 200) {
    return `Google 评分 ${rating.toFixed(1)}（${reviews} 条评价），评价稳定，值得今晚一试。`;
  }
  if (rating >= 4.0) {
    return `Google 评分 ${rating.toFixed(1)}${reviews ? `（${reviews} 条评价）` : ""}，整体反馈不错。`;
  }
  return `Google 评分 ${rating.toFixed(1)}，评分偏保守，但牌面依然选中它——也许有隐藏魅力。`;
}

function formatPriceDisplay(price?: string): string {
  const map: Record<string, string> = {
    PRICE_LEVEL_FREE: "约 S$0–20/人",
    PRICE_LEVEL_INEXPENSIVE: "约 S$30–50/人",
    PRICE_LEVEL_MODERATE: "约 S$50–80/人",
    PRICE_LEVEL_EXPENSIVE: "约 S$80–120/人",
    PRICE_LEVEL_VERY_EXPENSIVE: "约 S$120–180/人"
  };
  return map[price ?? ""] ?? "人均约 S$50–90（预估）";
}
