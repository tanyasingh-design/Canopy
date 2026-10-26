import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Link2, Clock, Check, ChevronDown } from "lucide-react";
import svgPaths from "../../imports/Container-1/svg-bn934pb3bw";
import imgGrain from "../../imports/Container-1/cbba9115fb590daa573bfb2aaaad974c0e3c5db0.png";

const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const INK = "#1C2E2A";
const FOREST = "#4DAA57";
const BLUE = "#4DAA57";
const DIVIDER = "rgba(77,170,87,0.2)";

// ── Date helpers ──────────────────────────────────────────────────────────────

function getISOWeek(d: Date) {
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(
    jan4.getDate() - ((jan4.getDay() + 6) % 7),
  );
  return Math.ceil(
    ((d.getTime() - startOfWeek1.getTime()) / 86400000 + 1) / 7,
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function WaveIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <path
        d={svgPaths.p202b3b80}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
      <path
        d={svgPaths.p15be5a20}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
      <path
        d={svgPaths.p9128380}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
    </svg>
  );
}
function SunIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <g clipPath="url(#sc)">
        <path
          d="M7.5 1.25V3.75"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M7.5 11.25V13.75"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M1.25 7.5H3.75"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M11.25 7.5H13.75"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M3.0625 3.0625L4.875 4.875"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d={svgPaths.p1a893400}
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M11.9375 3.0625L10.125 4.875"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
        <path
          d="M4.875 10.125L3.0625 11.9375"
          stroke={s}
          strokeLinecap="round"
          strokeWidth="0.875"
        />
      </g>
      <defs>
        <clipPath id="sc">
          <rect width="15" height="15" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function FlameIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <path
        d={svgPaths.p1539c900}
        stroke={s}
        strokeLinejoin="round"
        strokeWidth="0.875"
      />
      <path
        d={svgPaths.p11b58580}
        stroke={s}
        strokeLinejoin="round"
        strokeWidth="0.7"
        opacity="0.6"
      />
    </svg>
  );
}
function LinesIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <path
        d="M1.875 5H13.125"
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
      <path
        d="M1.875 8.125H13.125"
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
      <path
        d="M1.875 11.25H8.75"
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.875"
      />
    </svg>
  );
}
function LightningIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <path
        d={svgPaths.p2eaec080}
        stroke={s}
        strokeLinejoin="round"
        strokeWidth="0.875"
      />
    </svg>
  );
}
function PlantIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 15 15"
      className="size-[15px] shrink-0"
    >
      <path
        d={svgPaths.p6195900}
        stroke={s}
        strokeWidth="0.875"
      />
      <path
        d={svgPaths.p38628fc0}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.6125"
      />
      <path d={svgPaths.p29587d00} fill={s} />
      <path
        d="M7.5 7.5L9.375 5.625"
        stroke={s}
        strokeLinecap="round"
        strokeWidth="0.7"
      />
    </svg>
  );
}
function MyselfIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 18"
      className="size-[16px] shrink-0"
    >
      <path
        d={svgPaths.pe034900}
        stroke={s}
        strokeWidth="1.2"
      />
      <path
        d={svgPaths.p2b850098}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}
function SomeoneElseIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 18"
      className="size-[16px] shrink-0"
    >
      <path
        d={svgPaths.p22de8600}
        stroke={s}
        strokeWidth="1.125"
      />
      <path
        d={svgPaths.p1dd1200}
        stroke={s}
        strokeWidth="1.125"
        opacity="0.6"
      />
      <path
        d={svgPaths.pd727890}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="1.125"
      />
      <path
        d={svgPaths.p76bb780}
        stroke={s}
        strokeLinecap="round"
        strokeWidth="1.125"
        opacity="0.6"
      />
    </svg>
  );
}
function FutureMeIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 18"
      className="size-[16px] shrink-0"
    >
      <path
        d={svgPaths.p3077bf80}
        stroke={s}
        strokeWidth="1.2"
      />
      <path
        d="M9 5.25V9L11.625 11.625"
        stroke={s}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M12 3H15V6"
        stroke={s}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.05"
      />
      <path
        d="M11.25 3.75L15 3"
        stroke={s}
        strokeLinecap="round"
        strokeWidth="1.05"
      />
    </svg>
  );
}
function CameraIcon({ s }: { s: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 20 20"
      className="size-[18px] shrink-0"
    >
      <path
        d={svgPaths.p12a85900}
        stroke={s}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.04167"
      />
      <path
        d={svgPaths.p380a7500}
        stroke={s}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.04167"
      />
    </svg>
  );
}

// ── Radio ─────────────────────────────────────────────────────────────────────

