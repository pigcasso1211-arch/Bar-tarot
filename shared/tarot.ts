export type TarotMood =
  | "mysterious"
  | "social"
  | "romantic"
  | "rooftop"
  | "quiet"
  | "experimental"
  | "luxury"
  | "music"
  | "classic"
  | "wildcard";

export type TarotCard = {
  id: string;
  name: string;
  arcana: string;
  mood: TarotMood;
  title: string;
  reading: string;
  invitation: string;
  queries: string[];
  palette: [string, string];
};

export const tarotCards: TarotCard[] = [
  {
    id: "the-moon",
    name: "The Moon",
    arcana: "XVIII",
    mood: "mysterious",
    title: "今晚适合走进暗门之后",
    reading: "月亮把城市藏了一半，剩下的一半留给低声说话、烛光和不急着解释的鸡尾酒。",
    invitation: "找一家 speakeasy，让今晚保持一点秘密。",
    queries: ["speakeasy cocktail bar Singapore", "hidden cocktail bar Singapore", "intimate bar Singapore"],
    palette: ["#273043", "#e6c76f"]
  },
  {
    id: "the-sun",
    name: "The Sun",
    arcana: "XIX",
    mood: "social",
    title: "今晚要热闹一点",
    reading: "太阳牌不允许你把夜晚过得太安静。适合有人群、笑声、第二轮酒和临时认识的新朋友。",
    invitation: "去人气高、氛围松弛的 bar，让一杯变两杯。",
    queries: ["popular bar Singapore", "lively cocktail bar Singapore", "best bar for groups Singapore"],
    palette: ["#f2a65a", "#1f7a8c"]
  },
  {
    id: "the-lovers",
    name: "The Lovers",
    arcana: "VI",
    mood: "romantic",
    title: "今晚适合慢慢靠近",
    reading: "恋人牌不催促。它要柔和灯光、好看的杯子、适合并肩坐下的距离。",
    invitation: "选一家浪漫但不做作的 cocktail bar。",
    queries: ["romantic cocktail bar Singapore", "date night bar Singapore", "wine cocktail bar Singapore"],
    palette: ["#9b5de5", "#ffafcc"]
  },
  {
    id: "the-star",
    name: "The Star",
    arcana: "XVII",
    mood: "rooftop",
    title: "今晚把城市举到杯口",
    reading: "星星牌要视野，要风，要从高处看见新加坡亮起来。",
    invitation: "去 rooftop bar，让夜景替你开场。",
    queries: ["rooftop bar Singapore", "skyline cocktail bar Singapore", "Marina Bay rooftop bar"],
    palette: ["#1d3557", "#a8dadc"]
  },
  {
    id: "temperance",
    name: "Temperance",
    arcana: "XIV",
    mood: "quiet",
    title: "今晚只需要刚刚好",
    reading: "节制牌偏爱平衡：舒服的座位、稳定的酒单、可以听清对方说话的音量。",
    invitation: "找一家安静微醺的地方，不和今晚较劲。",
    queries: ["quiet cocktail bar Singapore", "chill bar Singapore", "hotel bar Singapore quiet"],
    palette: ["#2d6a4f", "#d8f3dc"]
  },
  {
    id: "the-magician",
    name: "The Magician",
    arcana: "I",
    mood: "experimental",
    title: "今晚喝点会变戏法的",
    reading: "魔术师牌偏爱实验感。烟雾、香气、奇怪但合理的风味，都算今晚的咒语。",
    invitation: "去一家创意鸡尾酒吧，把选择权交给 bartender。",
    queries: ["experimental cocktail bar Singapore", "creative cocktail bar Singapore", "craft cocktail bar Singapore"],
    palette: ["#3a0ca3", "#4cc9f0"]
  },
  {
    id: "the-empress",
    name: "The Empress",
    arcana: "III",
    mood: "luxury",
    title: "今晚可以漂亮一点",
    reading: "女皇牌说，今晚值得被款待。空间、杯具、服务和第一口酒都要有质感。",
    invitation: "选一家精致酒廊，给夜晚加一点仪式。",
    queries: ["luxury cocktail bar Singapore", "hotel cocktail lounge Singapore", "best hotel bar Singapore"],
    palette: ["#6d597a", "#f4d35e"]
  },
  {
    id: "judgement",
    name: "Judgement",
    arcana: "XX",
    mood: "music",
    title: "今晚需要一点声音",
    reading: "审判牌不是安静的牌。它要节奏、现场感，最好有一首歌把今晚点亮。",
    invitation: "去有音乐或现场表演的 bar。",
    queries: ["live music bar Singapore", "jazz bar Singapore", "music cocktail bar Singapore"],
    palette: ["#540b0e", "#e09f3e"]
  },
  {
    id: "the-hierophant",
    name: "The Hierophant",
    arcana: "V",
    mood: "classic",
    title: "今晚相信经典",
    reading: "教皇牌不追流行，它相信 martini、old fashioned，以及经得起复访的吧台。",
    invitation: "去一家经典 cocktail bar，点一杯不会错的。",
    queries: ["classic cocktail bar Singapore", "best martini bar Singapore", "award winning cocktail bar Singapore"],
    palette: ["#283618", "#dda15e"]
  },
  {
    id: "the-fool",
    name: "The Fool",
    arcana: "0",
    mood: "wildcard",
    title: "今晚不要太会计划",
    reading: "愚者牌提醒你：有时候最好的夜晚，是被一个有点荒唐的选择带走的。",
    invitation: "抽一家意料之外但评价不错的地方。",
    queries: ["unique bar Singapore", "new cocktail bar Singapore", "quirky bar Singapore"],
    palette: ["#006d77", "#ffddd2"]
  }
];

export function pickTarotCard(cardId?: string) {
  if (cardId) {
    const chosen = tarotCards.find((card) => card.id === cardId);
    if (chosen) return chosen;
  }

  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}
