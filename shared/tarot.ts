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

const majorArcana: TarotCard[] = [
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
    id: "the-high-priestess",
    name: "The High Priestess",
    arcana: "II",
    mood: "mysterious",
    title: "今晚听直觉选门牌",
    reading: "女祭司牌不解释太多。她要你相信第一眼喜欢的入口，和菜单里最像暗号的那一杯。",
    invitation: "找一家低调、安静、有隐藏酒单感的 bar。",
    signatureDrink: "Vesper Martini",
    drinkNote: "清冷、锋利、带一点秘密，像女祭司只说一半的答案。",
    queries: ["hidden cocktail menu Singapore", "quiet speakeasy Singapore", "intimate cocktail bar Singapore"],
    palette: ["#1b263b", "#c9ada7"]
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
    id: "the-emperor",
    name: "The Emperor",
    arcana: "IV",
    mood: "classic",
    title: "今晚要稳稳坐上主位",
    reading: "皇帝牌偏爱秩序、质感和有分寸的气场。今晚不需要花哨，只需要每一杯都站得住。",
    invitation: "去一家经典、服务稳定、吧台专业的 cocktail bar。",
    signatureDrink: "Manhattan",
    drinkNote: "威士忌、甜味美思与苦精，像皇帝牌一样结构清晰。",
    queries: ["classic hotel bar Singapore", "manhattan cocktail bar Singapore", "premium cocktail lounge Singapore"],
    palette: ["#5f0f40", "#e36414"]
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
    id: "justice",
    name: "Justice",
    arcana: "VIII",
    mood: "classic",
    title: "今晚追求刚刚好的比例",
    reading: "正义牌讲究平衡：酸甜、酒感、服务和空间都不能太偏。今晚适合一杯配方精准的经典。",
    invitation: "找一家调酒稳定、评价均衡的 bar。",
    signatureDrink: "Daiquiri",
    drinkNote: "朗姆、青柠与糖的比例一旦正确，正义牌就会点头。",
    queries: ["balanced cocktail bar Singapore", "classic daiquiri bar Singapore", "award winning bar Singapore"],
    palette: ["#264653", "#e9c46a"]
  },
  {
    id: "the-hanged-man",
    name: "The Hanged Man",
    arcana: "XII",
    mood: "quiet",
    title: "今晚换个角度看夜晚",
    reading: "倒吊人牌让你暂停自动驾驶。适合慢一点、奇一点，给旧心情换一个坐姿。",
    invitation: "去一家不赶时间、适合发呆和慢饮的 bar。",
    signatureDrink: "Sazerac",
    drinkNote: "茴香、黑麦与苦精的反转感，像倒吊人看见另一种秩序。",
    queries: ["slow cocktail bar Singapore", "quiet whisky bar Singapore", "sazerac bar Singapore"],
    palette: ["#31572c", "#ecf39e"]
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

type MinorSuit = {
  id: "wands" | "cups" | "swords" | "pentacles";
  label: "Wands" | "Cups" | "Swords" | "Pentacles";
  cn: "权杖" | "圣杯" | "宝剑" | "星币";
  mood: TarotMood;
  palette: [string, string];
  placeQuery: string;
  drink: string;
  drinkNote: string;
};

type MinorMeaning = [
  id: string,
  label: string,
  cnRank: string,
  title: string,
  reading: string,
  invitation: string,
  mood?: TarotMood
];

const minorSuits: MinorSuit[] = [
  {
    id: "wands",
    label: "Wands",
    cn: "权杖",
    mood: "social",
    palette: ["#7f1d1d", "#f59e0b"],
    placeQuery: "lively cocktail bar Singapore",
    drink: "Mezcal Mule",
    drinkNote: "烟熏、姜味和气泡一起升起来，像权杖牌的第一簇火。"
  },
  {
    id: "cups",
    label: "Cups",
    cn: "圣杯",
    mood: "romantic",
    palette: ["#1d4ed8", "#f9a8d4"],
    placeQuery: "romantic wine cocktail bar Singapore",
    drink: "Kir Royale",
    drinkNote: "黑醋栗与气泡轻轻碰杯，圣杯牌负责把心情变柔软。"
  },
  {
    id: "swords",
    label: "Swords",
    cn: "宝剑",
    mood: "experimental",
    palette: ["#0f172a", "#93c5fd"],
    placeQuery: "creative cocktail bar Singapore",
    drink: "Gin Gimlet",
    drinkNote: "金酒与青柠直来直往，像宝剑牌切开混乱后的清爽。"
  },
  {
    id: "pentacles",
    label: "Pentacles",
    cn: "星币",
    mood: "luxury",
    palette: ["#14532d", "#d9a441"],
    placeQuery: "luxury hotel cocktail lounge Singapore",
    drink: "Espresso Martini",
    drinkNote: "咖啡、伏特加与泡沫的现实感，星币牌喜欢这种清醒的享受。"
  }
];

const minorMeanings: Record<MinorSuit["id"], MinorMeaning[]> = {
  wands: [
    ["ace", "Ace", "一", "权杖一：今晚点燃一个念头", "权杖一是真正的火种，代表冲动、创意和想出门的第一股能量。", "去一家有活力、能让今晚迅速热起来的 bar。"],
    ["two", "Two", "二", "权杖二：今晚先看清方向", "权杖二不是立刻冲出去，而是在出发前看地图、看人群、看你真正想要什么。", "选一家视野好或区域方便的地方，适合边喝边决定下一步。"],
    ["three", "Three", "三", "权杖三：今晚适合向外探索", "权杖三代表扩张和远方，适合离开熟悉街区，去一个没认真逛过的夜晚。", "去一家新区域的热门 bar，让今晚有一点旅行感。"],
    ["four", "Four", "四", "权杖四：今晚适合庆祝", "权杖四是聚会、归属和庆祝，重点不是喝多，而是让气氛变得像一个小小仪式。", "找一家适合朋友碰杯、座位舒服的热闹酒吧。"],
    ["five", "Five", "五", "权杖五：今晚有一点竞争感", "权杖五代表碰撞、比较和玩闹式的混乱，适合能量高但不要太严肃的场子。", "去一家有游戏、音乐或人群互动的 bar。"],
    ["six", "Six", "六", "权杖六：今晚适合被看见", "权杖六是胜利和认可，今晚可以穿得更亮一点，去一个让你有主角感的地方。", "选一家人气高、氛围体面、适合亮相的 bar。"],
    ["seven", "Seven", "七", "权杖七：今晚守住自己的节奏", "权杖七代表坚持立场。别人想赶场也好、劝酒也好，你今晚要按自己的舒服程度来。", "找一家不用迎合别人、可以自在待着的 bar。"],
    ["eight", "Eight", "八", "权杖八：今晚节奏会很快", "权杖八是快速推进、消息和突然成行，适合说走就走、不要过度计划。", "去一家交通方便、容易开始第二轮的 bar。"],
    ["nine", "Nine", "九", "权杖九：今晚需要恢复能量", "权杖九带着疲惫后的戒备感。你可以出门，但别把自己扔进过度消耗的场子。", "选一家有活力但不压迫、能坐下来喘口气的地方。"],
    ["ten", "Ten", "十", "权杖十：今晚别把自己搞太累", "权杖十代表负担和过量安排。今晚需要减法，不要为了完成局而硬撑。", "选一家近一点、稳定一点、喝完容易回家的 bar。"],
    ["page", "Page", "侍从", "权杖侍从：今晚保持好奇", "权杖侍从是新鲜感和冒险心，适合试一家你收藏很久但一直没去的地方。", "去一家年轻、有创意、酒单看起来会带来惊喜的 bar。"],
    ["knight", "Knight", "骑士", "权杖骑士：今晚冲动也不错", "权杖骑士热烈、直接、容易一拍即合。今晚适合主动邀人，也适合临时改计划。", "找一家节奏快、音乐强、能把兴致推高的 bar。"],
    ["queen", "Queen", "王后", "权杖王后：今晚自信一点", "权杖王后是魅力、自主和暖场能力。你不用等别人带气氛，你自己就是气氛。", "去一家漂亮、热情、适合社交的 cocktail bar。"],
    ["king", "King", "国王", "权杖国王：今晚掌控全局", "权杖国王代表成熟的行动力，适合你来定地点、定节奏、定今晚的第一杯。", "选一家可靠但不无聊、适合带朋友去的 bar。"]
  ],
  cups: [
    ["ace", "Ace", "一", "圣杯一：今晚让情绪重新流动", "圣杯一代表情感开启、心软和新的连接。今晚适合温柔一点，也适合认真享受第一口。", "选一家灯光柔和、酒体轻盈、适合开场聊天的 bar。"],
    ["two", "Two", "二", "圣杯二：今晚适合靠近某个人", "圣杯二是互相吸引、平等交流和双向回应。今晚的重点是一段舒服的对话。", "去一家适合约会或两人并肩坐的 cocktail bar。"],
    ["three", "Three", "三", "圣杯三：今晚适合朋友局", "圣杯三代表友情、庆祝和小圈子的愉悦。适合把快乐分享出去。", "找一家适合三五好友碰杯、气氛轻松的 bar。"],
    ["four", "Four", "四", "圣杯四：今晚你可能有点提不起劲", "圣杯四是情绪停滞和对眼前选择无感。今晚不需要硬嗨，重要的是换一点新鲜空气。", "选一家安静但有特色的地方，给自己一点空间。"],
    ["five", "Five", "五", "圣杯五：今晚适合温柔收拾心情", "圣杯五代表失落、遗憾和注意力卡在没得到的东西上。今晚别灌醉自己，给情绪一个出口就好。", "去一家安静、舒服、能慢慢喝的 bar。"],
    ["six", "Six", "六", "圣杯六：今晚适合一点怀旧", "圣杯六是回忆、熟悉感和旧日温柔。适合复访一家你有好记忆的地方。", "选一家让你放松、像老朋友一样可靠的 bar。"],
    ["seven", "Seven", "七", "圣杯七：今晚选择太多，别迷路", "圣杯七代表幻想、诱惑和选项过载。今晚可以梦幻，但不要被菜单和人群牵着走。", "去一家酒单清楚、有招牌推荐的 bar。"],
    ["eight", "Eight", "八", "圣杯八：今晚该离开旧口味", "圣杯八不是普通的推进，而是转身离开已经不满足你的东西，去寻找更深层的答案。", "不要去惯常那家；选一家陌生、安静、能让你换心情的 bar。"],
    ["nine", "Nine", "九", "圣杯九：今晚满足自己", "圣杯九是愿望实现和个人满足。今晚不用迁就，点你真正想喝的那杯。", "去一家评分高、酒单漂亮、能奖励自己的 bar。"],
    ["ten", "Ten", "十", "圣杯十：今晚适合圆满小聚", "圣杯十代表情感圆满、亲密群体和安全感。适合和让你放松的人一起喝。", "找一家适合熟人局、座位舒服、气氛温暖的 bar。"],
    ["page", "Page", "侍从", "圣杯侍从：今晚允许一点心动", "圣杯侍从是敏感、浪漫和小小惊喜。今晚可能因为一杯酒或一句话变柔软。", "选一家有漂亮杯型或甜美风味的 cocktail bar。"],
    ["knight", "Knight", "骑士", "圣杯骑士：今晚带着浪漫出门", "圣杯骑士代表邀请、表达和理想化的心情。适合主动约人，也适合认真制造氛围。", "去一家适合 date night 的浪漫酒吧。"],
    ["queen", "Queen", "王后", "圣杯王后：今晚照顾感受", "圣杯王后是共情、直觉和情绪容器。今晚适合选择让自己安心的地方。", "找一家温柔、安静、服务细腻的 bar。"],
    ["king", "King", "国王", "圣杯国王：今晚成熟地享受情绪", "圣杯国王不是压住情绪，而是稳稳承接它。适合深聊，也适合一杯有层次的酒。", "去一家成熟、优雅、适合慢谈的酒廊。"]
  ],
  swords: [
    ["ace", "Ace", "一", "宝剑一：今晚需要清醒选择", "宝剑一代表真相、清晰和切开混乱。今晚别被选择困难困住，直接选最明确的一家。", "去一家风格干净、酒单清楚的 cocktail bar。"],
    ["two", "Two", "二", "宝剑二：今晚别再僵持", "宝剑二是犹豫、回避和心里拉扯。你需要一个不吵的地方，把选择慢慢放下来。", "选一家安静、不催促、不需要立刻表态的 bar。"],
    ["three", "Three", "三", "宝剑三：今晚温柔处理刺痛", "宝剑三代表心痛、失望和话语留下的伤。今晚不适合硬热闹，适合诚实地放松一点。", "找一家低调、暗光、可以慢慢坐的 bar。"],
    ["four", "Four", "四", "宝剑四：今晚需要休息", "宝剑四是暂停、恢复和精神充电。今晚可以喝，但不要过载。", "去一家安静舒适、座位好、音量低的地方。"],
    ["five", "Five", "五", "宝剑五：今晚避开消耗局", "宝剑五代表争执、输赢心和说完会后悔的话。今晚别去容易比较或拉扯的局。", "选一家不用社交攻防、可以保持距离的 bar。"],
    ["six", "Six", "六", "宝剑六：今晚换个岸边", "宝剑六是离开混乱、过渡和慢慢变好。适合去水边、河边，或者一个让心情变轻的区域。", "找一家靠近河岸或氛围平稳的 bar。"],
    ["seven", "Seven", "七", "宝剑七：今晚保留一点策略", "宝剑七代表策略、隐藏动机和不把牌全摊开。今晚适合低调，不适合过度暴露自己。", "去一家隐蔽、私密、适合小声说话的 bar。"],
    ["eight", "Eight", "八", "宝剑八：今晚别困在想太多里", "宝剑八是自我限制和被念头绑住。实际选择比你想象中自由，先出门再说。", "选一家距离近、门槛低、容易开始的 bar。"],
    ["nine", "Nine", "九", "宝剑九：今晚让焦虑降噪", "宝剑九代表焦虑、失眠和脑内噪音。今晚需要安稳，不需要刺激。", "找一家安静、灯光暖、不会让你更紧绷的地方。"],
    ["ten", "Ten", "十", "宝剑十：今晚让糟糕到此为止", "宝剑十是一个阶段的结束。不是叫你沉溺，而是提醒你别把坏心情继续带下去。", "去一家可以象征性收尾、喝完就回家的 bar。"],
    ["page", "Page", "侍从", "宝剑侍从：今晚保持观察", "宝剑侍从好奇、警觉、喜欢信息。今晚适合看人、看菜单、看细节。", "选一家创意酒单丰富、适合研究风味的 bar。"],
    ["knight", "Knight", "骑士", "宝剑骑士：今晚别冲太快", "宝剑骑士直接、快速、容易上头。今晚可以果断，但别让节奏失控。", "去一家效率高、酒体利落、但不太喧闹的地方。"],
    ["queen", "Queen", "王后", "宝剑王后：今晚要清楚边界", "宝剑王后诚实、清醒、有边界。适合你选择真正适合自己的环境。", "找一家成熟、安静、不会过分打扰你的 bar。"],
    ["king", "King", "国王", "宝剑国王：今晚做理性决定", "宝剑国王代表判断力和秩序。今晚适合按评分、距离和营业状态做一个聪明选择。", "去一家口碑稳定、信息透明、不会踩雷的 bar。"]
  ],
  pentacles: [
    ["ace", "Ace", "一", "星币一：今晚把享受落到实处", "星币一代表新的现实机会和有质感的开始。今晚适合一杯真正值得花钱的酒。", "选一家服务稳、出品扎实的 cocktail bar。"],
    ["two", "Two", "二", "星币二：今晚平衡预算和兴致", "星币二是 juggling 和弹性安排。你可以享受，但别让行程和花费失控。", "找一家价格友好、交通方便、可进可退的 bar。"],
    ["three", "Three", "三", "星币三：今晚看重手艺", "星币三代表协作、工艺和专业度。适合把选择权交给认真工作的 bartender。", "去一家 craft cocktail bar，点一杯需要技术的酒。"],
    ["four", "Four", "四", "星币四：今晚别太紧绷", "星币四代表抓紧、安全感和不太愿意冒险。今晚可以稳，但别把自己锁死在熟悉选择里。", "选一家可靠中带一点新意的 bar。"],
    ["five", "Five", "五", "星币五：今晚照顾现实状态", "星币五代表匮乏、疲惫或觉得自己不在状态。今晚不必花大钱证明什么。", "找一家舒服、不过度昂贵、能让你缓一缓的地方。"],
    ["six", "Six", "六", "星币六：今晚适合分享", "星币六是给予、接受和平衡交换。适合请朋友一杯，也适合接受别人的好意。", "去一家适合分杯、分享小食或轮流点酒的 bar。"],
    ["seven", "Seven", "七", "星币七：今晚慢慢等它变好", "星币七代表等待、评估和长期回报。别急着换地方，给第一家一点时间。", "选一家可以久坐、慢慢进入状态的酒廊。"],
    ["eight", "Eight", "八", "星币八：今晚欣赏专业手艺", "星币八是练习、精进和匠人精神。适合看 bartender 认真完成一杯酒。", "去一家以调酒技术和细节著称的 cocktail bar。"],
    ["nine", "Nine", "九", "星币九：今晚奖励自己的品味", "星币九是独立、精致和自我满足。一个人去也完全成立。", "找一家优雅、安静、适合独享的 hotel bar。"],
    ["ten", "Ten", "十", "星币十：今晚选择经典口碑", "星币十代表传承、稳定和长期价值。适合去一家经得起多年评价的名店。", "选一家经典、知名、不会失手的酒吧。"],
    ["page", "Page", "侍从", "星币侍从：今晚学习一种新味道", "星币侍从认真、务实、愿意尝试。适合问清楚风味，再点一杯新东西。", "去一家菜单解释清楚、适合探索入门的 bar。"],
    ["knight", "Knight", "骑士", "星币骑士：今晚稳一点最好", "星币骑士慢、可靠、踏实。今晚不需要大起大落，稳定好喝就是答案。", "找一家稳定、舒适、服务不出错的 bar。"],
    ["queen", "Queen", "王后", "星币王后：今晚要舒服和质感", "星币王后代表照顾身体、空间和感官享受。座位、温度、服务都很重要。", "选一家舒适、精致、适合慢慢享受的酒廊。"],
    ["king", "King", "国王", "星币国王：今晚值得去好一点的地方", "星币国王代表成熟的享受、资源和高品质。今晚可以把预算用在真正值得的体验上。", "去一家高品质、服务稳、酒单成熟的 hotel cocktail bar。"]
  ]
};

const minorArcana: TarotCard[] = minorSuits.flatMap((suit) =>
  minorMeanings[suit.id].map(([id, label, cnRank, title, reading, invitation, mood]) => ({
    id: `${id}-of-${suit.id}`,
    name: `${label} of ${suit.label}`,
    arcana: `${suit.cn}${cnRank}`,
    mood: mood ?? suit.mood,
    title,
    reading,
    invitation,
    signatureDrink: suit.drink,
    drinkNote: suit.drinkNote,
    queries: [
      suit.placeQuery,
      `${mood ?? suit.mood} bar Singapore`,
      `${suit.label.toLowerCase()} inspired cocktail bar Singapore`
    ],
    palette: suit.palette
  }))
);

export const tarotCards: TarotCard[] = [...majorArcana, ...minorArcana];

export function pickTarotCard(cardId?: string) {
  if (cardId) {
    const chosen = tarotCards.find((card) => card.id === cardId);
    if (chosen) return chosen;
  }

  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}
