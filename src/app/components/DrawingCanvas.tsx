import { useNavigate } from "react-router";
import { Undo2, Trash2, Check, X, Eraser, Search, Plus, Minus } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cropCanvasToArtwork } from "../utils/trimDrawing";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Point {
  x: number;
  y: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPACE = "'Fraunces', serif";
const INK = "#1C2E2A";
const BG = "#FAFAFA";

const PALETTE = [
  "#1C1C1A", // ink black
  "#FAFAFA", // white (new)
  "#7B4A2D", // umber brown
  "#E8894E", // soft orange
  "#F4A93B", // golden orange (new, fills orange gap)
  "#D4A574", // sand
  "#C1392B", // brick red
  "#E74C3C", // coral red
  "#E091A8", // dusty pink (new)
  "#D46BA3", // berry pink (new)
  "#5B8FD4", // sky blue
  "#34495E", // slate navy
  "#8E44AD", // violet
  "#2ECC71", // leaf green
  "#1ABC9C", // teal
];

const WIDTHS = [
  { id: "S", r: 8 },
  { id: "M", r: 18 },
  { id: "L", r: 32 },
];

// ── Week-based prompt system ──────────────────────────────────────────────────
const WEEK_PROMPTS: string[][] = [
  [
    "draw a fruit you recently ate",
    "draw the fruit you love the most",
    "draw a fruit that is orange",
    "draw two fruits that look alike but are different",
    "draw a fruit with seeds inside",
    "draw the tiniest fruit you know",
    "draw a tropical fruit",
  ],
  [
    "draw a silly cartoon face",
    "draw a very surprised cartoon face",
    "draw a cartoon alien with huge eyes",
    "draw a happy monster face",
    "draw a sleepy cartoon face",
    "draw a grumpy cartoon character",
    "draw a cartoon face from outer space",
  ],
  [
    "draw a tree you remember from childhood",
    "draw a spiky cactus",
    "draw a flower with too many petals",
    "draw a plant with giant leaves",
    "draw a glowing mushroom",
    "draw a vine climbing a wall",
    "draw a tiny seed sprouting underground",
  ],
  [
    "draw a pet you'd love to have",
    "draw the fastest animal you know",
    "draw a deep sea creature",
    "draw an animal covered in spots",
    "draw a forest animal hiding in leaves",
    "draw a bird in mid-flight",
    "draw an animal you invented",
  ],
  [
    "draw a friendly alien visitor",
    "draw a planet you invented",
    "draw a cozy little spaceship",
    "draw something that might live on Mars",
    "draw a star constellation",
    "draw a tiny astronaut exploring",
    "draw an alien's pet",
  ],
  [
    "draw a person doing something funny",
    "draw a tiny human next to something enormous",
    "draw a dancer mid-spin",
    "draw someone happily cooking",
    "draw a person in a rainbow raincoat",
    "draw an explorer discovering something new",
    "draw a figure made entirely of shapes",
  ],
];

const WEEK_THEMES = [
  "fruits",
  "cartoon faces",
  "plants & trees",
  "animals",
  "aliens & space",
  "people & figures",
];

async function saveUrgeLog(entry: {
  item_name: string;
  item_price: number;
  emotion_tag: string;
  drawing_data: string;
}) {
  let uid = localStorage.getItem("bloom_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("bloom_uid", uid);
  }

  // Mock API response since we don't have a backend in this environment
  const mockKey = `urge_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem("currentUrgeKey", mockKey);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
}

function getAppStartDate(): Date {
  const stored = localStorage.getItem("appStartDate");
  if (stored) return new Date(stored);
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  localStorage.setItem("appStartDate", monday.toISOString());
  return monday;
}

function getPrompt(): string {
  const start = getAppStartDate();
  const today = new Date();
  const daysDiff = Math.max(
    0,
    Math.floor(
      (today.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const weekIdx =
    Math.floor(daysDiff / 7) % WEEK_PROMPTS.length;
  const dayIdx = daysDiff % 7;
  return WEEK_PROMPTS[weekIdx][dayIdx] ?? WEEK_PROMPTS[0][0];
}

function getWeekTheme(): string {
  const start = getAppStartDate();
  const today = new Date();
  const daysDiff = Math.max(
    0,
    Math.floor(
      (today.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  return WEEK_THEMES[
    Math.floor(daysDiff / 7) % WEEK_THEMES.length
  ];
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const h = hex.replace("#", "").padEnd(6, "0");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function clamp(v: number) {
  return Math.min(255, Math.max(0, Math.round(v)));
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  h = ((h % 360) + 360) % 360; // normalize
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    h /= 360;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
}

// ── Catmull-Rom spline ────────────────────────────────────────────────────────
function crPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const t2 = t * t,
    t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function smoothSpline(raw: Point[], steps = 4): Point[] {
  if (raw.length < 2) return [...raw];
  const n = raw.length;
  const out: Point[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = raw[Math.max(0, i - 1)];
    const p1 = raw[i];
    const p2 = raw[i + 1];
    const p3 = raw[Math.min(n - 1, i + 2)];
    for (let s = 0; s < steps; s++)
      out.push(crPoint(p0, p1, p2, p3, s / steps));
  }
  out.push(raw[n - 1]);
  return out;
}

// ── Stroke outline polygon (perpendicular offsets) ────────────────────────────
function buildOutline(
  pts: Point[],
  widths: number[],
): { L: Point[]; R: Point[] } {
  const L: Point[] = [],
    R: Point[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len,
      ny = dx / len; // left normal
    const w = widths[i] * 0.5;
    L.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w });
    R.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
  }
  return { L, R };
}

// Draws the stroke polygon path using quadraticCurveTo midpoints + arc end-caps.
// Does not fill or clip — caller handles that.
function tracePath(
  ctx: CanvasRenderingContext2D,
  L: Point[],
  R: Point[],
  spline: Point[],
  smW: number[],
) {
  const n = spline.length;
  if (n < 2 || L.length < 2) return;

  const startAngle = Math.atan2(
    spline[1].y - spline[0].y,
    spline[1].x - spline[0].x,
  );
  const endAngle = Math.atan2(
    spline[n - 1].y - spline[n - 2].y,
    spline[n - 1].x - spline[n - 2].x,
  );

  ctx.beginPath();
  // Rounded start cap
  ctx.arc(
    spline[0].x,
    spline[0].y,
    Math.max(0.5, smW[0] * 0.5),
    startAngle + Math.PI * 0.5,
    startAngle - Math.PI * 0.5,
  );

  // Left side: forward
  for (let i = 0; i < L.length - 1; i++) {
    const mx = (L[i].x + L[i + 1].x) * 0.5,
      my = (L[i].y + L[i + 1].y) * 0.5;
    ctx.quadraticCurveTo(L[i].x, L[i].y, mx, my);
  }
  ctx.lineTo(L[L.length - 1].x, L[L.length - 1].y);

  // Rounded end cap
  ctx.arc(
    spline[n - 1].x,
    spline[n - 1].y,
    Math.max(0.5, smW[n - 1] * 0.5),
    endAngle - Math.PI * 0.5,
    endAngle + Math.PI * 0.5,
  );

  // Right side: backward
  for (let i = R.length - 1; i > 0; i--) {
    const mx = (R[i].x + R[i - 1].x) * 0.5,
      my = (R[i].y + R[i - 1].y) * 0.5;
    ctx.quadraticCurveTo(R[i].x, R[i].y, mx, my);
  }
  ctx.lineTo(R[0].x, R[0].y);
  ctx.closePath();
}

// ── Main stroke renderer ──────────────────────────────────────────────────────
// Excalidraw-style: smooth spline → filled polygon with optional grain texture.
function renderCrayonStroke(
  ctx: CanvasRenderingContext2D,
  raw: Point[],
  color: string,
  maxR: number,
  withTexture: boolean,
) {
  if (raw.length < 2) return;

  const spline = smoothSpline(raw);
  const n = spline.length;
  if (n < 2) return;

  // Velocity-based width, no start taper
  let emaVel = 0;
  const widths = spline.map((pt, i) => {
    if (i === 0) return maxR;
    const vel = Math.hypot(
      pt.x - spline[i - 1].x,
      pt.y - spline[i - 1].y,
    );
    emaVel = emaVel * 0.76 + vel * 0.24;
    const pressure = Math.max(
      0.28,
      1 - Math.min(emaVel * 0.1, 0.72),
    );
    return maxR * pressure;
  });

  // 5-point moving average on widths — removes spline-step jitter
  const smW = widths.map((_, i) => {
    let s = 0,
      c = 0;
    for (
      let j = Math.max(0, i - 2);
      j <= Math.min(n - 1, i + 2);
      j++
    ) {
      s += widths[j];
      c++;
    }
    return s / c;
  });

  const { L, R } = buildOutline(spline, smW);
  const { r, g, b } = hexToRgb(color);

  // ── Fill pass ──
  ctx.save();
  tracePath(ctx, L, R, spline, smW);
  ctx.fillStyle = `rgba(${r},${g},${b},1)`;
  ctx.fill();
  ctx.restore();

  // ── Grain texture pass (only on pointerup) ──
  if (withTexture) {
    const allX = L.map((p) => p.x).concat(R.map((p) => p.x));
    const allY = L.map((p) => p.y).concat(R.map((p) => p.y));
    const minX = Math.min(...allX),
      maxX = Math.max(...allX);
    const minY = Math.min(...allY),
      maxY = Math.max(...allY);
    const count = Math.min(
      1600,
      Math.floor((maxX - minX) * (maxY - minY) * 0.038),
    );

    ctx.save();
    tracePath(ctx, L, R, spline, smW);
    ctx.clip();

    for (let i = 0; i < count; i++) {
      const gx = minX + Math.random() * (maxX - minX);
      const gy = minY + Math.random() * (maxY - minY);
      const sz = 0.35 + Math.random() * 1.1;
      const op = Math.random() * 0.2;
      const dr = Math.round((Math.random() - 0.5) * 45);
      const dg = Math.round((Math.random() - 0.5) * 45);
      const db = Math.round((Math.random() - 0.5) * 45);
      ctx.beginPath();
      ctx.arc(gx, gy, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${clamp(r + dr)},${clamp(g + dg)},${clamp(b + db)},${op.toFixed(2)})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Eraser ────────────────────────────────────────────────────────────────────
function paintEraserSegment(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  radius: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const steps = Math.max(
    1,
    Math.floor(Math.hypot(dx, dy) / (radius * 0.35)),
  );
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    ctx.beginPath();
    ctx.arc(
      from.x + dx * t,
      from.y + dy * t,
      radius,   // no more *1.6
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fill();
  }
  ctx.restore();
}

// ── Versa Stamp Generator ─────────────────────────────────────────────────────
function getStamps(
  color: string,
  diameter: number,
  dynamic: boolean,
  stampCache: Record<string, HTMLCanvasElement[]>,
): HTMLCanvasElement[] {
  const key = `${color}-${diameter}-${dynamic}`;
  if (stampCache[key]) return stampCache[key];

  const baseSize = diameter;
  const numStamps = dynamic ? 8 : 3;
  const stamps: HTMLCanvasElement[] = [];

  const { r, g, b } = hexToRgb(color);
  const [h, s, l] = rgbToHsl(r, g, b);

  for (let i = 0; i < numStamps; i++) {
    const canvas = document.createElement("canvas");
    const size = Math.ceil(baseSize * 3);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    let curR = r,
      curG = g,
      curB = b;
    if (dynamic && i > 0) {
      const dh = (Math.random() - 0.5) * 12; // ±6 degrees
      const ds = (Math.random() - 0.5) * 0.08; // ±4%
      const dl = (Math.random() - 0.5) * 0.08; // ±4%
      const [nr, ng, nb] = hslToRgb(
        h + dh,
        Math.max(0, Math.min(1, s + ds)),
        Math.max(0, Math.min(1, l + dl)),
      );
      curR = nr;
      curG = ng;
      curB = nb;
    }

    ctx.fillStyle = `rgb(${curR}, ${curG}, ${curB})`;
    ctx.beginPath();
    const numPoints = 14;
    for (let j = 0; j < numPoints; j++) {
      const angle = (j / numPoints) * Math.PI * 2;
      const rad =
        (baseSize / 2) * (0.85 + Math.random() * 0.25);
      const x = size / 2 + Math.cos(angle) * rad;
      const y =
        size / 2 +
        Math.sin(angle) * rad * (0.75 + Math.random() * 0.1);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = "destination-out";
    const numGrains = Math.floor(baseSize * baseSize * 0.35);
    for (let k = 0; k < numGrains; k++) {
      const gx =
        size / 2 + (Math.random() - 0.5) * baseSize * 1.3;
      const gy =
        size / 2 + (Math.random() - 0.5) * baseSize * 1.3;
      const gr = 0.6 + Math.random() * 1.2;
      ctx.globalAlpha = 0.4 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    stamps.push(canvas);
  }
  stampCache[key] = stamps;
  return stamps;
}

// ── Timer ring ────────────────────────────────────────────────────────────────
function TimerRing({
  timeLeft,
  duration,
  color,
}: {
  timeLeft: number;
  duration: number;
  color: string;
}) {
  const R = 20,
    C = 2 * Math.PI * R;
  const overtime = timeLeft < 0;
  const abs = Math.abs(timeLeft);
  const pct = overtime
    ? 0
    : duration > 0
      ? timeLeft / duration
      : 0;
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  const timeStr =
    mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  const label = overtime ? `+${timeStr}` : timeStr;
  const ringColor = overtime ? "rgba(180,50,30,0.75)" : color;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 52, height: 52 }}
    >
      <svg
        viewBox="0 0 52 52"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          stroke="rgba(28,46,42,0.1)"
          strokeWidth="3"
        />
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={overtime ? 0 : C * (1 - pct)}
          style={{
            transition:
              "stroke-dashoffset 1s linear, stroke 0.4s",
          }}
        />
      </svg>
      <span
        style={{
          fontFamily: SPACE,
          fontSize: overtime ? 8 : 10,
          fontWeight: 600,
          color: overtime ? "rgba(180,50,30,0.85)" : INK,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DrawingCanvas() {
  const navigate = useNavigate();
  // trigger hmr

  const [emotion] = useState<any>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("currentEmotion") || "null",
      );
    } catch {
      return null;
    }
  });
  const [urgeItem] = useState(
    () => localStorage.getItem("urgeItem") || "",
  );
  const price =
    parseFloat(localStorage.getItem("purchaseCost") || "0") ||
    0;
  const laborHours =
    localStorage.getItem("laborHours") ||
    (price > 0 ? (price / 500).toFixed(1) : "0");

  const somaticDuration = useMemo(() => {
    if (price <= 50) return Math.min(75, Math.max(60, Math.round(60 + price * 0.3)));
    if (price <= 1000) return Math.min(75, Math.max(60, Math.round(60 + (price / 1000) * 15)));
    if (price <= 5000) return Math.min(120, Math.max(75, Math.round(75 + ((price - 1000) / 4000) * 45)));
    return Math.min(240, Math.max(120, Math.round(120 + ((price - 5000) / 10000) * 120)));
  }, [price]);

  const somaticTask = useMemo(() => {
    if (price < 1000) return "Draw a single flower or calming spiral to soothe System 1 impulse.";
    if (price <= 5000) return "Draw a wildflower cluster — feel the physical friction of each stroke.";
    return "Draw an imagination tree or free scribble — grounding your nervous system.";
  }, [price]);

  const duration = somaticDuration;
  const moodHex =
    typeof emotion?.hex === "string" &&
    emotion.hex.startsWith("#")
      ? emotion.hex
      : "#5A9469";

  // Curated 6 colors: ink, mood color, warm terracotta, amber, calm blue, chalk white
  const SIX_PALETTE = useMemo(() => {
    const list = ["#1C2E2A", moodHex, "#C45B38", "#F4A93B", "#5B8FD4", "#FAFAFA"];
    const unique = Array.from(new Set(list));
    const backup = ["#4DAA57", "#8E44AD", "#D4708A", "#7B4A2D"];
    for (const b of backup) {
      if (unique.length < 6 && !unique.includes(b)) unique.push(b);
    }
    return unique.slice(0, 6);
  }, [moodHex]);

  const [activeColor, setActiveColor] = useState(moodHex);
  const [activeWidth, setActiveWidth] = useState("M");
  const [brushMode] = useState<"versa">("versa");
  const [isEraser, setIsEraser] = useState(false);
  const [popover, setPopover] = useState<
    "color" | "width" | "zoom" | null
  >(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const canvasLogicalWidth = useRef(0);
  const canvasLogicalHeight = useRef(0);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const prompt = useRef(getPrompt()).current;
  const timerDone = timeLeft <= 0;

  // ── Refs ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDown = useRef(false);
  const lastPt = useRef<Point | null>(null);
  const firstPt = useRef<Point | null>(null);
  const currentPts = useRef<Point[]>([]);
  const snapshots = useRef<ImageData[]>([]);
  const vecStrokes = useRef<any[]>([]);
  const stampCache = useRef<
    Record<string, HTMLCanvasElement[]>
  >({});
  const versaRef = useRef({
    emaVel: 0,
    remainder: 0,
    lastPt: null as Point | null,
    lastTime: 0,
  });

  const colorRef = useRef(activeColor);
  const radiusRef = useRef(12);
  const eraserRef = useRef(false);
  const brushModeRef = useRef(brushMode);
  const hasStartedRef = useRef(false);

  colorRef.current = activeColor;
  radiusRef.current = WIDTHS.find(
    (w) => w.id === activeWidth,
  )!.r;
  eraserRef.current = isEraser;
  brushModeRef.current = brushMode;
  hasStartedRef.current = hasStarted;

  // ── Canvas init ──
  useEffect(() => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasLogicalWidth.current = rect.width;
    canvasLogicalHeight.current = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.getContext("2d")!.scale(dpr, dpr);
  }, []);

  // Multi-touch pinch-to-zoom tracking
  const pointersRef = useRef<
    Map<number, { x: number; y: number }>
  >(new Map());
  const pinchRef = useRef<{
    dist: number;
    zoom: number;
    midX: number;
    midY: number;
    panX: number;
    panY: number;
  } | null>(null);

  function pinchDistance() {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  function getPoint(e: { clientX: number; clientY: number }): Point {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    return {
      x: normX * (canvasLogicalWidth.current || rect.width),
      y: normY * (canvasLogicalHeight.current || rect.height),
    };
  }

  function saveSnapshot() {
    const canvas = canvasRef.current!;
    const snap = canvas
      .getContext("2d")!
      .getImageData(0, 0, canvas.width, canvas.height);
    snapshots.current.push(snap);
    if (snapshots.current.length > 60)
      snapshots.current.shift();
  }

  function restoreStrokeStart() {
    const snap =
      snapshots.current[snapshots.current.length - 1];
    if (snap)
      canvasRef
        .current!.getContext("2d")!
        .putImageData(snap, 0, 0);
  }

  // ── Pointer & Touch events ──
  useEffect(() => {
    const canvas = canvasRef.current!;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length >= 2) {
        if (isDown.current) {
          restoreStrokeStart();
          isDown.current = false;
          currentPts.current = [];
          firstPt.current = null;
          lastPt.current = null;
        }
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        pinchRef.current = {
          dist,
          zoom: zoomRef.current,
          midX,
          midY,
          panX: panRef.current.x,
          panY: panRef.current.y,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length >= 2 && pinchRef.current) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        if (dist > 0 && pinchRef.current.dist > 0) {
          const scaleFactor = dist / pinchRef.current.dist;
          const nextZoom = Math.max(
            0.5,
            Math.min(3.5, +(pinchRef.current.zoom * scaleFactor).toFixed(2)),
          );
          const deltaX = midX - pinchRef.current.midX;
          const deltaY = midY - pinchRef.current.midY;
          setZoom(nextZoom);
          setPan({
            x: Math.round(pinchRef.current.panX + deltaX),
            y: Math.round(pinchRef.current.panY + deltaY),
          });
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        pinchRef.current = null;
      }
    }

    function onDown(e: PointerEvent) {
      e.preventDefault();
      if (e.pointerType === "mouse") {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {}
      }

      pointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (pointersRef.current.size >= 2 || pinchRef.current) {
        if (isDown.current) {
          restoreStrokeStart();
          isDown.current = false;
          currentPts.current = [];
          firstPt.current = null;
          lastPt.current = null;
        }
        return;
      }

      if (!hasStartedRef.current) setHasStarted(true);

      const pt = getPoint(e);
      saveSnapshot();
      isDown.current = true;
      firstPt.current = pt;
      lastPt.current = pt;
      currentPts.current = [pt];
      setHasDrawn(true);

      const diameter = radiusRef.current;
      versaRef.current = {
        emaVel: 0,
        remainder: diameter * 0.08,
        lastPt: pt,
        lastTime: e.timeStamp,
      };

      const ctx = canvas.getContext("2d")!;
      if (
        brushModeRef.current !== "classic" &&
        !eraserRef.current
      ) {
        const stamps = getStamps(
          colorRef.current,
          diameter,
          brushModeRef.current === "versa-dynamic",
          stampCache.current,
        );
        const stamp =
          stamps[Math.floor(Math.random() * stamps.length)];
        const finalSizeMult = 0.6 * (0.9 + Math.random() * 0.2);
        const finalSize = diameter * 3.0 * finalSizeMult;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(
          ((Math.random() - 0.5) * 60 * Math.PI) / 180,
        );
        ctx.globalAlpha = 0.06;
        ctx.drawImage(
          stamp,
          -finalSize / 2,
          -finalSize / 2,
          finalSize,
          finalSize,
        );
        ctx.restore();
      }

      navigator.vibrate?.(2);
    }

    function onMove(e: PointerEvent) {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      if (pinchRef.current || pointersRef.current.size >= 2) return;
      if (!isDown.current || !lastPt.current) return;
      e.preventDefault();

      const pt = getPoint(e);
      const ctx = canvas.getContext("2d")!;

      if (eraserRef.current) {
        paintEraserSegment(
          ctx,
          lastPt.current,
          pt,
          radiusRef.current,
        );
        lastPt.current = pt;
        return;
      }

      if (brushModeRef.current === "classic") {
        currentPts.current.push(pt);
        lastPt.current = pt;

        restoreStrokeStart();
        renderCrayonStroke(
          ctx,
          currentPts.current,
          colorRef.current,
          radiusRef.current,
          false,
        );
      } else {
        const now = e.timeStamp;
        const dt = Math.max(1, now - versaRef.current.lastTime);
        const lpt = versaRef.current.lastPt || firstPt.current!;
        const dx = pt.x - lpt.x;
        const dy = pt.y - lpt.y;
        const dist = Math.hypot(dx, dy);

        const vel = dist / dt;
        versaRef.current.emaVel =
          versaRef.current.emaVel * 0.7 + vel * 0.3;
        const smoothVel = versaRef.current.emaVel;
        const pressure = Math.min(1, smoothVel / 1.5);

        const diameter = radiusRef.current;
        const spacing = Math.max(1, diameter * 0.08);

        let distToStamp = versaRef.current.remainder;

        const stamps = getStamps(
          colorRef.current,
          diameter,
          brushModeRef.current === "versa-dynamic",
          stampCache.current,
        );

        ctx.save();
        while (distToStamp <= dist) {
          const t = dist === 0 ? 0 : distToStamp / dist;
          const cx = lpt.x + dx * t;
          const cy = lpt.y + dy * t;

          const opacity = 0.06 + pressure * 0.94;
          const sizeMult = 0.6 + pressure * 0.6;
          const finalSizeMult =
            sizeMult * (0.9 + Math.random() * 0.2);
          const finalSize = diameter * 3.0 * finalSizeMult;

          const stamp =
            stamps[Math.floor(Math.random() * stamps.length)];
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(
            ((Math.random() - 0.5) * 60 * Math.PI) / 180,
          );
          ctx.globalAlpha = opacity;
          ctx.drawImage(
            stamp,
            -finalSize / 2,
            -finalSize / 2,
            finalSize,
            finalSize,
          );
          ctx.restore();

          distToStamp += spacing;
        }
        ctx.restore();

        versaRef.current.remainder = distToStamp - dist;
        versaRef.current.lastPt = pt;
        versaRef.current.lastTime = now;

        currentPts.current.push(pt);
        lastPt.current = pt;
      }

      navigator.vibrate?.(1);
    }

    function onUp(e: PointerEvent) {
      if (e.pointerType === "mouse") {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
      }
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;

      if (!isDown.current) return;
      isDown.current = false;
      navigator.vibrate?.(1);

      const pts = currentPts.current;
      const ctx = canvas.getContext("2d")!;

      if (
        !eraserRef.current &&
        pts.length >= 1 &&
        firstPt.current
      ) {
        if (brushModeRef.current === "classic" && pts.length >= 2) {
          restoreStrokeStart();
          renderCrayonStroke(
            ctx,
            pts,
            colorRef.current,
            radiusRef.current,
            true,
          );
        }
        vecStrokes.current.push({
          points: [...pts],
          color: colorRef.current,
          width: radiusRef.current * 0.55,
          closed: false,
        });
      }

      currentPts.current = [];
      firstPt.current = null;
      lastPt.current = null;
    }

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    canvas.addEventListener("pointerdown", onDown, {
      passive: false,
    });
    canvas.addEventListener("pointermove", onMove, {
      passive: false,
    });
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);

      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // ── Timer — runs negative after zero (overtime) ──
  useEffect(() => {
    if (!hasStarted) return;
    const id = setInterval(
      () => setTimeLeft((t) => t - 1),
      1000,
    );
    return () => clearInterval(id);
  }, [hasStarted]);

  // ── Actions ──
  function handleUndo() {
    vecStrokes.current.pop();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    if (snapshots.current.length > 0) {
      ctx.putImageData(snapshots.current.pop()!, 0, 0);
      if (vecStrokes.current.length === 0) setHasDrawn(false);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }

  function handleClear() {
    canvasRef
      .current!.getContext("2d")!
      .clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height,
      );
    vecStrokes.current = [];
    snapshots.current = [];
    setHasDrawn(false);
  }

  async function handleDone() {
    const canvas = canvasRef.current!;
    let drawingDataUrl = "";

    if (hasDrawn) {
      drawingDataUrl = cropCanvasToArtwork(canvas);
      if (drawingDataUrl) {
        localStorage.setItem("currentDrawing", drawingDataUrl);
      } else {
        localStorage.removeItem("currentDrawing");
      }
    } else {
      localStorage.removeItem("currentDrawing");
    }

    localStorage.setItem("drawingCompleted", "true");

    const emotion = JSON.parse(
      localStorage.getItem("currentEmotion") || "{}",
    );

    await saveUrgeLog({
      item_name: localStorage.getItem("urgeItem") ?? "",
      item_price: parseFloat(
        localStorage.getItem("purchaseCost") ?? "0",
      ),
      emotion_tag: emotion?.name ?? "Stressed",
      drawing_data: drawingDataUrl,
    });

    navigate("/plant");
  }

  const floatCard: React.CSSProperties = {
    background: "rgba(252,252,252,0.93)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(28,46,42,0.1)",
    boxShadow: "0 2px 16px rgba(28,46,42,0.1)",
  };

  const activeR = WIDTHS.find((w) => w.id === activeWidth)!.r;

  function togglePopover(p: "color" | "width" | "zoom") {
    setPopover((prev) => (prev === p ? null : p));
  }

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        background: "#FAFAFA",
        touchAction: "none",
        userSelect: "none",
      }}
      onClick={() => setPopover(null)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: "none",
          cursor: isEraser ? "cell" : "crosshair",
          display: "block",
          transformOrigin: "center center",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          willChange: "transform",
        }}
      />

      {/* Floating zoom/pan indicator & reset button when zoomed or panned */}
      {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
        <div className="absolute top-20 right-4 z-40 pointer-events-auto">
          <motion.button
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md transition-colors hover:bg-[rgba(28,46,42,0.04)]"
            style={{
              ...floatCard,
              borderColor: "rgba(77, 170, 87, 0.4)",
            }}
            title="Reset canvas zoom & position"
          >
            <span
              style={{
                fontFamily: SPACE,
                fontSize: 10,
                fontWeight: 600,
                color: INK,
                letterSpacing: "0.04em",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <span
              style={{
                fontFamily: SPACE,
                fontSize: 9,
                fontWeight: 700,
                color: "#4DAA57",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Reset
            </span>
          </motion.button>
        </div>
      )}

      {/* Prompt placeholder */}
      {/* Somatic Prompt placeholder */}
      {!hasDrawn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8 gap-2">
          <p
            style={{
              fontFamily: SPACE,
              fontSize: "clamp(9px, 2.2vw, 11px)",
              color: "#4DAA57",
              letterSpacing: "0.14em",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Somatic Intervention · {duration}s Pause
          </p>
          <p
            style={{
              fontFamily: "'Passion One', sans-serif",
              fontSize: "clamp(16px, 4vw, 22px)",
              color: INK,
              letterSpacing: "0.02em",
              textAlign: "center",
              lineHeight: 1.3,
              maxWidth: 360,
            }}
          >
            {somaticTask}
          </p>
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 12,
              color: "rgba(26,36,32,0.45)",
              textAlign: "center",
            }}
          >
            ⚡ That's {laborHours}h of work to earn · Take a slow breath
          </p>
        </div>
      )}

      {/* ── Top row ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-5 pointer-events-none z-30"
        style={{
          paddingTop:
            "max(env(safe-area-inset-top, 0px), 14px)",
        }}
      >
        {/* Left: Urge Item tag */}
        <div className="flex items-center min-w-0 pointer-events-auto">
          {urgeItem ? (
            <div
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full max-w-[125px] sm:max-w-[200px]"
              style={floatCard}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: moodHex,
                  flexShrink: 0,
                }}
              />
              <span
                className="truncate"
                style={{
                  fontFamily: SPACE,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  color: INK,
                }}
              >
                {urgeItem}
              </span>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Center: Timer ring */}
        <div
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl pointer-events-auto"
          style={floatCard}
        >
          <TimerRing
            timeLeft={timeLeft}
            duration={duration}
            color={moodHex}
          />
        </div>

        {/* Right: Exit / Cross button */}
        <div className="flex items-center justify-end pointer-events-auto">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(28,46,42,0.06)]"
            style={floatCard}
            aria-label="Close canvas"
          >
            <X className="w-4 h-4" style={{ color: INK }} />
          </button>
        </div>
      </div>

      {/* ── Bottom unified toolbar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center px-3 sm:px-4 pointer-events-none z-30"
        style={{
          paddingBottom:
            "max(env(safe-area-inset-bottom, 0px), 20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden color input for custom picker */}
        <input
          ref={colorInputRef}
          type="color"
          value={activeColor}
          onChange={(e) => {
            setActiveColor(e.target.value);
            setIsEraser(false);
          }}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: "none",
          }}
        />

        <div className="relative flex items-center pointer-events-auto">
          {/* ── The unified floating bar ── */}
          <div
            className="flex items-center gap-0 rounded-full"
            style={{
              ...floatCard,
              padding: "5px 6px",
              boxShadow: "0 4px 24px rgba(28,46,42,0.12), 0 1px 6px rgba(28,46,42,0.08)",
            }}
          >
            {/* Zoom button with vertical popover */}
            <div className="relative flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => togglePopover("zoom")}
                className="h-9 px-2.5 flex items-center gap-1.5 rounded-full transition-all duration-150"
                style={{
                  background:
                    popover === "zoom"
                      ? "rgba(28,46,42,0.08)"
                      : "transparent",
                }}
                title="Zoom level"
              >
                <Search
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(28,46,42,0.6)" }}
                />
                <span
                  style={{
                    fontFamily: SPACE,
                    fontSize: 11,
                    fontWeight: 600,
                    color: INK,
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
              </motion.button>

              {/* Vertical Zoom Popover */}
              <AnimatePresence>
                {popover === "zoom" && (
                  <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.92 }}
                      transition={{
                        type: "spring",
                        damping: 26,
                        stiffness: 360,
                      }}
                      className="flex flex-col items-center p-1.5 rounded-2xl"
                      style={{
                        ...floatCard,
                        boxShadow:
                          "0 8px 32px rgba(28,46,42,0.14), 0 2px 10px rgba(28,46,42,0.08)",
                      }}
                    >
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() =>
                          setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))
                        }
                        disabled={zoom >= 3}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-[rgba(28,46,42,0.06)] disabled:opacity-30 disabled:pointer-events-none"
                        title="Zoom In"
                      >
                        <Plus className="w-4 h-4" style={{ color: INK }} />
                      </motion.button>

                      <button
                        onClick={() => {
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        className="px-2 py-1 my-0.5 rounded-lg transition-colors hover:bg-[rgba(28,46,42,0.06)]"
                        title="Reset zoom to 100%"
                      >
                        <span
                          style={{
                            fontFamily: SPACE,
                            fontSize: 10,
                            fontWeight: 600,
                            color: INK,
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Math.round(zoom * 100)}%
                        </span>
                      </button>

                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() =>
                          setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
                        }
                        disabled={zoom <= 0.5}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-[rgba(28,46,42,0.06)] disabled:opacity-30 disabled:pointer-events-none"
                        title="Zoom Out"
                      >
                        <Minus className="w-4 h-4" style={{ color: INK }} />
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 22,
                background: "rgba(28,46,42,0.1)",
                margin: "0 3px",
                flexShrink: 0,
              }}
            />

            {/* Eraser */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                setIsEraser((e) => !e);
                setPopover(null);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                background: isEraser
                  ? "rgba(28,46,42,0.1)"
                  : "transparent",
              }}
              title="Eraser"
            >
              <Eraser
                className="w-[16px] h-[16px]"
                style={{
                  color: isEraser ? INK : "rgba(28,46,42,0.4)",
                }}
              />
            </motion.button>

            {/* Color swatch button with Popover */}
            <div className="relative flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => togglePopover("color")}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  background:
                    popover === "color"
                      ? `${activeColor}18`
                      : "transparent",
                }}
                title="Color palette"
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: isEraser
                      ? "rgba(28,46,42,0.2)"
                      : activeColor,
                    boxShadow: isEraser
                      ? "none"
                      : `0 1px 6px ${activeColor}66`,
                    border:
                      activeColor === "#FAFAFA" && !isEraser
                        ? "1px solid rgba(0,0,0,0.12)"
                        : "none",
                    transition: "background 0.15s, box-shadow 0.15s",
                  }}
                />
              </motion.button>

              {/* Color Popover — Single clean row: 6 colors + custom color selector */}
              <AnimatePresence>
                {popover === "color" && (
                  <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.92 }}
                      transition={{
                        type: "spring",
                        damping: 26,
                        stiffness: 360,
                      }}
                      className="rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-xl whitespace-nowrap"
                      style={{
                        ...floatCard,
                        boxShadow:
                          "0 8px 32px rgba(28,46,42,0.16), 0 2px 10px rgba(28,46,42,0.08)",
                      }}
                    >
                      {SIX_PALETTE.map((hex, i) => {
                        const isSel =
                          activeColor.toLowerCase() === hex.toLowerCase() &&
                          !isEraser;
                        return (
                          <button
                            key={hex + i}
                            type="button"
                            onClick={() => {
                              setActiveColor(hex);
                              setIsEraser(false);
                              setPopover(null);
                            }}
                            className="rounded-full transition-all duration-150 shrink-0 relative hover:scale-105 active:scale-95"
                            style={{
                              width: 26,
                              height: 26,
                              background: hex,
                              boxShadow: isSel
                                ? `0 0 0 2px ${BG}, 0 0 0 4px ${hex}`
                                : `inset 0 -1px 2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)`,
                              transform: isSel ? "scale(1.15)" : "scale(1)",
                              border:
                                hex.toUpperCase() === "#FAFAFA" ||
                                hex.toUpperCase() === "#FFFFFF"
                                  ? "1px solid rgba(0,0,0,0.16)"
                                  : "none",
                            }}
                            title={hex}
                          />
                        );
                      })}

                      {/* Custom color picker button */}
                      {(() => {
                        const isCustomSelected =
                          !isEraser &&
                          !SIX_PALETTE.some(
                            (c) => c.toLowerCase() === activeColor.toLowerCase(),
                          );
                        return (
                          <label
                            className="relative rounded-full transition-all duration-150 shrink-0 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95"
                            style={{
                              width: 26,
                              height: 26,
                              background: isCustomSelected
                                ? activeColor
                                : "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                              border: isCustomSelected
                                ? "2px solid #FAFAFA"
                                : "2px solid rgba(255,255,255,0.9)",
                              boxShadow: isCustomSelected
                                ? `0 0 0 2px ${BG}, 0 0 0 4px ${activeColor}`
                                : "0 1px 4px rgba(0,0,0,0.18)",
                              transform: isCustomSelected
                                ? "scale(1.15)"
                                : "scale(1)",
                            }}
                            title="Custom Color"
                          >
                            <input
                              type="color"
                              value={
                                activeColor.startsWith("#")
                                  ? activeColor
                                  : "#4DAA57"
                              }
                              onChange={(e) => {
                                setActiveColor(e.target.value);
                                setIsEraser(false);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 m-0 border-0"
                              style={{
                                appearance: "none",
                                WebkitAppearance: "none",
                              }}
                            />
                          </label>
                        );
                      })()}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 22,
                background: "rgba(28,46,42,0.1)",
                margin: "0 3px",
                flexShrink: 0,
              }}
            />

            {/* Width button with Popover */}
            <div className="relative flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => togglePopover("width")}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  background:
                    popover === "width"
                      ? "rgba(28,46,42,0.08)"
                      : "transparent",
                }}
                title="Stroke width"
              >
                <div
                  style={{
                    height:
                      activeR === 8
                        ? 1.5
                        : activeR === 18
                          ? 3.5
                          : 6,
                    width: 20,
                    borderRadius: 99,
                    background: isEraser
                      ? "rgba(28,46,42,0.35)"
                      : activeColor,
                    transition: "background 0.15s",
                  }}
                />
              </motion.button>

              {/* Width Popover */}
              <AnimatePresence>
                {popover === "width" && (
                  <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.92 }}
                      transition={{
                        type: "spring",
                        damping: 26,
                        stiffness: 360,
                      }}
                      className="rounded-[20px] p-3.5"
                      style={{
                        ...floatCard,
                        minWidth: 170,
                        boxShadow:
                          "0 8px 40px rgba(28,46,42,0.14), 0 2px 12px rgba(28,46,42,0.08)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: SPACE,
                          fontSize: 8,
                          letterSpacing: "0.14em",
                          color: "rgba(28,46,42,0.4)",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        stroke width
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {(["S", "M", "L"] as const).map((wId) => {
                          const w = WIDTHS.find((x) => x.id === wId)!;
                          const active = activeWidth === w.id;
                          const label =
                            w.id === "S"
                              ? "Thin"
                              : w.id === "M"
                                ? "Mid"
                                : "Maiden";
                          const lineH =
                            w.id === "S" ? 1.5 : w.id === "M" ? 3.5 : 6;
                          return (
                            <button
                              key={w.id}
                              onClick={() => {
                                setActiveWidth(w.id);
                                setPopover(null);
                              }}
                              className="flex items-center gap-3 h-9 px-3 rounded-xl transition-all duration-150"
                              style={{
                                background: active
                                  ? `${isEraser ? "#1A2420" : activeColor}15`
                                  : "transparent",
                                border: `1.5px solid ${active ? (isEraser ? "#1A2420" : activeColor) + "44" : "transparent"}`,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: SPACE,
                                  fontSize: 10,
                                  fontWeight: active ? 600 : 400,
                                  color: active
                                    ? INK
                                    : "rgba(28,46,42,0.5)",
                                  letterSpacing: "0.06em",
                                  width: 44,
                                  textAlign: "left",
                                }}
                              >
                                {label}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: lineH,
                                  borderRadius: 99,
                                  background: active
                                    ? isEraser
                                      ? "#1A2420"
                                      : activeColor
                                    : "rgba(26,36,32,0.2)",
                                  transition: "background 0.15s",
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 22,
                background: "rgba(28,46,42,0.1)",
                margin: "0 3px",
                flexShrink: 0,
              }}
            />

            {/* Undo */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleUndo}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(28,46,42,0.05)]"
              title="Undo"
            >
              <Undo2
                className="w-[15px] h-[15px]"
                style={{ color: "rgba(28,46,42,0.55)" }}
              />
            </motion.button>

            {/* Delete / Clear */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleClear}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(180,50,30,0.06)]"
              title="Clear canvas"
            >
              <Trash2
                className="w-[15px] h-[15px]"
                style={{ color: "rgba(180,50,30,0.55)" }}
              />
            </motion.button>
          </div>

          {/* Done button — appears after timer, floats to the right */}
          <AnimatePresence>
            {timerDone && (
              <motion.button
                key="done"
                initial={{ opacity: 0, scale: 0.85, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{
                  type: "spring",
                  damping: 22,
                  stiffness: 320,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDone}
                className="flex items-center gap-2 px-5 py-3 rounded-full ml-3"
                style={{
                  background: INK,
                  boxShadow: "0 8px 24px rgba(28,46,42,0.3)",
                }}
              >
                <Check
                  className="w-4 h-4"
                  style={{ color: BG }}
                />
                <span
                  style={{
                    fontFamily: SPACE,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: BG,
                  }}
                >
                  done
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Exit confirmation ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              background: "rgba(246,243,228,0.78)",
              backdropFilter: "blur(14px)",
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 340,
              }}
              className="w-full max-w-xs rounded-3xl p-7"
              style={{
                background: BG,
                boxShadow: "0 24px 64px rgba(28,46,42,0.18)",
                border: "1px solid rgba(28,46,42,0.1)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  color: INK,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                leave your drawing?
              </p>
              <p
                style={{
                  fontFamily: SPACE,
                  fontSize: 11,
                  color: "rgba(26,36,32,0.45)",
                  lineHeight: 1.7,
                  textAlign: "center",
                  marginBottom: 28,
                  letterSpacing: "0.03em",
                }}
              >
                if you leave now, your drawing and progress will
                not be saved.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-3.5 rounded-2xl"
                  style={{
                    background: INK,
                    color: BG,
                    fontFamily: SPACE,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                  }}
                >
                  keep drawing
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    navigate(-1);
                  }}
                  className="w-full py-3.5 rounded-2xl"
                  style={{
                    background: "transparent",
                    color: "rgba(180,50,30,0.75)",
                    fontFamily: SPACE,
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    border: "1px solid rgba(180,50,30,0.22)",
                  }}
                >
                  discard & leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}