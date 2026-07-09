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
  signatureDrink: string;
  drinkNote: string;
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
    signatureDrink: "Midnight Negroni",
    drinkNote: "金巴利的苦与金酒的克制，像月光下不急着说透的心事。",
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
    signatureDrink: "Aperol Spritz",
    drinkNote: "明亮起泡、入口轻快，是太阳牌认定的完美开场白。",
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
    signatureDrink: "French 75",
    drinkNote: "香槟的优雅遇上柠檬的锐利，像两个人并肩时恰到好处的距离。",
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
    signatureDrink: "Skyline Sour",
    drinkNote: "酸橘与蛋清的柔滑，杯沿上挂着整座城市的灯火。",
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
    signatureDrink: "Japanese Highball",
    drinkNote: "威士忌与气泡的克制比例，节制牌认证的刚刚好。",
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
    signatureDrink: "Smoky Martini",
    drinkNote: "烟熏是魔术的烟雾，透明杯壁里藏着意想不到的层次。",
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
    signatureDrink: "Champagne Cocktail",
    drinkNote: "气泡、糖块与苦精的仪式感，女皇牌要求的被款待方式。",
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
    signatureDrink: "Whiskey Sour",
    drinkNote: "波本的醇厚配上柠檬的明亮，像爵士乐里突然升高的那一段。",
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
    signatureDrink: "Old Fashioned",
    drinkNote: "波本、苦精、方糖——教皇牌只信经得起复访的经典配方。",
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
    signatureDrink: "Bartender's Choice",
    drinkNote: "把今晚交给吧台后的那个人，愚者牌从不怕意外。",
    queries: ["unique bar Singapore", "new cocktail bar Singapore", "quirky bar Singapore"],
    palette: ["#006d77", "#ffddd2"]
  },
  {
    id: "the-hermit",
    name: "The Hermit",
    arcana: "IX",
    mood: "quiet",
    title: "今晚适合独处但不孤独",
    reading: "隐者牌要一个靠角落的座位、一盏暖灯，和不用对谁解释今晚心情的自由。",
    invitation: "找一家可以一个人坐很久的 bar。",
    signatureDrink: "Hot Toddy",
    drinkNote: "威士忌、蜂蜜与柠檬的热意，像隐者提灯走进夜色。",
    queries: ["cozy bar Singapore solo", "intimate whisky bar Singapore", "quiet hotel bar Singapore"],
    palette: ["#3d405b", "#e07a5f"]
  },
  {
    id: "wheel-of-fortune",
    name: "Wheel of Fortune",
    arcana: "X",
    mood: "wildcard",
    title: "今晚交给命运转一圈",
    reading: "命运之轮不保证惊喜是好是坏，但它保证今晚不会无聊。",
    invitation: "去一家风格多变、酒单常换的 bar。",
    signatureDrink: "Daily Special",
    drinkNote: "问 bartender 今天最好的那一杯——命运之轮已经替你转了。",
    queries: ["rotating cocktail menu Singapore", "seasonal cocktail bar Singapore", "eclectic bar Singapore"],
    palette: ["#7b2cbf", "#ffba08"]
  },
  {
    id: "strength",
    name: "Strength",
    arcana: "XI",
    mood: "romantic",
    title: "今晚温柔但有力量",
    reading: "力量牌要的是柔软里的笃定：不咄咄逼人，但你知道自己想要什么样的夜晚。",
    invitation: "选一家氛围温暖、酒却很有个性的 bar。",
    signatureDrink: "Paloma",
    drinkNote: "龙舌兰的烈被葡萄柚温柔接住，力量牌式的反差美学。",
    queries: ["mezcal bar Singapore", "agave cocktail bar Singapore", "warm atmosphere bar Singapore"],
    palette: ["#bc4749", "#f2e8cf"]
  },
  {
    id: "the-chariot",
    name: "The Chariot",
    arcana: "VII",
    mood: "classic",
    title: "今晚目标明确",
    reading: "战车牌不喜欢犹豫。它要干脆的酒单、利落的调酒、喝完就知道今晚没白出来。",
    invitation: "去一家经典稳健、效率很高的 cocktail bar。",
    signatureDrink: "Negroni",
    drinkNote: "三份原料、零废话——战车牌最喜欢的果断之味。",
    queries: ["negroni bar Singapore", "classic italian bar Singapore", "efficient cocktail bar Singapore"],
    palette: ["#003049", "#d62828"]
  },
  {
    id: "the-devil",
    name: "The Devil",
    arcana: "XV",
    mood: "luxury",
    title: "今晚可以放纵一点",
    reading: "恶魔牌不审判你的欲望。它要浓一点的酒、暗一点的光、和再多一杯也没关系的气氛。",
    invitation: "去一家有点危险魅力的深夜酒廊。",
    signatureDrink: "Dark & Stormy",
    drinkNote: "朗姆的甜与姜啤的烈，恶魔牌承认的欲望味道。",
    queries: ["late night cocktail lounge Singapore", "dark moody bar Singapore", "late night speakeasy Singapore"],
    palette: ["#1a1423", "#c9184a"]
  },
  {
    id: "the-tower",
    name: "The Tower",
    arcana: "XVI",
    mood: "experimental",
    title: "今晚打破常规",
    reading: "高塔牌要颠覆。难喝的边界、好喝的意外、打破你预设的调酒方式都算数。",
    invitation: "去一家敢做奇怪事情的创意 bar。",
    signatureDrink: "Spicy Margarita",
    drinkNote: "辣椒的刺痛打破预期，高塔牌从废墟里重建味蕾。",
    queries: ["molecular cocktail bar Singapore", "unusual cocktail bar Singapore", "avant garde bar Singapore"],
    palette: ["#03045e", "#ff006e"]
  },
  {
    id: "death",
    name: "Death",
    arcana: "XIII",
    mood: "mysterious",
    title: "今晚告别旧口味",
    reading: "死神牌不是结束，是换场。它要你放下常喝的那杯，试试从没点过的方向。",
    invitation: "去一家酒单会颠覆认知的 bar。",
    signatureDrink: "Penicillin",
    drinkNote: "泥煤威士忌的烟熏像一场告别，姜蜜又把你带向新的味道。",
    queries: ["whisky cocktail bar Singapore", "smoky cocktail bar Singapore", "innovative bar Singapore"],
    palette: ["#212529", "#adb5bd"]
  },
  {
    id: "the-world",
    name: "The World",
    arcana: "XXI",
    mood: "rooftop",
    title: "今晚值得一个完美收尾",
    reading: "世界牌要圆满感：视野、酒、同伴，至少有两样让你觉得这个夜晚是完整的。",
    invitation: "去一家能俯瞰城市、适合为今晚画句号的 bar。",
    signatureDrink: "Singapore Sling",
    drinkNote: "热带果香与杜松子酒的平衡，世界牌给新加坡夜晚的官方答案。",
    queries: ["iconic rooftop bar Singapore", "best view bar Singapore", "signature cocktail bar Singapore"],
    palette: ["#0077b6", "#90e0ef"]
  }
];

export function pickTarotCard(cardId?: string) {
  if (cardId) {
    const chosen = tarotCards.find((card) => card.id === cardId);
    if (chosen) return chosen;
  }

  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}
