import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ExternalLink, MapPin, RefreshCw, Search, Sparkles, Shuffle, Star, Wine } from "lucide-react";
import type { DrinkRecommendResponse, RecommendResponse, PlaceRecommendation } from "../shared/places";
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
  const [barQuery, setBarQuery] = useState("");
  const [barSuggestions, setBarSuggestions] = useState<PlaceRecommendation[]>([]);
  const [selectedBarSuggestion, setSelectedBarSuggestion] = useState<PlaceRecommendation | null>(null);
  const [drinkResult, setDrinkResult] = useState<DrinkRecommendResponse | null>(null);
  const [drinkState, setDrinkState] = useState<DrawState>("idle");
  const [drinkError, setDrinkError] = useState("");
  const [drinkSpreadSeed, setDrinkSpreadSeed] = useState(() => Math.random());
  const [selectedDrinkCardId, setSelectedDrinkCardId] = useState<string>();
  const [selectedDrinkDeckIndex, setSelectedDrinkDeckIndex] = useState<number>();
  const [activeDrinkBarName, setActiveDrinkBarName] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const drinkSpreadRef = useRef<HTMLDivElement>(null);
  const drinkOracleRef = useRef<HTMLElement>(null);
  const drinkDrawAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tarot-cards")
      .then((response) => response.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]));
  }, []);

  useEffect(() => {
    const query = barQuery.trim();
    if (query.length < 2) {
      setBarSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/bar-suggestions?city=Singapore&query=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => setBarSuggestions(data.places ?? []))
        .catch(() => {
          if (!controller.signal.aborted) setBarSuggestions([]);
        });
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [barQuery]);

  const spreadCards = useMemo(() => buildSpread(cards, selectedCardId, spreadSeed), [cards, selectedCardId, spreadSeed]);
  const drinkSpreadCards = useMemo(
    () => buildSpread(cards, selectedDrinkCardId, drinkSpreadSeed),
    [cards, selectedDrinkCardId, drinkSpreadSeed]
  );

  async function draw(cardId?: string, deckIndex?: number) {
    setSelectedDeckIndex(deckIndex);
    setState("drawing");
    setError("");
    setResult(null);
    resetDrinkDraw();

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
      requestAnimationFrame(() => scrollSpreadCardIntoFocus(spreadRef, deckIndex));
    } catch {
      setError("今晚的牌面被云遮住了。请稍后再抽一次。");
      setState("error");
    }
  }

  function redraw() {
    const nextSeed = Math.random();
    const nextSpread = buildSpread(cards, undefined, nextSeed);
    const deckIndex = Math.floor(Math.random() * Math.max(nextSpread.length, 1));
    const cardId = nextSpread[deckIndex]?.id;

    setSpreadSeed(nextSeed);
    setSelectedCardId(undefined);
    requestAnimationFrame(() => {
      scrollSpreadCardIntoFocus(spreadRef, deckIndex);
      void draw(cardId, deckIndex);
    });
  }

  function scrollSpreadCardIntoFocus(ref: React.RefObject<HTMLDivElement | null>, deckIndex?: number) {
    const spread = ref.current;
    if (!spread || deckIndex === undefined) return;

    const card = spread.children.item(deckIndex) as HTMLElement | null;
    if (!card) return;

    const left = card.offsetLeft - spread.clientWidth / 2 + card.clientWidth / 2;
    spread.scrollTo({ left, behavior: "smooth" });
  }

  function chooseAlternative(place: PlaceRecommendation) {
    if (!result) return;
    resetDrinkDraw();
    setResult({
      ...result,
      place,
      alternatives: [result.place, ...result.alternatives.filter((item) => item.id !== place.id)].slice(0, 3)
    });
  }

  function resetDrinkDraw() {
    setDrinkResult(null);
    setDrinkError("");
    setDrinkState("idle");
    setSelectedDrinkCardId(undefined);
    setSelectedDrinkDeckIndex(undefined);
    setActiveDrinkBarName("");
    setSelectedBarSuggestion(null);
  }

  function focusDrinkOracle(target: "section" | "cards" = "section") {
    const element = target === "cards" ? drinkDrawAreaRef.current ?? drinkOracleRef.current : drinkOracleRef.current;
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusDrinkCardsSoon() {
    focusDrinkOracle("section");
    window.requestAnimationFrame(() => focusDrinkOracle("cards"));
    window.setTimeout(() => focusDrinkOracle("cards"), 180);
  }

  function chooseBarSuggestion(place: PlaceRecommendation) {
    setSelectedBarSuggestion(place);
    setBarQuery(place.name);
    setActiveDrinkBarName(place.name);
    setDrinkError("");
  }

  async function requestDrinkForBar(barName: string, cardId?: string) {
    const response = await fetch("/api/drink-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: "Singapore", barName, cardId })
    });

    if (!response.ok) throw new Error("drink recommend failed");
    return (await response.json()) as DrinkRecommendResponse;
  }

  async function drawDrinkForTypedBar(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    focusDrinkOracle();
    await drawDrinkForBar(selectedBarSuggestion?.name || barQuery);
  }

  async function drawDrinkForBar(barNameInput: string, deckIndexInput?: number, cardIdInput?: string) {
    const barName = barNameInput.trim();
    if (!barName) {
      setDrinkError("先输入一家 bar 的名字，或者先抽出一家 bar。");
      focusDrinkOracle();
      return;
    }

    focusDrinkCardsSoon();

    const nextSeed = deckIndexInput === undefined ? Math.random() : drinkSpreadSeed;
    const nextSpread = deckIndexInput === undefined ? buildSpread(cards, undefined, nextSeed) : drinkSpreadCards;
    const deckIndex = deckIndexInput ?? Math.floor(Math.random() * Math.max(nextSpread.length, 1));
    const cardId = cardIdInput ?? nextSpread[deckIndex]?.id;

    setDrinkSpreadSeed(nextSeed);
    setActiveDrinkBarName(barName);
    setSelectedDrinkDeckIndex(deckIndex);
    setSelectedDrinkCardId(undefined);
    setDrinkState("drawing");
    setDrinkError("");
    setDrinkResult(null);

    requestAnimationFrame(() => scrollSpreadCardIntoFocus(drinkSpreadRef, deckIndex));

    try {
      await wait(620);
      const data = await requestDrinkForBar(barName, cardId);
      setSelectedDrinkCardId(data.card.id);
      setDrinkResult(data);
      setDrinkState("revealed");
      requestAnimationFrame(() => scrollSpreadCardIntoFocus(drinkSpreadRef, deckIndex));
    } catch {
      setDrinkError("这家 bar 的酒单被夜色挡住了。换个名字或稍后再试。");
      setDrinkState("error");
    }
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
            <p>滑动牌面，选一张</p>
            <span>{result ? result.card.name : "整副牌已经洗好"}</span>
          </div>
          <div
            className={`tarot-spread ${state === "drawing" ? "is-drawing" : ""} ${result ? "has-selection" : ""}`}
            ref={spreadRef}
          >
            {spreadCards.map((card, index) => {
              const isSelected = selectedDeckIndex === index;
              return (
                <button
                  className={`spread-card ${isSelected ? "is-selected" : ""} ${isSelected && result ? "is-flipped" : ""}`}
                  type="button"
                  key={`${card?.id ?? "empty"}-${index}`}
                  onClick={() => draw(card?.id, index)}
                  disabled={state === "drawing"}
                  aria-label={card ? `抽第 ${index + 1} 张牌` : "等待牌组"}
                >
                  <div className="spread-card-inner">
                    <CardBack compact label={isSelected && state === "drawing" ? "Draw" : ""} />
                    {isSelected && result?.card ? <CardFront card={result.card} /> : null}
                  </div>
                </button>
              );
            })}
          </div>
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

          <PlacePanel
            place={result.place}
            card={result.card}
            featured
            onDrawDrink={() => {
              setBarQuery(result.place.name);
              setSelectedBarSuggestion(result.place);
              void drawDrinkForBar(result.place.name);
            }}
            drinkState={drinkState}
          />

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

      <section className="drink-oracle" aria-label="按酒吧抽酒单推荐" ref={drinkOracleRef}>
        <div className="drink-oracle-copy">
          <p className="eyebrow">Menu Tarot</p>
          <h2>抽一杯酒</h2>
          <p>用刚抽到的酒吧，或者输入你已经选好的 bar。再抽一张牌，让塔罗决定今晚该在酒单上找哪一杯。</p>
        </div>

        <form className="bar-search" onSubmit={drawDrinkForTypedBar}>
          <label htmlFor="bar-search-input">Bar name</label>
          <div className="bar-search-row">
            <div className="bar-input-wrap">
              <input
                id="bar-search-input"
                value={barQuery}
                onChange={(event) => {
                  setBarQuery(event.target.value);
                  setSelectedBarSuggestion(null);
                }}
                placeholder="例如 Atlas, Manhattan, Jigger & Pony"
                autoComplete="off"
              />
              {barSuggestions.length > 0 ? (
                <div className="bar-autocomplete" aria-label="可能的酒吧">
                  {barSuggestions.map((place) => {
                    const isPicked = selectedBarSuggestion?.id === place.id || barQuery === place.name;
                    return (
                      <button
                        className={isPicked ? "bar-suggestion is-picked" : "bar-suggestion"}
                        type="button"
                        key={place.id}
                        onClick={() => chooseBarSuggestion(place)}
                      >
                        <span>{place.name}</span>
                        <small>{place.rating ? `${place.rating.toFixed(1)} ★` : place.statusLabel}</small>
                        {isPicked ? <Check size={16} /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <button type="submit" disabled={drinkState === "drawing"}>
              {drinkState === "drawing" ? <RefreshCw className="spin" size={17} /> : <Search size={17} />}
              {drinkState === "drawing" ? "正在洗牌" : "抽一杯酒"}
            </button>
          </div>
        </form>

        <div className="drink-spread-shell" ref={drinkDrawAreaRef}>
          <div className="spread-heading">
            <p>滑动牌面，抽一杯</p>
            <span>{drinkResult ? drinkResult.card.name : activeDrinkBarName || "先输入或选定一家 bar"}</span>
          </div>
          <div
            className={`tarot-spread drink-spread ${drinkState === "drawing" ? "is-drawing" : ""} ${
              drinkResult ? "has-selection" : ""
            }`}
            ref={drinkSpreadRef}
          >
            {drinkSpreadCards.map((card, index) => {
              const isSelected = selectedDrinkDeckIndex === index;
              return (
                <button
                  className={`spread-card ${isSelected ? "is-selected" : ""} ${
                    isSelected && drinkResult ? "is-flipped" : ""
                  }`}
                  type="button"
                  key={`drink-${card?.id ?? "empty"}-${index}`}
                  onClick={() => drawDrinkForBar(barQuery || result?.place.name || "", index, card?.id)}
                  disabled={drinkState === "drawing"}
                  aria-label={card ? `抽第 ${index + 1} 张酒牌` : "等待牌组"}
                >
                  <div className="spread-card-inner">
                    <CardBack compact label={isSelected && drinkState === "drawing" ? "Drink" : ""} />
                    {isSelected && drinkResult?.card ? <CardFront card={drinkResult.card} /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {drinkError ? <p className="drink-error">{drinkError}</p> : null}
        {drinkResult ? <DrinkResultPanel result={drinkResult} label="抽一杯酒" /> : null}
      </section>
    </main>
  );
}

function buildSpread(cards: TarotCard[], _selectedCardId: string | undefined, seed: number) {
  return seededShuffle(cards, seed);
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

function CardFront({ card, compact = false, staticFace = false }: { card: TarotCard; compact?: boolean; staticFace?: boolean }) {
  const className = ["card-face", "card-front", compact ? "compact" : "", staticFace ? "static" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
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
        <radialGradient id={`neon-${uid}`} cx="50%" cy="42%" r="56%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.56" />
          <stop offset="48%" stopColor="var(--card-b)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--card-a)" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      <rect className="art-frame-outer" x="10" y="10" width="160" height="200" rx="18" />
      <rect className="art-sky" x="18" y="18" width="144" height="184" rx="14" fill={`url(#sky-${uid})`} />
      <circle className="art-neon-glow" cx="90" cy="92" r="72" fill={`url(#neon-${uid})`} />
      <path className="art-orbit" d="M34 96 C54 42 126 42 146 96 C126 150 54 150 34 96 Z" />
      <path className="art-orbit thin" d="M48 100 C64 66 116 66 132 100 C112 132 68 132 48 100 Z" />
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
    return <MinorArcanaScene cardId={cardId} suit={minorSuit} />;
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

type MinorSuitName = "wands" | "cups" | "swords" | "pentacles";
type MinorRankName =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "page"
  | "knight"
  | "queen"
  | "king";

function getMinorSuit(cardId?: string): MinorSuitName | undefined {
  if (!cardId) return undefined;
  if (cardId.endsWith("-of-wands")) return "wands";
  if (cardId.endsWith("-of-cups")) return "cups";
  if (cardId.endsWith("-of-swords")) return "swords";
  if (cardId.endsWith("-of-pentacles")) return "pentacles";
  return undefined;
}

function getMinorRank(cardId?: string): MinorRankName | undefined {
  const rank = cardId?.split("-of-")[0];
  if (
    rank === "ace" ||
    rank === "two" ||
    rank === "three" ||
    rank === "four" ||
    rank === "five" ||
    rank === "six" ||
    rank === "seven" ||
    rank === "eight" ||
    rank === "nine" ||
    rank === "ten" ||
    rank === "page" ||
    rank === "knight" ||
    rank === "queen" ||
    rank === "king"
  ) {
    return rank;
  }
  return undefined;
}

const rankCounts: Partial<Record<MinorRankName, number>> = {
  ace: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

const pipLayouts: Record<number, Array<[number, number]>> = {
  1: [[90, 96]],
  2: [
    [74, 72],
    [106, 124]
  ],
  3: [
    [90, 58],
    [66, 128],
    [114, 128]
  ],
  4: [
    [62, 70],
    [118, 70],
    [62, 132],
    [118, 132]
  ],
  5: [
    [62, 66],
    [118, 66],
    [90, 100],
    [62, 136],
    [118, 136]
  ],
  6: [
    [60, 60],
    [90, 60],
    [120, 60],
    [60, 136],
    [90, 136],
    [120, 136]
  ],
  7: [
    [90, 46],
    [58, 80],
    [90, 82],
    [122, 80],
    [58, 136],
    [90, 140],
    [122, 136]
  ],
  8: [
    [58, 52],
    [90, 52],
    [122, 52],
    [72, 96],
    [108, 96],
    [58, 142],
    [90, 142],
    [122, 142]
  ],
  9: [
    [58, 50],
    [90, 50],
    [122, 50],
    [58, 96],
    [90, 96],
    [122, 96],
    [58, 142],
    [90, 142],
    [122, 142]
  ],
  10: [
    [54, 48],
    [82, 48],
    [110, 48],
    [136, 48],
    [68, 92],
    [112, 92],
    [54, 140],
    [82, 140],
    [110, 140],
    [136, 140]
  ]
};

function MinorArcanaScene({ cardId, suit }: { cardId?: string; suit: MinorSuitName }) {
  const rank = getMinorRank(cardId);
  const count = rank ? rankCounts[rank] : undefined;

  if (count) {
    const positions = pipLayouts[count];
    return (
      <>
        <circle className="art-minor-sigil" cx="90" cy="96" r="54" />
        <path className="art-orbit bright" d="M42 96 C60 58 120 58 138 96 C120 134 60 134 42 96 Z" />
        {rank === "seven" ? (
          <>
            <path className="art-dream-cloud" d="M42 56 C60 34 82 46 90 64 C102 42 128 40 142 62 C128 52 110 62 108 82 C92 68 72 70 62 90 C58 72 50 62 42 56 Z" />
            <circle className="art-dot glow" cx="90" cy="38" r="4" />
            <circle className="art-dot glow" cx="136" cy="106" r="3" />
          </>
        ) : null}
        {positions.map(([x, y], index) => (
          <SuitPip key={`${suit}-${rank}-${index}`} suit={suit} x={x} y={y} small={count > 7} />
        ))}
      </>
    );
  }

  return <CourtScene rank={rank ?? "page"} suit={suit} />;
}

function SuitPip({ suit, x, y, small = false }: { suit: MinorSuitName; x: number; y: number; small?: boolean }) {
  const scale = small ? 0.78 : 0.92;
  switch (suit) {
    case "wands":
      return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <path className="art-wand pip" d="M0 -20 V18" />
          <path className="art-flame pip" d="M0 -28 C-9 -14 -4 -7 0 -2 C5 -10 10 -18 0 -28 Z" />
        </g>
      );
    case "cups":
      return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <path className="art-cup-large pip" d="M-16 -18 H16 C15 4 9 14 0 14 C-9 14 -15 4 -16 -18 Z" />
          <path className="art-water pip" d="M-12 -7 C-6 -12 -1 -4 5 -8 C10 -12 14 -5 17 -9" />
          <path className="art-line pip-thin" d="M0 14 V28 M-12 28 H12" />
        </g>
      );
    case "swords":
      return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <path className="art-sword pip" d="M0 -28 L7 8 H-7 Z" />
          <path className="art-line pip-thin" d="M-14 8 H14 M-6 20 H6 M0 8 V30" />
        </g>
      );
    case "pentacles":
      return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <circle className="art-pentacle pip" cx="0" cy="0" r="18" />
          <path className="art-line pip-thin" d="M0 -15 L5 7 L-14 -6 H14 L-5 7 Z" />
        </g>
      );
  }
}

function CourtScene({ rank, suit }: { rank: MinorRankName; suit: MinorSuitName }) {
  const crown =
    rank === "king"
      ? "M58 66 L70 42 L90 64 L110 42 L122 66 Z"
      : rank === "queen"
        ? "M62 68 L76 48 L90 64 L104 48 L118 68 Z"
        : rank === "knight"
          ? "M64 72 L90 46 L116 72 Z"
          : "M72 70 L90 52 L108 70 Z";

  return (
    <>
      <circle className="art-minor-sigil" cx="90" cy="96" r="56" />
      <path className="art-crown neon" d={crown} />
      <circle className="art-face" cx="90" cy="88" r="14" />
      <path className="art-body court" d="M58 170 C62 118 118 118 122 170 Z" />
      <SuitPip suit={suit} x={90} y={132} />
      {rank === "knight" ? <path className="art-line bright" d="M52 154 C74 136 104 136 130 156" /> : null}
      {rank === "page" ? <circle className="art-dot glow" cx="128" cy="64" r="5" /> : null}
    </>
  );
}

function DrinkResultPanel({ result, label }: { result: DrinkRecommendResponse; label: string }) {
  return (
    <article className="drink-result">
      <div className="drink-result-card">
        <CocktailArt drinkName={result.drink.name} mood={result.card.mood} />
      </div>
      <div>
        <p className="eyebrow">{label}</p>
        <h3>{result.bar.name}</h3>
        <strong className="drink-name">{result.drink.name}</strong>
        <p>{result.drink.note}</p>
        <p className="order-hint">{result.drink.orderHint}</p>
        <div className="drink-result-actions">
          <span>{result.source === "google" ? "Google Places 已匹配" : "按店名生成"}</span>
          {result.bar.mapsUri ? (
            <a href={result.bar.mapsUri} target="_blank" rel="noreferrer">
              <MapPin size={15} />
              地图确认
            </a>
          ) : null}
        </div>
        {result.notice ? <small>{result.notice}</small> : null}
      </div>
    </article>
  );
}

function CocktailArt({ drinkName, mood }: { drinkName: string; mood: string }) {
  const profile = getCocktailProfile(drinkName, mood);

  return (
    <svg className="cocktail-art" viewBox="0 0 180 260" role="img" aria-label={`${drinkName} illustration`}>
      <defs>
        <linearGradient id={`drink-${profile.id}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={profile.liquidTop} />
          <stop offset="100%" stopColor={profile.liquidBottom} />
        </linearGradient>
        <radialGradient id={`glow-${profile.id}`} cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor={profile.accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={profile.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect className="cocktail-bg" x="0" y="0" width="180" height="260" rx="18" />
      <circle className="cocktail-glow" cx="90" cy="98" r="72" fill={`url(#glow-${profile.id})`} />
      <path className="cocktail-orbit" d="M30 104 C48 48 132 48 150 104 C132 160 48 160 30 104 Z" />
      <CocktailGlass profile={profile} />
      <text className="cocktail-label" x="90" y="228">
        {profile.shortName}
      </text>
    </svg>
  );
}

type CocktailProfile = {
  id: string;
  glass: "martini" | "highball" | "flute" | "rocks" | "tiki" | "warm";
  shortName: string;
  liquidTop: string;
  liquidBottom: string;
  accent: string;
  garnish: "citrus" | "cherry" | "mint" | "olive" | "smoke" | "sparkle";
};

function getCocktailProfile(drinkName: string, mood: string): CocktailProfile {
  const normalized = drinkName.toLowerCase();
  const seed = hashString(`${drinkName}-${mood}`);
  const palettes = [
    ["#ffcf70", "#d9480f", "#ffd166"],
    ["#c084fc", "#5b21b6", "#f0abfc"],
    ["#67e8f9", "#0f766e", "#99f6e4"],
    ["#fda4af", "#be123c", "#fecdd3"],
    ["#fde68a", "#92400e", "#fef3c7"],
    ["#93c5fd", "#1d4ed8", "#bfdbfe"]
  ];
  const [liquidTop, liquidBottom, accent] = palettes[seed % palettes.length];

  const glass = normalized.includes("martini") || normalized.includes("vesper") || normalized.includes("daiquiri")
    ? "martini"
    : normalized.includes("champagne") || normalized.includes("kir") || normalized.includes("french")
      ? "flute"
      : normalized.includes("highball") || normalized.includes("spritz") || normalized.includes("sling") || normalized.includes("mule")
        ? "highball"
        : normalized.includes("toddy")
          ? "warm"
          : normalized.includes("paloma") || normalized.includes("margarita") || normalized.includes("dark")
            ? "tiki"
            : "rocks";

  const garnish = normalized.includes("smok") || normalized.includes("penicillin")
    ? "smoke"
    : normalized.includes("martini") || normalized.includes("vesper")
      ? "olive"
      : normalized.includes("champagne") || normalized.includes("spritz") || normalized.includes("kir")
        ? "sparkle"
        : normalized.includes("mule") || normalized.includes("paloma")
          ? "mint"
          : normalized.includes("manhattan") || normalized.includes("negroni") || normalized.includes("old")
            ? "cherry"
            : "citrus";

  return {
    id: `${normalized.replace(/[^a-z0-9]+/g, "-")}-${seed}`,
    glass,
    shortName: drinkName.split(/\s+/).slice(0, 2).join(" "),
    liquidTop,
    liquidBottom,
    accent,
    garnish
  };
}

function CocktailGlass({ profile }: { profile: CocktailProfile }) {
  const liquid = `url(#drink-${profile.id})`;
  const garnish = <CocktailGarnish profile={profile} />;

  if (profile.glass === "martini") {
    return (
      <>
        <path className="glass-shape" d="M45 62 H135 L104 116 H76 Z" />
        <path className="drink-liquid" d="M56 74 H124 L101 108 H79 Z" fill={liquid} />
        <path className="glass-stem" d="M90 116 V180 M64 180 H116" />
        {garnish}
      </>
    );
  }

  if (profile.glass === "flute") {
    return (
      <>
        <path className="glass-shape" d="M70 46 H110 C108 118 102 154 90 154 C78 154 72 118 70 46 Z" />
        <path className="drink-liquid" d="M74 72 H106 C104 120 99 146 90 146 C81 146 76 120 74 72 Z" fill={liquid} />
        <path className="glass-stem" d="M90 154 V186 M68 186 H112" />
        {garnish}
      </>
    );
  }

  if (profile.glass === "highball") {
    return (
      <>
        <path className="glass-shape" d="M62 48 H118 L110 184 H70 Z" />
        <path className="drink-liquid" d="M67 88 H113 L107 178 H73 Z" fill={liquid} />
        <path className="ice-line" d="M78 104 L96 118 M100 92 L112 108 M76 142 L94 156" />
        {garnish}
      </>
    );
  }

  if (profile.glass === "warm") {
    return (
      <>
        <path className="glass-shape" d="M58 90 H118 C118 144 106 170 88 170 H76 C64 170 58 142 58 90 Z" />
        <path className="drink-liquid" d="M64 110 H112 C110 144 100 160 86 160 H78 C70 160 66 140 64 110 Z" fill={liquid} />
        <path className="glass-stem" d="M118 112 C142 112 142 150 116 148" />
        <path className="steam-line" d="M74 76 C66 62 82 58 74 44 M92 76 C84 62 100 58 92 44 M110 76 C102 62 118 58 110 44" />
        {garnish}
      </>
    );
  }

  if (profile.glass === "tiki") {
    return (
      <>
        <path className="glass-shape" d="M58 58 H122 L112 186 H68 Z" />
        <path className="drink-liquid" d="M64 92 H116 L108 178 H72 Z" fill={liquid} />
        <path className="tiki-line" d="M70 82 H110 M74 124 H106 M78 158 H102 M74 104 L106 146 M106 104 L74 146" />
        {garnish}
      </>
    );
  }

  return (
    <>
      <path className="glass-shape" d="M58 78 H122 L114 176 H66 Z" />
      <path className="drink-liquid" d="M64 112 H116 L110 168 H70 Z" fill={liquid} />
      <path className="ice-line" d="M76 112 L96 132 M100 106 L116 122 M82 146 L102 160" />
      {garnish}
    </>
  );
}

function CocktailGarnish({ profile }: { profile: CocktailProfile }) {
  switch (profile.garnish) {
    case "olive":
      return <circle className="garnish-fill" cx="126" cy="68" r="9" />;
    case "cherry":
      return <circle className="garnish-fill" cx="120" cy="84" r="8" />;
    case "mint":
      return <path className="garnish-fill" d="M122 62 C140 48 148 68 130 80 C126 72 122 68 122 62 Z M112 58 C96 44 90 64 106 76 C110 68 112 64 112 58 Z" />;
    case "smoke":
      return <path className="steam-line" d="M66 58 C50 38 82 34 66 16 M94 58 C78 38 110 34 94 16 M122 58 C106 38 138 34 122 16" />;
    case "sparkle":
      return (
        <>
          <path className="sparkle-shape" d="M128 48 L132 58 L142 62 L132 66 L128 76 L124 66 L114 62 L124 58 Z" />
          <circle className="garnish-fill" cx="56" cy="72" r="4" />
        </>
      );
    case "citrus":
    default:
      return <path className="garnish-fill" d="M122 66 A18 18 0 0 1 146 84 L122 84 Z" />;
  }
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function PlacePanel({
  place,
  card,
  featured = false,
  onDrawDrink,
  drinkState = "idle"
}: {
  place: PlaceRecommendation;
  card: TarotCard;
  featured?: boolean;
  onDrawDrink?: () => void;
  drinkState?: DrawState;
}) {
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
        {onDrawDrink ? (
          <button className="link-button" type="button" onClick={onDrawDrink} disabled={drinkState === "drawing"}>
            {drinkState === "drawing" ? <RefreshCw className="spin" size={17} /> : <Wine size={17} />}
            {drinkState === "drawing" ? "正在洗牌" : "抽一杯酒"}
          </button>
        ) : null}
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
