import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ExternalLink, MapPin, RefreshCw, Sparkles, Shuffle, Star } from "lucide-react";
import type { RecommendResponse, PlaceRecommendation } from "../shared/places";
import type { TarotCard } from "../shared/tarot";
import "./styles.css";

type DrawState = "idle" | "drawing" | "revealed" | "error";

function App() {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [state, setState] = useState<DrawState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tarot-cards")
      .then((response) => response.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]));
  }, []);

  const currentCard = useMemo(() => {
    if (result?.card) return result.card;
    return cards.find((card) => card.id === selectedCardId) ?? cards[0];
  }, [cards, result, selectedCardId]);

  async function draw(cardId?: string) {
    setState("drawing");
    setError("");
    setResult(null);

    try {
      await wait(520);
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: "Singapore", cardId })
      });

      if (!response.ok) throw new Error("recommend failed");
      const data = (await response.json()) as RecommendResponse;
      setSelectedCardId(data.card.id);
      setResult(data);
      setState("revealed");
    } catch {
      setError("今晚的牌面被云遮住了。请稍后再抽一次。");
      setState("error");
    }
  }

  function redraw() {
    const cardId = cards[Math.floor(Math.random() * Math.max(cards.length, 1))]?.id;
    void draw(cardId);
  }

  function chooseAlternative(place: PlaceRecommendation) {
    if (!result) return;
    setResult({
      ...result,
      place,
      alternatives: [result.place, ...result.alternatives.filter((item) => item.id !== place.id)].slice(0, 3)
    });
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Singapore Night Tarot</p>
          <h1>今晚抽一间酒吧</h1>
          <p className="lede">让塔罗牌先决定氛围，再从新加坡的夜色里挑一家适合今晚的 bar。</p>
        </div>

        <div className={`tarot-stage ${state === "drawing" ? "is-drawing" : ""} ${result ? "is-revealed" : ""}`}>
          <button className="card-button" type="button" onClick={() => redraw()} disabled={state === "drawing"}>
            <div className="card-face card-back">
              <Sparkles size={30} />
              <span>Draw</span>
            </div>
            <div
              className="card-face card-front"
              style={
                currentCard
                  ? ({ "--card-a": currentCard.palette[0], "--card-b": currentCard.palette[1] } as React.CSSProperties)
                  : undefined
              }
            >
              <small>{currentCard?.arcana ?? "?"}</small>
              <TarotIllustration cardId={currentCard?.id} />
              <strong>{currentCard?.name ?? "Tarot"}</strong>
              <span>{currentCard?.mood ?? "night"}</span>
            </div>
          </button>
        </div>

        <div className="actions">
          <button className="primary-action" type="button" onClick={() => redraw()} disabled={state === "drawing"}>
            {state === "drawing" ? <RefreshCw className="spin" size={18} /> : <Shuffle size={18} />}
            {state === "drawing" ? "正在洗牌" : result ? "重新抽牌" : "抽今晚的牌"}
          </button>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      {result ? (
        <section className="result-layout" aria-live="polite">
          <article className="reading-panel">
            <p className="eyebrow">{result.card.name}</p>
            <h2>{result.card.title}</h2>
            <p>{result.card.reading}</p>
            <p className="invitation">{result.card.invitation}</p>
            {result.notice ? <span className="notice">{result.notice}</span> : null}
          </article>

          <PlacePanel place={result.place} featured />

          <section className="alternatives" aria-label="备选酒吧">
            <div className="section-heading">
              <h2>换一家也可以</h2>
              <span>{result.source === "google" ? "Live Places" : "Mock data"}</span>
            </div>
            <div className="alternative-list">
              {result.alternatives.map((place) => (
                <button key={place.id} className="alternative-item" type="button" onClick={() => chooseAlternative(place)}>
                  <span>{place.name}</span>
                  <small>{place.statusLabel}</small>
                </button>
              ))}
            </div>
          </section>
        </section>
      ) : (
        <section className="empty-state">
          <div className="mini-deck" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>先抽一张牌，今晚的第一杯就有方向了。</p>
        </section>
      )}
    </main>
  );
}