function EmotionRadio({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  return (
    <div
      className="relative rounded-full shrink-0 size-[18px] flex items-center justify-center"
      style={{
        background: "rgba(255,255,255,0)",
        border: `1.5px solid ${selected ? color : DIVIDER}`,
      }}
    >
      {selected && (
        <div
          className="rounded-full size-[9px]"
          style={{ background: color }}
        />
      )}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const EMOTIONS: {
  name: string;
  color: string;
  Icon: (p: { s: string }) => JSX.Element;
}[] = [
    { name: "Stressed", color: FOREST, Icon: WaveIcon },
    { name: "FOMO", color: BLUE, Icon: SunIcon },
    { name: "Craving", color: "#D4708A", Icon: FlameIcon },
    { name: "Bored", color: "#D97706", Icon: LinesIcon },
    { name: "Excited", color: "#E07B39", Icon: LightningIcon },
    { name: "Intentional", color: "#5A9469", Icon: PlantIcon },
  ];

const FOR_OPTIONS = [
  { id: "myself", label: "Myself", Icon: MyselfIcon },
  { id: "someone-else", label: "Someone else", Icon: SomeoneElseIcon },
  { id: "future-me", label: "Future me", Icon: FutureMeIcon },
];

const CATEGORIES = [
  "Food delivery",
  "Fashion",
  "Gadgets",
  "Subscriptions",
  "Home",
  "Beauty",
  "Entertainment",
  "Other",
];

const BUYING_REASONS = [
  "Tired / stress relief",
  "Reward after work",
  "Bored scrolling",
  "Craving",
  "Pure aesthetic",
  "FOMO / flash sale",
  "Social obligation / sharing",
  "Intentional need",
  "Other",
];

export function inferEmotionFromReason(reasonText: string): { name: string; hex: string } {
  const t = reasonText.toLowerCase();
  if (
    t.includes("intent") ||
    t.includes("need") ||
    t.includes("plan") ||
    t.includes("essential") ||
    t.includes("grocery")
  ) {
    return { name: "Intentional", hex: "#4A9A8E" };
  }
  if (
    t.includes("stress") ||
    t.includes("tired") ||
    t.includes("exhaust") ||
    t.includes("work") ||
    t.includes("overwhelm") ||
    t.includes("burnout") ||
    t.includes("escape")
  ) {
    return { name: "Stressed", hex: "#C0463A" };
  }
  if (t.includes("bored") || t.includes("scroll") || t.includes("idle") || t.includes("kill time")) {
    return { name: "Bored", hex: "#D4A853" };
  }
  if (
    t.includes("fomo") ||
    t.includes("sale") ||
    t.includes("deal") ||
    t.includes("discount") ||
    t.includes("flash") ||
    t.includes("miss out") ||
    t.includes("hurry")
  ) {
    return { name: "FOMO", hex: "#9B72CF" };
  }
  if (
    t.includes("social") ||
    t.includes("share") ||
    t.includes("sharing") ||
    t.includes("gift") ||
    t.includes("friend") ||
    t.includes("peer") ||
    t.includes("family") ||
    t.includes("obligation") ||
    t.includes("pressure")
  ) {
    return { name: "Anxious", hex: "#A073C4" };
  }
  if (
    t.includes("excite") ||
    t.includes("celebrat") ||
    t.includes("happy") ||
    t.includes("joy")
  ) {
    return { name: "Excited", hex: "#E07B39" };
  }
  if (t === "other") {
    return { name: "Neutral", hex: "#5E94CB" };
  }
  return { name: "Craving", hex: "#D4864A" };
}

// Damerau-Levenshtein distance (handles transpositions like "comdey" -> "comedy", "swigi" -> "swiggy")
function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const la = a.length;
  const lb = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= la; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    d[0][j] = j;
  }
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (
        i > 1 &&
        j > 1 &&
        a.charAt(i - 1) === b.charAt(j - 2) &&
        a.charAt(i - 2) === b.charAt(j - 1)
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[la][lb];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Entertainment: [
    "comedy",
    "comedian",
    "standup",
    "stand up",
    "samay raina",
    "samay",
    "raina",
    "zakir khan",
    "zakir",
    "bassi",
    "comic",
    "show",
    "shows",
    "live show",
    "tour",
    "concert",
    "gig",
    "festival",
    "fest",
    "movie",
    "movies",
    "cinema",
    "film",
    "films",
    "pvr",
    "inox",
    "imax",
    "cinepolis",
    "bookmyshow",
    "bms",
    "ticketmaster",
    "insider",
    "ticket",
    "tickets",
    "tkt",
    "tkts",
    "pass",
    "passes",
    "theater",
    "theatre",
    "play",
    "drama",
    "ipl",
    "cricket",
    "match",
    "game",
    "gaming",
    "steam",
    "playstation",
    "ps5",
    "ps4",
    "xbox",
    "nintendo",
    "switch",
    "board game",
    "puzzle",
    "lego",
    "book",
    "books",
    "novel",
    "manga",
    "anime",
    "comic book",
    "audible",
    "museum",
    "exhibition",
    "amusement park",
    "circus",
    "water park",
    "bowling",
    "arcade",
    "entertainment",
  ],
  "Food delivery": [
    "swiggy",
    "zomato",
    "blinkit",
    "zepto",
    "instamart",
    "bigbasket",
    "eatclub",
    "uber eats",
    "doordash",
    "deliveroo",
    "pizza",
    "burger",
    "fries",
    "sushi",
    "biryani",
    "curry",
    "taco",
    "tacos",
    "sandwich",
    "noodles",
    "ramen",
    "pasta",
    "boba",
    "coffee",
    "latte",
    "cappuccino",
    "espresso",
    "matcha",
    "starbucks",
    "mcdonalds",
    "dominos",
    "kfc",
    "subway",
    "chipotle",
    "dunkin",
    "haldiram",
    "dessert",
    "cake",
    "pastry",
    "bakery",
    "grocery",
    "groceries",
    "snack",
    "snacks",
    "chips",
    "ice cream",
    "chocolate",
    "cookie",
    "cookies",
    "lunch",
    "dinner",
    "breakfast",
    "takeout",
    "meal",
    "restaurant",
    "chai",
    "tea",
    "drink",
    "drinks",
    "food",
    "paneer",
    "chicken",
    "shawarma",
    "momos",
    "momo",
    "rolls",
    "coke",
    "pepsi",
    "soda",
    "beer",
    "wine",
    "whiskey",
    "alcohol",
    "bar",
    "cafe",
  ],
  Fashion: [
    "zara",
    "h&m",
    "uniqlo",
    "myntra",
    "ajio",
    "asos",
    "shein",
    "urbanic",
    "meesho",
    "snitch",
    "bewakoof",
    "souled store",
    "nike",
    "adidas",
    "puma",
    "new balance",
    "converse",
    "vans",
    "crocs",
    "asics",
    "gucci",
    "prada",
    "balenciaga",
    "louis vuitton",
    "tshirt",
    "t-shirt",
    "shirt",
    "shirts",
    "tee",
    "top",
    "dress",
    "dresses",
    "skirt",
    "jeans",
    "pants",
    "trousers",
    "shorts",
    "cargo",
    "joggers",
    "jacket",
    "jackets",
    "coat",
    "hoodie",
    "hoodies",
    "sweater",
    "cardigan",
    "blazer",
    "suit",
    "sneakers",
    "sneaker",
    "shoes",
    "shoe",
    "boots",
    "boot",
    "heels",
    "sandals",
    "slippers",
    "chappal",
    "loafers",
    "slides",
    "handbag",
    "purse",
    "tote",
    "backpack",
    "wallet",
    "jewelry",
    "jewellery",
    "necklace",
    "earrings",
    "ring",
    "rings",
    "bracelet",
    "chain",
    "bangle",
    "watch",
    "sunglasses",
    "shades",
    "glasses",
    "hat",
    "cap",
    "beanie",
    "scarf",
    "belt",
    "socks",
    "underwear",
    "lingerie",
    "activewear",
    "gymwear",
    "swimwear",
    "fashion",
    "clothes",
    "clothing",
    "apparel",
    "outfit",
    "kurta",
    "kurti",
    "saree",
    "lehenga",
    "ethnic",
  ],
  Gadgets: [
    "apple",
    "iphone",
    "ipad",
    "macbook",
    "mac mini",
    "imac",
    "mac",
    "airpods",
    "airtag",
    "apple watch",
    "samsung",
    "galaxy",
    "pixel",
    "oneplus",
    "xiaomi",
    "realme",
    "oppo",
    "vivo",
    "sony",
    "bose",
    "boat",
    "noise",
    "fireboltt",
    "anker",
    "belkin",
    "logitech",
    "kindle",
    "headphone",
    "headphones",
    "earphone",
    "earphones",
    "earbuds",
    "tws",
    "buds",
    "speaker",
    "speakers",
    "bluetooth speaker",
    "charger",
    "cable",
    "adapter",
    "power bank",
    "powerbank",
    "phone case",
    "case",
    "cover",
    "screen protector",
    "screen guard",
    "tempered glass",
    "laptop",
    "desktop",
    "pc",
    "monitor",
    "keyboard",
    "mouse",
    "webcam",
    "microphone",
    "mic",
    "drone",
    "gopro",
    "camera",
    "lens",
    "tripod",
    "smartwatch",
    "smart band",
    "fitness tracker",
    "tablet",
    "tab",
    "gpu",
    "cpu",
    "ssd",
    "hard drive",
    "usb",
    "pendrive",
    "gadget",
    "gadgets",
    "electronics",
    "tech",
  ],
  Subscriptions: [
    "netflix",
    "spotify",
    "youtube",
    "youtube premium",
    "yt premium",
    "disney",
    "hotstar",
    "prime",
    "prime video",
    "hbo",
    "apple music",
    "apple tv",
    "apple one",
    "icloud",
    "google one",
    "patreon",
    "substack",
    "chatgpt",
    "openai",
    "claude",
    "anthropic",
    "midjourney",
    "copilot",
    "gym",
    "cult",
    "cult.fit",
    "cult fit",
    "fitpass",
    "gold gym",
    "membership",
    "annual plan",
    "monthly plan",
    "subscription",
    "subscriptions",
    "software",
    "figma",
    "adobe",
    "canva",
    "notion",
    "nordvpn",
    "expressvpn",
    "surfshark",
    "vpn",
    "domain",
    "hosting",
    "cloud",
  ],
  Home: [
    "ikea",
    "urban ladder",
    "pepperfry",
    "home centre",
    "west elm",
    "furniture",
    "chair",
    "office chair",
    "desk",
    "study table",
    "table",
    "couch",
    "sofa",
    "bed",
    "mattress",
    "bedsheet",
    "pillow",
    "cushion",
    "duvet",
    "blanket",
    "comforter",
    "curtain",
    "curtains",
    "drapes",
    "carpet",
    "rug",
    "mat",
    "lamp",
    "light",
    "lights",
    "fairy lights",
    "chandelier",
    "candle",
    "candles",
    "diffuser",
    "vase",
    "indoor plant",
    "plant",
    "pot",
    "pots",
    "planter",
    "mug",
    "mugs",
    "cup",
    "plate",
    "plates",
    "bowl",
    "cutlery",
    "spoon",
    "fork",
    "cookware",
    "pan",
    "tawa",
    "blender",
    "mixer",
    "toaster",
    "air fryer",
    "airfryer",
    "microwave",
    "oven",
    "kettle",
    "vacuum",
    "dyson",
    "purifier",
    "air purifier",
    "humidifier",
    "organizer",
    "storage",
    "hanger",
    "hangers",
    "mirror",
    "clock",
    "wall clock",
    "wall art",
    "frame",
    "decor",
    "home decor",
    "towel",
    "towels",
    "bedding",
    "home",
  ],
  Beauty: [
    "nykaa",
    "sephora",
    "tira",
    "ulta",
    "mac cosmetics",
    "mac",
    "loreal",
    "maybelline",
    "glossier",
    "fenty",
    "rare beauty",
    "the ordinary",
    "cerave",
    "cetaphil",
    "neutrogena",
    "plum",
    "mcaffeine",
    "mamaearth",
    "minimalist",
    "cosrx",
    "sunscreen",
    "sunblock",
    "serum",
    "moisturizer",
    "moisturiser",
    "cream",
    "lotion",
    "cleanser",
    "toner",
    "face wash",
    "facewash",
    "scrub",
    "exfoliator",
    "face mask",
    "sheet mask",
    "eye cream",
    "lip balm",
    "lipstick",
    "lip gloss",
    "lip tint",
    "foundation",
    "concealer",
    "powder",
    "compact",
    "blush",
    "bronzer",
    "highlighter",
    "contour",
    "mascara",
    "eyeliner",
    "kajal",
    "eyeshadow",
    "brow",
    "perfume",
    "perfumes",
    "fragrance",
    "cologne",
    "body mist",
    "deodorant",
    "deo",
    "body wash",
    "body lotion",
    "shampoo",
    "conditioner",
    "hair oil",
    "hair mask",
    "hair serum",
    "skincare",
    "skin care",
    "makeup",
    "cosmetics",
    "beauty",
    "nail polish",
    "manicure",
    "salon",
    "spa",
  ],
};

export interface DetectedCategoryResult {
  categories: string[];
  primary: string;
}

function guessCategory(name: string): DetectedCategoryResult | null {
  const raw = name.trim().toLowerCase();
  if (!raw) return null;

  const scores: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    if (cat !== "Other") scores[cat] = 0;
  }

  // 1. Direct multi-word / exact phrase check across full raw text
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const phrase of words) {
      if (phrase.includes(" ")) {
        if (raw.includes(phrase)) {
          scores[cat] = (scores[cat] || 0) + 16;
        } else {
          // Check if phrase tokens match with slight typos (e.g. "samay riana" vs "samay raina")
          const pWords = phrase.split(" ");
          const rawTokens = raw.split(/[\s,]+/);
          const matchedAll = pWords.every((pw) =>
            rawTokens.some(
              (rt) => rt === pw || damerauLevenshtein(rt, pw) <= 1
            )
          );
          if (matchedAll) {
            scores[cat] = (scores[cat] || 0) + 14;
          }
        }
      }
    }
  }

  // 2. Conjunction & delimiter splitting: handles commas (,), "and", "+", "&", "/", "with", "plus"
  const segments = raw
    .split(/[,/+&]|\s+and\s+|\s+with\s+|\s+plus\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  segments.forEach((seg, segIdx) => {
    // Earlier items get natural priority weight in multi-item lists
    const posMultiplier = 1 / (segIdx * 0.25 + 1);
    const words = seg
      .split(/[\s_-]+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length >= 2);

    for (const w of words) {
      // Priority 1: Exact match in any category dictionary
      let exactMatchedCat: string | null = null;
      for (const [cat, dict] of Object.entries(CATEGORY_KEYWORDS)) {
        if (dict.includes(w)) {
          exactMatchedCat = cat;
          break;
        }
      }

      if (exactMatchedCat) {
        scores[exactMatchedCat] = (scores[exactMatchedCat] || 0) + 8 * posMultiplier;
        continue; // Word is claimed by its exact category; never run fuzzy checks on other categories!
      }

      // Priority 2: Stem / plural / compound match
      let stemMatchedCat: string | null = null;
      for (const [cat, dict] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of dict) {
          if (kw.includes(" ")) continue;
          if (
            (w.length >= 4 && kw.startsWith(w)) ||
            (kw.length >= 4 && w.startsWith(kw))
          ) {
            stemMatchedCat = cat;
            break;
          }
          if (
            w.length >= 5 &&
            kw.length >= 4 &&
            (w.includes(kw) || kw.includes(w))
          ) {
            stemMatchedCat = cat;
            break;
          }
        }
        if (stemMatchedCat) break;
      }

      if (stemMatchedCat) {
        scores[stemMatchedCat] = (scores[stemMatchedCat] || 0) + 6.5 * posMultiplier;
        continue; // Word is claimed; do not fuzzy match!
      }

      // Priority 3: Fuzzy typo match ONLY for words not found in any category dictionary
      // (e.g. "comdey", "swigi", "piza", "airpords")
      let bestFuzzyCat: string | null = null;
      let minDistance = 999;

      for (const [cat, dict] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of dict) {
          if (kw.includes(" ")) continue;
          const maxDist = kw.length >= 6 ? 2 : kw.length >= 4 ? 1 : 0;
          if (maxDist > 0 && Math.abs(w.length - kw.length) <= maxDist) {
            const dist = damerauLevenshtein(w, kw);
            if (dist <= maxDist && dist < minDistance) {
              minDistance = dist;
              bestFuzzyCat = cat;
            }
          }
        }
      }

      if (bestFuzzyCat && minDistance <= 2) {
        const fuzzyScore = (5.5 - minDistance * 1.5) * posMultiplier;
        scores[bestFuzzyCat] = (scores[bestFuzzyCat] || 0) + fuzzyScore;
      }
    }
  });

  const sorted = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  const topCategory = sorted[0][0];

  // Capture all categories that matched with confidence (>= 3.5 points)
  const matchedCategories = sorted
    .filter(([_, score], idx) => idx === 0 || score >= 3.5)
    .map(([cat]) => cat);

  return {
    categories: matchedCategories,
    primary: topCategory,
  };
}

