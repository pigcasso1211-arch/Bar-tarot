import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ExternalLink, MapPin, RefreshCw, Sparkles, Shuffle, Star, Wine } from "lucide-react";
import type { RecommendResponse, PlaceRecommendation } from "../shared/places";
import { buildBarReading } from "../shared/reading";
import type { TarotCard } from "../shared/tarot";
import "./styles.css";

type DrawState = "idle" | "drawing" | "revealed" | "error";

function App() {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [selectedDeckIndex, setSelectedDeckIndex] = useState<number>();
  const [spreadSeed, setSpreadSeed] = useState(() => Math.random());
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [state, setState] = useState<DrawState>("idle");
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/tarot-cards")
      .then((response) => response.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]));
  }, []);

  useEffect(() => {
    if (state === "revealed" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state, result]);

  const currentCard = useMemo(() => {
    if (result?.card) return result.card;
    return cards.find((card) => card.id === selectedCardId) ?? cards[0];
  }, [cards, result, selectedCardId]);

  const spreadCards = useMemo(() => buildSpread(cards, selectedCardId, spreadSeed), [cards, selectedCardId, spreadSeed]);

  async function draw(cardId?: string, deckIndex?: number) {
    setSelectedDeckIndex(deckIndex);
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
    const nextSeed = Math.random();
    setSpreadSeed(nextSeed);
    const cardId = cards[Math.floor(Math.random() * Math.max(cards.length, 1))]?.id;
    const deckIndex = Math.floor(Math.random() * Math.max(spreadCards.length, 1));
    void draw(cardId, deckIndex);
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
          {cards.length > 0 ? <p className="deck-count">{cards.length} 张完整塔罗牌 · 每晚不重样</p> : null}
        </div>

        <div className="spread-panel">
          <div className="spread-heading">
            <p>从牌阵里选一张</p>
            <span>{result ? result.card.name : "让今晚自己靠近你"}</span>
          </div>
          <div className={`tarot-spread ${state === "drawing" ? "is-drawing" : ""} ${result ? "has-selection" : ""}`}>
            {spreadCards.map((card, index) => {
              const isSelected = selectedDeckIndex === index;
              return (
                <button
                  className={`spread-card ${isSelected ? "is-selected" : ""}`}
                  type="button"
                  key={`${card?.id ?? "empty"}-${index}`}
                  onClick={() => draw(card?.id, index)}
                  disabled={state === "drawing"}
                  aria-label={card ? `抽第 ${index + 1} 张牌` : "等待牌组"}
                >
                  <div className="spread-card-inner">
                    <CardBack compact label={isSelected && state === "drawing" ? "Draw" : ""} />
                    {isSelected && result?.card ? <CardFront card={result.card} compact /> : null}
                  </div>
                </button>
              );
            })}
          </div>
          {currentCard ? (
            <div className="selected-card-preview">
              <div className={`preview-card ${result ? "is-visible" : ""}`}>
                <CardFront card={result?.card ?? currentCard} />
              </div>
            </div>
          ) : null}
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
        <section className="result-layout" ref={resultRef} aria-live="polite">
          <article className="reading-panel">
            <p className="eyebrow">{result.card.name}</p>
            <h2>{result.card.title}</h2>
            <p>{result.card.reading}</p>
            <p className="invitation">{result.card.invitation}</p>
            {result.notice ? <span className="notice">{result.notice}</span> : null}
          </article>

          <PlacePanel place={result.place} card={result.card} featured />

          <section className="alternatives" aria-label="备选酒吧">
            <div className="section-heading">
              <h2>换一家也可以</h2>
              <span>{result.source === "google" ? "Live Places" : "Mock data"}</span>
            </div>
            <div className="alternative-list">
              {result.alternatives.map((place) => (
                <button key={place.id} className="alternative-item" type="button" onClick={() => chooseAlternative(place)}>
                  <span>{place.name}</span>
                  <small>
                    {place.rating ? `${place.rating.toFixed(1)} ★` : "—"} · {place.statusLabel}
                  </small>
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

function buildSpread(cards: TarotCard[], selectedCardId: string | undefined, seed: number) {
  const selected = cards.find((card) => card.id === selectedCardId);
  const pool = cards.filter((card) => card.id !== selectedCardId);
  const spread = seededShuffle(pool, seed).slice(0, 12);

  if (selected) {
    const selectedIndex = Math.min(5, spread.length);
    spread.splice(selectedIndex, 0, selected);
  }

  return spread.slice(0, 12);
}

function seededShuffle(cards: TarotCard[], seed: number) {
  const shuffled = [...cards];
  let state = Math.max(1, Math.floor(seed * 2147483647));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 48271) % 2147483647;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function CardBack({ compact = false, label = "Draw" }: { compact?: boolean; label?: string }) {
  return (
    <div className={compact ? "card-face card-back compact" : "card-face card-back"}>
      <div className="card-back-frame" aria-hidden="true">
        <span className="card-back-corner tl" />
        <span className="card-back-corner tr" />
        <span className="card-back-corner bl" />
        <span className="card-back-corner br" />
        <span className="card-back-emblem">
          <Sparkles size={compact ? 18 : 28} />
        </span>
      </div>
      {label ? <span className="card-back-label">{label}</span> : null}
    </div>
  );
}

function CardFront({ card, compact = false }: { card: TarotCard; compact?: boolean }) {
  return (
    <div
      className={compact ? "card-face card-front compact" : "card-face card-front"}
      style={{ "--card-a": card.palette[0], "--card-b": card.palette[1] } as React.CSSProperties}
    >
      <span className="card-corner tl" aria-hidden="true" />
      <span className="card-corner tr" aria-hidden="true" />
      <span className="card-corner bl" aria-hidden="true" />
      <span className="card-corner br" aria-hidden="true" />
      <small>{card.arcana}</small>
      <TarotIllustration cardId={card.id} />
      <strong>{card.name}</strong>
      <span>{card.mood}</span>
    </div>
  );
}

function TarotIllustration({ cardId }: { cardId?: string }) {
  const uid = cardId ?? "default";
  return (
    <svg className="tarot-art" viewBox="0 0 180 220" role="img" aria-label={cardId ?? "tarot illustration"}>
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="34%" r="52%">
          <stop offset="0%" stopColor="#fff6c7" />
          <stop offset="100%" stopColor="#e6c76f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`robe-${uid}`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f8f4e8" />
          <stop offset="100%" stopColor="#d9a441" />
        </linearGradient>
        <linearGradient id={`sky-${uid}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--card-a), #fff 22%)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--card-b), #fff 8%)" />
        </linearGradient>
      </defs>
      <rect className="art-frame-outer" x="10" y="10" width="160" height="200" rx="18" />
      <rect className="art-sky" x="18" y="18" width="144" height="184" rx="14" fill={`url(#sky-${uid})`} />
      <TarotScene cardId={cardId} uid={uid} />
      <path className="art-ground" d="M28 176 C58 164 80 190 112 176 C138 164 148 176 158 184 L158 196 L28 196 Z" />
      <rect className="art-frame-inner" x="22" y="22" width="136" height="176" rx="12" />
    </svg>
  );
}

function TarotScene({ cardId, uid }: { cardId?: string; uid: string }) {
  const halo = `url(#halo-${uid})`;
  const robe = `url(#robe-${uid})`;
  const minorSuit = getMinorSuit(cardId);

  if (minorSuit) {
    return <MinorArcanaScene suit={minorSuit} />;
  }

  switch (cardId) {
    case "the-moon":
      return (
        <>
          <circle className="art-halo" cx="90" cy="62" r="48" fill={halo} />
          <path className="art-moon" d="M105 35 C80 45 73 77 92 96 C66 92 52 68 63 46 C72 27 92 23 105 35 Z" />
          <path className="art-line" d="M52 150 V105 M128 150 V105" />
          <path className="art-line" d="M43 108 L52 92 L61 108 M119 108 L128 92 L137 108" />
          <path className="art-star" d="M45 51 L49 61 L60 62 L51 68 L54 79 L45 72 L36 79 L39 68 L30 62 L41 61 Z" />
          <path className="art-star small" d="M130 48 L132 54 L138 54 L133 58 L135 64 L130 60 L125 64 L127 58 L122 54 L128 54 Z" />
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
          <circle className="art-halo" cx="90" cy="54" r="42" fill={halo} />
          <path className="art-wings" d="M90 60 C60 38 38 52 38 82 C58 78 74 86 90 112 C106 86 122 78 142 82 C142 52 120 38 90 60 Z" fill={robe} />
          <circle className="art-face" cx="68" cy="132" r="13" />
          <circle className="art-face" cx="112" cy="132" r="13" />
          <path className="art-body" d="M50 172 C55 146 82 146 86 172" fill={robe} />
          <path className="art-body" d="M94 172 C98 146 125 146 130 172" fill={robe} />
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
          <circle className="art-halo" cx="90" cy="54" r="34" fill={halo} />
          <path className="art-wings" d="M76 82 C48 76 36 98 44 126 C60 116 72 111 82 116 M104 82 C132 76 144 98 136 126 C120 116 108 111 98 116" fill={robe} />
          <circle className="art-face" cx="90" cy="86" r="14" />
          <path className="art-body" d="M70 168 C72 118 108 118 110 168 Z" fill={robe} />
          <path className="art-cup" d="M58 116 L78 122 L74 136 L62 132 Z M102 136 L122 130 L118 116 L106 122 Z" />
          <path className="art-water" d="M78 126 C88 134 94 132 104 126" />
        </>
      );
    case "the-magician":
      return (
        <>
          <path className="art-infinity" d="M66 54 C78 38 102 70 114 54 C102 38 78 70 66 54 Z" />
          <circle className="art-face" cx="90" cy="85" r="14" />
          <path className="art-body" d="M70 170 C74 116 106 116 110 170 Z" fill={robe} />
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
          <path className="art-body" d="M58 174 C62 116 118 116 122 174 Z" fill={robe} />
          <path className="art-line" d="M70 132 C86 144 96 144 112 132" />
          <path className="art-star" d="M136 76 L141 88 L154 88 L143 96 L148 108 L136 100 L124 108 L129 96 L118 88 L131 88 Z" />
        </>
      );
    case "judgement":
      return (
        <>
          <circle className="art-halo" cx="90" cy="58" r="38" fill={halo} />
          <path className="art-wings" d="M90 58 C60 42 44 58 42 86 C62 80 76 90 90 110 C104 90 118 80 138 86 C136 58 120 42 90 58 Z" fill={robe} />
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
          <path className="art-body" d="M62 174 C64 116 116 116 118 174 Z" fill={robe} />
          <path className="art-line" d="M90 104 V154 M76 126 H104" />
          <path className="art-line" d="M46 174 H134 M54 150 V104 M126 150 V104" />
        </>
      );
    case "the-hermit":
      return (
        <>
          <circle className="art-halo" cx="90" cy="50" r="30" fill={halo} />
          <circle className="art-lantern" cx="90" cy="72" r="14" />
          <path className="art-line" d="M90 86 V160" />
          <circle className="art-face" cx="90" cy="108" r="12" />
          <path className="art-body" d="M72 170 C74 130 106 130 108 170 Z" fill={robe} />
          <path className="art-star small" d="M48 44 L50 50 L56 50 L51 54 L53 60 L48 56 L43 60 L45 54 L40 50 L46 50 Z" />
        </>
      );
    case "wheel-of-fortune":
      return (
        <>
          <circle className="art-wheel" cx="90" cy="90" r="52" />
          <circle className="art-wheel-inner" cx="90" cy="90" r="18" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                className="art-line thin"
                x1={90 + Math.cos(angle) * 18}
                y1={90 + Math.sin(angle) * 18}
                x2={90 + Math.cos(angle) * 50}
                y2={90 + Math.sin(angle) * 50}
              />
            );
          })}
          <path className="art-star" d="M90 34 L94 46 L106 46 L96 54 L100 66 L90 58 L80 66 L84 54 L74 46 L86 46 Z" />
        </>
      );
    case "strength":
      return (
        <>
          <circle className="art-halo" cx="90" cy="56" r="36" fill={halo} />
          <path className="art-lion" d="M52 148 C48 120 62 100 90 96 C118 100 132 120 128 148 C120 138 108 132 90 134 C72 132 60 138 52 148 Z" />
          <circle className="art-face" cx="90" cy="72" r="14" />
          <path className="art-line" d="M90 86 V130" />
          <path className="art-infinity" d="M78 48 C84 40 96 56 102 48 C96 40 84 56 78 48 Z" />
        </>
      );
    case "the-chariot":
      return (
        <>
          <rect className="art-chariot" x="48" y="108" width="84" height="36" rx="6" />
          <circle className="art-dot" cx="62" cy="152" r="10" />
          <circle className="art-dot" cx="118" cy="152" r="10" />
          <path className="art-line" d="M90 60 V108" />
          <circle className="art-face" cx="90" cy="52" r="12" />
          <path className="art-star" d="M90 28 L93 36 L102 36 L95 42 L98 50 L90 44 L82 50 L85 42 L78 36 L87 36 Z" />
        </>
      );
    case "the-devil":
      return (
        <>
          <path className="art-horns" d="M72 48 L80 28 L90 48 L100 28 L108 48 Z" />
          <circle className="art-face" cx="90" cy="78" r="16" />
          <path className="art-body" d="M64 170 C66 116 114 116 116 170 Z" fill={robe} />
          <path className="art-chain" d="M58 120 C70 130 110 130 122 120 M58 136 C70 146 110 146 122 136" />
          <rect className="art-pedestal" x="54" y="168" width="72" height="10" rx="3" />
        </>
      );
    case "the-tower":
      return (
        <>
          <rect className="art-tower" x="68" y="56" width="44" height="110" rx="4" />
          <path className="art-lightning" d="M96 34 L86 72 L94 72 L82 108" />
          <path className="art-debris" d="M52 166 L68 148 M128 166 L112 148" />
          <circle className="art-dot" cx="52" cy="48" r="5" />
          <circle className="art-dot" cx="128" cy="44" r="4" />
        </>
      );
    case "death":
      return (
        <>
          <circle className="art-halo" cx="90" cy="48" r="28" fill={halo} />
          <path className="art-flag" d="M90 60 V160 M90 60 L130 76 L90 92 Z" />
          <circle className="art-face" cx="90" cy="118" r="11" />
          <path className="art-line" d="M50 170 H130" />
          <path className="art-star small" d="M48 80 L50 86 L56 86 L51 90 L53 96 L48 92 L43 96 L45 90 L40 86 L46 86 Z" />
        </>
      );
    case "the-world":
      return (
        <>
          <ellipse className="art-wreath" cx="90" cy="96" rx="58" ry="62" />
          <circle className="art-face" cx="90" cy="96" r="18" />
          <path className="art-line" d="M90 78 V114 M72 96 H108" />
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            return (
              <circle
                key={i}
                className="art-dot"
                cx={90 + Math.cos(angle) * 48}
                cy={96 + Math.sin(angle) * 48}
                r="5"
              />
            );
          })}
        </>
      );
    case "the-fool":
    default:
      return (
        <>
          <circle className="art-sun" cx="132" cy="48" r="18" />
          <circle className="art-face" cx="82" cy="82" r="13" />
          <path className="art-body" d="M62 158 C66 108 102 108 106 158 Z" fill={robe} />
          <path className="art-line" d="M102 94 L132 74 M63 118 L40 104 M110 158 L134 178" />
          <path className="art-cliff" d="M80 182 L128 146 L150 190 Z" />
          <circle className="art-dot" cx="46" cy="102" r="6" />
        </>
      );
  }
}