function TarotIllustration({ cardId }: { cardId?: string }) {
  return (
    <svg className="tarot-art" viewBox="0 0 180 220" role="img" aria-label={cardId ?? "tarot illustration"}>
      <defs>
        <radialGradient id="halo" cx="50%" cy="34%" r="52%">
          <stop offset="0%" stopColor="#fff6c7" />
          <stop offset="100%" stopColor="#e6c76f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="robe" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f8f4e8" />
          <stop offset="100%" stopColor="#d9a441" />
        </linearGradient>
      </defs>
      <rect className="art-sky" x="14" y="14" width="152" height="192" rx="16" />
      <TarotScene cardId={cardId} />
      <path className="art-ground" d="M28 176 C58 164 80 190 112 176 C138 164 148 176 158 184 L158 196 L28 196 Z" />
      <path className="art-border-line" d="M24 26 H156 M24 194 H156" />
    </svg>
  );
}

function TarotScene({ cardId }: { cardId?: string }) {
  switch (cardId) {
    case "the-moon":
      return (
        <>
          <circle className="art-halo" cx="90" cy="62" r="48" />
          <path className="art-moon" d="M105 35 C80 45 73 77 92 96 C66 92 52 68 63 46 C72 27 92 23 105 35 Z" />
          <path className="art-line" d="M52 150 V105 M128 150 V105" />
          <path className="art-line" d="M43 108 L52 92 L61 108 M119 108 L128 92 L137 108" />
          <path className="art-star" d="M45 51 L49 61 L60 62 L51 68 L54 79 L45 72 L36 79 L39 68 L30 62 L41 61 Z" />
        </>
      );
    case "the-sun":
      return (
        <>
          <circle className="art-sun" cx="90" cy="64" r="34" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * Math.PI) / 6;
            const x1 = 90 + Math.cos(angle) * 43;
            const y1 = 64 + Math.sin(angle) * 43;
            const x2 = 90 + Math.cos(angle) * 58;
            const y2 = 64 + Math.sin(angle) * 58;
            return <line key={index} className="art-line" x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          <circle className="art-face" cx="90" cy="64" r="15" />
          <path className="art-line" d="M72 144 C84 124 96 124 108 144" />
          <path className="art-line" d="M62 150 H118" />
        </>
      );
    case "the-lovers":
      return (
        <>
          <circle className="art-halo" cx="90" cy="54" r="42" />
          <path className="art-wings" d="M90 60 C60 38 38 52 38 82 C58 78 74 86 90 112 C106 86 122 78 142 82 C142 52 120 38 90 60 Z" />
          <circle className="art-face" cx="68" cy="132" r="13" />
          <circle className="art-face" cx="112" cy="132" r="13" />
          <path className="art-body" d="M50 172 C55 146 82 146 86 172" />
          <path className="art-body" d="M94 172 C98 146 125 146 130 172" />
          <path className="art-line" d="M76 116 C86 126 94 126 104 116" />
        </>
      );
    case "the-star":
      return (
        <>
          <path className="art-star large" d="M90 28 L100 58 L132 58 L106 76 L116 108 L90 88 L64 108 L74 76 L48 58 L80 58 Z" />
          <path className="art-line" d="M68 138 C78 128 102 128 112 138" />
          <path className="art-water" d="M48 154 C66 144 76 164 94 154 C112 144 122 164 140 154" />
          <path className="art-water" d="M42 170 C64 158 78 180 100 168 C120 158 132 174 148 166" />
          <circle className="art-dot" cx="42" cy="42" r="4" />
          <circle className="art-dot" cx="138" cy="42" r="4" />
        </>
      );
    case "temperance":
      return (
        <>
          <circle className="art-halo" cx="90" cy="54" r="34" />
          <path className="art-wings" d="M76 82 C48 76 36 98 44 126 C60 116 72 111 82 116 M104 82 C132 76 144 98 136 126 C120 116 108 111 98 116" />
          <circle className="art-face" cx="90" cy="86" r="14" />
          <path className="art-body" d="M70 168 C72 118 108 118 110 168 Z" />
          <path className="art-cup" d="M58 116 L78 122 L74 136 L62 132 Z M102 136 L122 130 L118 116 L106 122 Z" />
          <path className="art-water" d="M78 126 C88 134 94 132 104 126" />
        </>
      );
    case "the-magician":
      return (
        <>
          <path className="art-infinity" d="M66 54 C78 38 102 70 114 54 C102 38 78 70 66 54 Z" />
          <circle className="art-face" cx="90" cy="85" r="14" />
          <path className="art-body" d="M70 170 C74 116 106 116 110 170 Z" />
          <path className="art-line" d="M90 70 V38 M90 100 V142" />
          <path className="art-line" d="M54 148 H126" />
          <circle className="art-dot" cx="58" cy="148" r="5" />
          <rect className="art-table" x="72" y="142" width="36" height="12" rx="4" />
        </>
      );
    case "the-empress":
      return (
        <>
          <path className="art-crown" d="M62 62 L74 42 L90 62 L106 42 L118 62 Z" />
          <circle className="art-face" cx="90" cy="86" r="16" />
          <path className="art-body" d="M58 174 C62 116 118 116 122 174 Z" />
          <path className="art-line" d="M70 132 C86 144 96 144 112 132" />
          <path className="art-star" d="M136 76 L141 88 L154 88 L143 96 L148 108 L136 100 L124 108 L129 96 L118 88 L131 88 Z" />
        </>
      );
    case "judgement":
      return (
        <>
          <circle className="art-halo" cx="90" cy="58" r="38" />
          <path className="art-wings" d="M90 58 C60 42 44 58 42 86 C62 80 76 90 90 110 C104 90 118 80 138 86 C136 58 120 42 90 58 Z" />
          <path className="art-trumpet" d="M78 88 L120 66 L128 82 L84 104 Z" />
          <path className="art-line" d="M50 162 V132 M90 166 V126 M130 162 V132" />
          <circle className="art-face" cx="50" cy="126" r="9" />
          <circle className="art-face" cx="90" cy="120" r="10" />
          <circle className="art-face" cx="130" cy="126" r="9" />
        </>
      );
    case "the-hierophant":
      return (
        <>
          <path className="art-crown" d="M62 72 H118 L108 44 H72 Z" />
          <circle className="art-face" cx="90" cy="88" r="13" />
          <path className="art-body" d="M62 174 C64 116 116 116 118 174 Z" />
          <path className="art-line" d="M90 104 V154 M76 126 H104" />
          <path className="art-line" d="M46 174 H134 M54 150 V104 M126 150 V104" />
        </>
      );
    case "the-fool":
    default:
      return (
        <>
          <circle className="art-sun" cx="132" cy="48" r="18" />
          <circle className="art-face" cx="82" cy="82" r="13" />
          <path className="art-body" d="M62 158 C66 108 102 108 106 158 Z" />
          <path className="art-line" d="M102 94 L132 74 M63 118 L40 104 M110 158 L134 178" />
          <path className="art-cliff" d="M80 182 L128 146 L150 190 Z" />
          <circle className="art-dot" cx="46" cy="102" r="6" />
        </>
      );
  }
}