function SectionLabel({ text, mb = 12 }: { text: string; mb?: number }) {
  const formatted = text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <p
      style={{
        fontFamily: BODY,
        fontSize: 12,
        letterSpacing: "0.2px",
        color: INK,
        marginBottom: mb,
        fontWeight: 600,
      }}
    >
      {formatted}
    </p>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function AutoSizeInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="relative inline-block min-w-[16px]">
      <span
        className={className}
        style={{
          ...style,
          visibility: "hidden",
          whiteSpace: "pre",
          display: "inline-block",
        }}
      >
        {value || placeholder}
      </span>
      <input
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode="decimal"
        className={`absolute inset-0 w-full h-full bg-transparent outline-none ${className}`}
        style={style}
      />
    </div>
  );
}

export function LogUrgeSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const now = new Date();
  const week = getISOWeek(now);
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const entryNo = (() => {
    try {
      const stored = localStorage.getItem("gardenFlowers");
      const flowers = stored ? JSON.parse(stored) : [];
      return Array.isArray(flowers) ? flowers.length + 1 : 1;
    } catch {
      return 1;
    }
  })();

  const [itemName, setItemName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Other"]);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  function handleItemNameChange(val: string) {
    setItemName(val);
    const result = guessCategory(val);
    if (result && result.categories.length > 0) {
      setSelectedCategories(result.categories);
      setIsAutoDetected(true);
    } else if (!val.trim()) {
      setSelectedCategories(["Other"]);
      setIsAutoDetected(false);
    }
  }

  function toggleCategory(cat: string) {
    setIsAutoDetected(false);
    setSelectedCategories((prev) => {
      if (cat === "Other") {
        return ["Other"];
      }
      const withoutOther = prev.filter((c) => c !== "Other");
      if (withoutOther.includes(cat)) {
        const next = withoutOther.filter((c) => c !== cat);
        return next.length > 0 ? next : ["Other"];
      } else {
        return [...withoutOther, cat];
      }
    });
  }

  // Smoothly center the first selected or detected category into view
  useEffect(() => {
    if (selectedCategories.length > 0 && categoryScrollRef.current) {
      const firstCat = selectedCategories[0];
      const el = categoryScrollRef.current.querySelector(
        `[data-category="${firstCat}"]`
      );
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedCategories]);

  const [costInput, setCostInput] = useState("");
  const [buyingFor, setBuyingFor] = useState("myself");
  const [showCalcMenu, setShowCalcMenu] = useState(false);
  const calcMenuRef = useRef<HTMLDivElement>(null);

  // Close calculation menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calcMenuRef.current && !calcMenuRef.current.contains(e.target as Node)) {
        setShowCalcMenu(false);
      }
    }
    if (showCalcMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalcMenu]);

  const [notes, setNotes] = useState("");
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [buyingReason, setBuyingReason] = useState("Reward after work");
  const [customReason, setCustomReason] = useState("");
  const [hourlyWage, setHourlyWage] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("userHourlyWage");
      return stored ? parseFloat(stored) || 500 : 500;
    } catch {
      return 500;
    }
  });
  const [showWageEdit, setShowWageEdit] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const costInputRef = useRef<HTMLInputElement>(null);

  // Stable, deterministic math evaluation:
  // ONLY produces a number when a math expression is fully entered with both operands.
  // Never flickers when the user is midway typing (e.g. "100 + ").
  const mathResult = useMemo(() => {
    const trimmed = costInput.trim();
    if (!trimmed) return null;
    if (!/[+\-*/]/.test(trimmed)) return null;
    // Incomplete expression ending in operator
    if (/[+\-*/]\s*$/.test(trimmed)) return null;

    const sanitized = trimmed.replace(/[^0-9.+\-*/]/g, "");
    if (!sanitized) return null;

    try {
      // eslint-disable-next-line no-new-func
      const res = new Function(`"use strict"; return (${sanitized})`)();
      if (typeof res === "number" && !isNaN(res) && isFinite(res) && res >= 0) {
        return parseFloat(res.toFixed(2));
      }
      return null;
    } catch {
      return null;
    }
  }, [costInput]);

  const totalCost = useMemo(() => {
    if (mathResult !== null) return mathResult;
    const trimmed = costInput.trim();
    if (!trimmed) return 0;
    const match = trimmed.match(/^([0-9.]+)/);
    return match ? parseFloat(match[1]) || 0 : 0;
  }, [costInput, mathResult]);
  const laborHours = totalCost > 0 ? (totalCost / hourlyWage).toFixed(1) : "0.0";

  function handleCostInputChange(val: string) {
    const clean = val.replace(/[^0-9.+\-*/ ]/g, "");
    setCostInput(clean);
  }

  function insertOperation(op: string) {
    setCostInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `0 ${op} `;
      if (/[+\-*/]$/.test(trimmed)) {
        return `${trimmed.slice(0, -1).trim()} ${op} `;
      }
      return `${trimmed} ${op} `;
    });
    setTimeout(() => {
      costInputRef.current?.focus();
    }, 40);
  }

  const canSubmit = itemName.trim().length > 0;

  function handleLogAndDraw() {
    if (!canSubmit) return;
    localStorage.setItem("urgeItem", itemName.trim());
    localStorage.setItem("currentCategory", selectedCategories.join(", "));
    localStorage.setItem("currentCategories", JSON.stringify(selectedCategories));
    localStorage.setItem("currentPhotos", JSON.stringify(imageFiles));
    localStorage.setItem("purchaseCost", totalCost.toFixed(2));
    localStorage.setItem("laborHours", laborHours);
    const finalReason = (
      buyingReason === "Other"
        ? (customReason.trim() || "Other")
        : buyingReason
    ).trim();
    localStorage.setItem("buyingReason", finalReason);
    localStorage.setItem("userHourlyWage", hourlyWage.toString());
    localStorage.setItem("currentWhoFor", buyingFor);
    localStorage.removeItem("currentLink");
    localStorage.removeItem("coolingHours");
    localStorage.removeItem("currentJournal");

    const inferred = inferEmotionFromReason(finalReason);
    localStorage.setItem(
      "currentEmotion",
      JSON.stringify(inferred),
    );

    onClose();
    navigate("/draw");
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end justify-center md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(26,36,32,0.22)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full flex flex-col max-h-[90dvh] rounded-t-[28px] md:rounded-[24px] md:max-w-[440px] md:mx-auto overflow-hidden shadow-2xl"
        style={{
          background: "rgba(250,250,250,0.98)",
        }}
        initial={{ y: "100%", scale: 1 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 1 }}
        transition={{
          type: "spring",
          damping: 32,
          stiffness: 300,
        }}
      >
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${imgGrain})`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: 0.2,
            mixBlendMode: "multiply",
          }}
        />

        <div className="relative z-10 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Header (fixed at top) */}
          <div className="shrink-0 bg-[rgba(250,250,250,0.98)]">
            {/* Handle pill — mobile only */}
            <div className="flex justify-center pt-2.5 pb-1 md:hidden">
              <div
                className="w-8 h-[3px] rounded-full"
                style={{ background: DIVIDER }}
              />
            </div>

            {/* Header: week / date / close */}
            <div className="flex items-start justify-between px-5 pt-3 pb-2.5 border-b border-[rgba(28,46,42,0.06)]">
              <div>
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 12.5,
                    letterSpacing: "0.3px",
                    color: "#697472",
                    fontWeight: 600,
                  }}
                >
                  {`Week ${week} — Entry No. ${entryNo}`}
                </p>
                <p
                  style={{
                    fontFamily: HEAD,
                    fontSize: 22,
                    letterSpacing: "-0.3px",
                    color: INK,
                    lineHeight: "24px",
                    marginTop: 2,
                  }}
                >
                  {dateLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 flex items-center justify-center rounded-full size-7 shrink-0"
                style={{
                  background: "rgba(60,50,40,0.07)",
                  border: `1px solid ${DIVIDER}`,
                }}
              >
                <svg
                  fill="none"
                  viewBox="0 0 16 16"
                  className="size-3.5"
                >
                  <path
                    d="M12 4L4 12"
                    stroke={FOREST}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M4 4L12 12"
                    stroke={FOREST}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Body (Scrollable, scrollbar hidden) ── */}
          <div
            className="flex-1 overflow-y-auto no-scrollbar flex flex-col pt-2.5 pb-1 min-h-0"
            style={{ gap: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* ── Polaroid Preview (if images attached) ── */}
            {imageFiles.length > 0 && (
              <div className="px-5">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {imageFiles.map((img, index) => (
                    <div
                      key={index}
                      className="relative shrink-0 bg-white p-1.5 rounded-[8px] shadow-sm border border-[rgba(28,46,42,0.08)] group"
                    >
                      <img
                        src={img}
                        alt="Urge preview"
                        className="w-16 h-16 object-cover rounded-[5px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImageFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1C2E2A] text-white flex items-center justify-center text-[10px] shadow-sm"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── I want to buy ── */}
            <div className="px-5">
              <SectionLabel text="I want to buy" mb={2} />
              <div className="flex items-center gap-3">
                <input
                  value={itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  placeholder="new headphones…"
                  className="flex-1 min-w-0 py-1 px-0.5 outline-none bg-transparent transition-colors placeholder:text-[rgba(28,46,42,0.4)]"
                  style={{
                    fontFamily: BODY,
                    fontSize: 16,
                    color: INK,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${itemName ? INK : "rgba(28,46,42,0.2)"}`,
                    borderRadius: 0,
                    caretColor: BLUE,
                  }}
                />
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const MAX_SIZE = 400;
                          let { width, height } = img;
                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height = Math.round((height * MAX_SIZE) / width);
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width = Math.round((width * MAX_SIZE) / height);
                              height = MAX_SIZE;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext("2d");
                          ctx?.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                          setImageFiles((prev) => [...prev, dataUrl]);
                        };
                        img.src = ev.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 relative flex items-center justify-center p-2 rounded-xl transition-colors hover:bg-black/5"
                  title="Attach photo"
                >
                  <CameraIcon s={imageFiles.length > 0 ? INK : FOREST} />
                  {imageFiles.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                      style={{
                        background: INK,
                        color: "#FAFAFA",
                        fontFamily: BODY,
                        fontSize: 11,
                        fontWeight: 600,
                        width: 17,
                        height: 17,
                      }}
                    >
                      {imageFiles.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── It costs ── */}
            <div className="px-5">
              <SectionLabel text="It costs" />
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 flex-1 min-w-0 border-b border-[rgba(28,46,42,0.18)] pb-1 transition-colors focus-within:border-[#1C2E2A]">
                  <span
                    style={{
                      fontFamily: HEAD,
                      fontSize: 18,
                      color: INK,
                    }}
                  >
                    ₹
                  </span>
                  <input
                    ref={costInputRef}
                    value={costInput}
                    onChange={(e) => handleCostInputChange(e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                    className="flex-1 min-w-0 bg-transparent outline-none"
                    style={{
                      fontFamily: HEAD,
                      fontSize: 20,
                      color: INK,
                      caretColor: BLUE,
                    }}
                  />
                  {mathResult !== null && (
                    <button
                      type="button"
                      onClick={() => setCostInput(mathResult.toString())}
                      title="Click to apply calculated amount"
                      className="shrink-0 text-xs px-2 py-0.5 rounded-md hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
                      style={{
                        fontFamily: BODY,
                        background: "rgba(60,50,40,0.08)",
                        color: INK,
                        fontWeight: 600,
                      }}
                    >
                      <span>= ₹{mathResult.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                      <span className="text-[10px] opacity-50">↵</span>
                    </button>
                  )}
                </div>

                {/* Calculation Dropdown (Custom, clean, single chevron) */}
                <div className="relative shrink-0" ref={calcMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowCalcMenu((prev) => !prev)}
                    className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-full transition-all cursor-pointer"
                    style={{
                      fontFamily: BODY,
                      background: showCalcMenu ? INK : "rgba(60,50,40,0.06)",
                      color: showCalcMenu ? "#FAFAFA" : INK,
                      border: "1px solid rgba(28,46,42,0.12)",
                      fontWeight: 500,
                    }}
                  >
                    <span>+ Calculate</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${showCalcMenu ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>

                  {showCalcMenu && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl py-1.5 z-50 shadow-xl"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(28,46,42,0.12)",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
                      }}
                    >
                      {[
                        { label: "Add amount", op: "+", symbol: "+" },
                        { label: "Discount", op: "-", symbol: "−" },
                        { label: "Multiply", op: "*", symbol: "×" },
                        { label: "Split cost", op: "/", symbol: "÷" },
                      ].map((item) => (
                        <button
                          key={item.op}
                          type="button"
                          onClick={() => {
                            insertOperation(item.op);
                            setShowCalcMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs hover:bg-[rgba(60,50,40,0.06)] transition-colors text-left cursor-pointer"
                          style={{ fontFamily: BODY, color: INK }}
                        >
                          <span>{item.label}</span>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(28,46,42,0.06)",
                              color: INK,
                              fontFamily: "monospace",
                            }}
                          >
                            {item.symbol}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Life-Energy Conversion (Salary Conversion) ── */}
              {totalCost > 0 && (
                <div className="pt-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontFamily: BODY,
                          fontSize: 12.5,
                          color: INK,
                        }}
                      >
                        Costs <strong style={{ color: "#697472", fontWeight: 500 }}>{laborHours} hours</strong> of your life force
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWageEdit(!showWageEdit)}
                      className="text-[11px] underline opacity-60 hover:opacity-100 cursor-pointer"
                      style={{ fontFamily: BODY, color: INK }}
                    >
                      ₹{hourlyWage}/hr
                    </button>
                  </div>

                  {showWageEdit && (
                    <div
                      className="mt-1.5 flex items-center justify-between text-xs"
                      style={{ fontFamily: BODY, color: INK }}
                    >
                      <span className="opacity-75">Your hourly wage:</span>
                      <div className="flex items-center gap-1">
                        <span style={{ fontFamily: HEAD, color: FOREST }}>₹</span>
                        <input
                          type="number"
                          value={hourlyWage}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setHourlyWage(val);
                            localStorage.setItem("userHourlyWage", val.toString());
                          }}
                          className="w-16 bg-transparent border-b border-[rgba(28,46,42,0.25)] text-xs text-center outline-none py-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Category row ── */}
            <div className="px-5">
              <SectionLabel text="Category" />
              <div
                ref={categoryScrollRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth"
              >
                {CATEGORIES.map((cat) => {
                  const isSel = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      data-category={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full transition-all"
                      style={{
                        fontFamily: BODY,
                        fontSize: 12,
                        letterSpacing: "0.02em",
                        background: isSel ? INK : "rgba(60,50,40,0.06)",
                        color: isSel ? "#FAFAFA" : INK,
                        fontWeight: isSel ? 600 : 400,
                        boxShadow: "none",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Primary Buying Reason (Disrupting System 1 Rationalization) ── */}
            <div className="px-5">
              <SectionLabel text="Why are you buying this?" />
              <div className="flex flex-wrap gap-1.5 pb-1">
                {BUYING_REASONS.map((r) => {
                  const isSel = buyingReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setBuyingReason(r);
                        if (r !== "Other") {
                          setCustomReason("");
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full transition-all text-xs cursor-pointer"
                      style={{
                        fontFamily: BODY,
                        background: isSel ? INK : "rgba(60,50,40,0.06)",
                        color: isSel ? "#FAFAFA" : INK,
                        fontWeight: isSel ? 600 : 400,
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {/* Simple Liner Input (Shown ONLY when "Other" is selected) */}
              {buyingReason === "Other" && (
                <div className="mt-2">
                  <input
                    autoFocus
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Write your reason: e.g. feeling stressed after work…"
                    className="w-full py-1 px-0.5 text-xs outline-none bg-transparent transition-colors placeholder:text-[rgba(28,46,42,0.4)]"
                    style={{
                      fontFamily: BODY,
                      background: "transparent",
                      border: "none",
                      borderBottom: `1px solid ${customReason ? INK : "rgba(28,46,42,0.2)"}`,
                      borderRadius: 0,
                      color: INK,
                      caretColor: BLUE,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── Buying for ── */}
            <div className="px-5 pb-1">
              <SectionLabel text="Buying for" />
              <div className="grid grid-cols-3 gap-1.5">
                {FOR_OPTIONS.map(({ id, label, Icon }) => {
                  const sel = buyingFor === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBuyingFor(id)}
                      className="flex flex-row items-center justify-center gap-1.5 rounded-[12px] py-2 px-1 transition-all cursor-pointer"
                      style={{
                        background: sel ? INK : "rgba(255,255,255,0.5)",
                        border: `1px solid ${sel ? INK : DIVIDER}`,
                      }}
                    >
                      <Icon s={sel ? "#FAFAFA" : "#697472"} />
                      <span
                        style={{
                          fontFamily: BODY,
                          fontSize: 12,
                          fontWeight: 500,
                          color: sel
                            ? "rgba(240,237,232,0.9)"
                            : "#6b6058",
                          letterSpacing: "0.2px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Sticky Footer (Mobile & Desktop) ── */}
          <div className="shrink-0 px-5 pt-2.5 pb-3.5 md:pb-4 bg-[rgba(250,250,250,0.98)] border-t border-[rgba(28,46,42,0.08)] shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-20">
            <button
              onClick={handleLogAndDraw}
              disabled={!canSubmit}
              className="w-full flex items-center justify-between rounded-[18px] px-5 py-3.5 transition-all active:scale-[0.99] cursor-pointer"
              style={{
                background: canSubmit ? INK : "rgba(26,36,32,0.4)",
                opacity: canSubmit ? 1 : 0.35,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🌿</span>
                <span
                  style={{
                    fontFamily: BODY,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#FAFAFA",
                    letterSpacing: "0.3px",
                  }}
                >
                  {totalCost > 0
                    ? `Begin Somatic Pause · ⚡ ${laborHours}h life`
                    : "Begin Somatic Pause"}
                </span>
              </div>
              <div
                className="rounded-[5px] size-[9px]"
                style={{
                  background: BLUE,
                  boxShadow: `0 0 10px 0 ${BLUE}`,
                }}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}