function getMinorSuit(cardId?: string) {
  if (!cardId) return undefined;
  if (cardId.endsWith("-of-wands")) return "wands";
  if (cardId.endsWith("-of-cups")) return "cups";
  if (cardId.endsWith("-of-swords")) return "swords";
  if (cardId.endsWith("-of-pentacles")) return "pentacles";
  return undefined;
}

function MinorArcanaScene({ suit }: { suit: "wands" | "cups" | "swords" | "pentacles" }) {
  switch (suit) {
    case "wands":
      return (
        <>
          <path className="art-wand" d="M90 42 V166" />
          <path className="art-flame" d="M90 36 C76 56 84 70 90 78 C96 68 108 56 90 36 Z" />
          <path className="art-flame small" d="M60 82 C50 96 56 108 62 114 C66 104 74 94 60 82 Z" />
          <path className="art-flame small" d="M120 82 C106 94 114 106 118 114 C126 106 130 94 120 82 Z" />
          <path className="art-line" d="M56 166 H124" />
        </>
      );
    case "cups":
      return (
        <>
          <path className="art-cup-large" d="M56 60 H124 C122 104 108 126 90 126 C72 126 58 104 56 60 Z" />
          <path className="art-water" d="M62 82 C74 74 84 92 96 82 C108 74 116 88 124 80" />
          <path className="art-line" d="M90 126 V164 M66 164 H114" />
          <circle className="art-dot" cx="62" cy="44" r="5" />
          <circle className="art-dot" cx="118" cy="44" r="5" />
        </>
      );
    case "swords":
      return (
        <>
          <path className="art-sword" d="M90 36 L102 132 H78 Z" />
          <path className="art-line" d="M58 132 H122 M78 154 H102 M90 132 V176" />
          <path className="art-star small" d="M45 60 L48 68 L56 68 L50 73 L52 82 L45 76 L38 82 L40 73 L34 68 L42 68 Z" />
          <path className="art-star small" d="M135 60 L138 68 L146 68 L140 73 L142 82 L135 76 L128 82 L130 73 L124 68 L132 68 Z" />
        </>
      );
    case "pentacles":
      return (
        <>
          <circle className="art-pentacle" cx="90" cy="92" r="52" />
          <path className="art-line" d="M90 44 L104 118 L52 74 H128 L76 118 Z" />
          <path className="art-line" d="M58 164 H122" />
          <circle className="art-dot" cx="90" cy="164" r="7" />
        </>
      );
  }
}

function PlacePanel({ place, card, featured = false }: { place: PlaceRecommendation; card: TarotCard; featured?: boolean }) {
  const reading = useMemo(() => buildBarReading(card, place), [card, place]);

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

      <div className="insight-grid">
        <div className="insight-card">
          <span className="insight-label">氛围解读</span>
          <p>{reading.atmosphere}</p>
        </div>
        <div className="insight-card highlight">
          <span className="insight-label">
            <Wine size={14} />
            牌面荐酒
          </span>
          <strong className="drink-name">{reading.drink.name}</strong>
          <p>{reading.drink.note}</p>
        </div>
      </div>

      <div className="stats">
        <span className="stat-rating">
          <Star size={15} />
          {place.rating ? place.rating.toFixed(1) : "N/A"}
        </span>
        <span title={reading.ratingInsight}>{place.userRatingCount ? `${place.userRatingCount} reviews` : "评价数未知"}</span>
        <span className="stat-percapita">{reading.priceDisplay}</span>
      </div>
      <p className="rating-insight">{reading.ratingInsight}</p>

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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