function PlacePanel({ place, featured = false }: { place: PlaceRecommendation; featured?: boolean }) {
  return (
    <article className={featured ? "place-panel featured" : "place-panel"}>
      <div className="place-topline">
        <span className="status-pill">{place.statusLabel}</span>
        <span className="source-pill">{place.source === "google" ? "Google Places" : "示例数据"}</span>
      </div>
      <h2>{place.name}</h2>
      <p className="address">
        <MapPin size={16} />
        {place.address}
      </p>
      <div className="stats">
        <span>
          <Star size={15} />
          {place.rating ? place.rating.toFixed(1) : "N/A"}
        </span>
        <span>{place.userRatingCount ? `${place.userRatingCount} reviews` : "评价数未知"}</span>
        <span>{formatPrice(place.priceLevel)}</span>
      </div>
      <div className="place-actions">
        {place.mapsUri ? (
          <a className="link-button" href={place.mapsUri} target="_blank" rel="noreferrer">
            <MapPin size={17} />
            查看地图
          </a>
        ) : null}
        {place.websiteUri ? (
          <a className="ghost-button" href={place.websiteUri} target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            官网
          </a>
        ) : null}
      </div>
    </article>
  );
}

function formatPrice(price?: string) {
  if (!price) return "价格未知";
  const map: Record<string, string> = {
    PRICE_LEVEL_FREE: "免费",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };
  return map[price] ?? price;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
