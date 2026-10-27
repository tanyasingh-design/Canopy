import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Check,
  CalendarDays,
  CalendarRange,
  Clock,
  RotateCcw,
  Download,
  Share2,
  Maximize2,
  X,
  Sparkles,
  Settings,
  PieChart,
  BarChart3,
  TrendingUp,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

// ── Typography & Palette ──────────────────────────────────────────────────────
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

const INK = "#1C2E2A";
const INK_SOFT = "rgba(28,46,42,0.62)";
const INK_FAINT = "rgba(28,46,42,0.12)";
const BG = "#FAFAFA";
const CARD = "#FFFFFF";
const BORDER = "rgba(28,46,42,0.08)";
const KEPT = "#2F6B5E"; // single calm accent for money kept
const FOREST = "#2F6B5E";
const SPENT = "#B5836A"; // muted clay for money spent
const EMPTY = "#EFEEEA";

// Emotion colours — vibrant pastel palette
const EMOTION_RGB: Record<string, [number, number, number]> = {
  Craving: [251, 86, 7],      // #FB5607
  Stressed: [224, 60, 49],     // #E03C31
  FOMO: [255, 0, 110],        // #FF006E
  Bored: [255, 190, 11],      // #FFBE0B
  Excited: [255, 156, 51],    // #FF9C33
  Intentional: [45, 200, 77], // #2DC84D
  Calm: [97, 158, 255],       // #619EFF
  Happy: [255, 127, 65],      // #FF7F41
  Anxious: [131, 56, 236],    // #8338EC
  Neutral: [138, 143, 152],   // #8A8F98
};

function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex || typeof hex !== "string") return null;
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  return null;
}

function resolveEmotionRgb(emotion?: { name?: string; hex?: string } | string | null): [number, number, number] | null {
  if (!emotion) return null;
  const name = typeof emotion === "string" ? emotion : emotion.name || "";
  const hex = typeof emotion === "object" ? emotion.hex : undefined;

  const foundKey = Object.keys(EMOTION_RGB).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase()
  );
  if (foundKey) return EMOTION_RGB[foundKey];

  const fromHex = hexToRgb(hex);
  if (fromHex) return fromHex;

  return [106, 181, 169];
}

const rgbStr = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Ultra-fine micro tactile grain data URI (small particle size, whisper subtle)
const NOISE_DATA_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.18'/%3E%3C/svg%3E")`;

// ── Types ─────────────────────────────────────────────────────────────────────
type TimeScope = "day" | "week" | "month";

type FlowerEntry = {
  id: number;
  emotion?: { name: string; hex?: string };
  amount?: number;
  laborHours?: number;
  buyingReason?: string;
  compostReason?: string;
  date: string;
  state?: "bloomed" | "wilted" | "parked";
  status?: "bought" | "let_go" | "parked";
  itemName?: string;
  category?: string;
  categories?: string[];
  whoFor?: string;
  reflection?: string;
};

type DayData = {
  day: number;
  dateObj: Date;
  kept: number;
  spent: number;
  count: number;
  color: [number, number, number] | null;
  colors: [number, number, number][];
  flowers: FlowerEntry[];
};

function categoryOf(f: FlowerEntry): string {
  if (Array.isArray(f.categories) && f.categories.length > 0) return f.categories[0];
  if (f.category) return f.category.split(",")[0].trim();
  return "Other";
}

function isSpent(f: FlowerEntry) {
  return f.state === "wilted" || f.status === "bought";
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getStartOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  return date;
}

function getEndOfWeek(d: Date) {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isDateInWeek(target: Date, weekRef: Date) {
  const start = getStartOfWeek(weekRef);
  const end = getEndOfWeek(weekRef);
  const t = target.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString()}`;

// ── Card Shell ────────────────────────────────────────────────────────────────
function Card({ children, pad = 20, className = "" }: { children: React.ReactNode; pad?: number; className?: string }) {
  return (
    <div
      className={`w-full rounded-3xl ${className}`}
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 2px 14px rgba(28,46,42,0.04)",
        padding: pad,
      }}
    >
      {children}
    </div>
  );
}

function Title({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 style={{ fontFamily: HEAD, fontSize: 24, color: INK, letterSpacing: "0.4px", lineHeight: 1.1 }}>
        {children}
      </h2>
      {hint && (
        <p style={{ fontFamily: BODY, fontSize: 15, color: INK_SOFT, marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

// ── Ethereal Softened True-Emotion Aura Gradient Generator ─────────────────────
function getAuraGradientStyle(colors: [number, number, number][]) {
  // Deduplicate colors to distinct logged emotion colors
  const uniqueColors: [number, number, number][] = [];
  const seen = new Set<string>();
  colors.forEach((c) => {
    if (!c) return;
    const k = `${c[0]},${c[1]},${c[2]}`;
    if (!seen.has(k)) {
      seen.add(k);
      uniqueColors.push(c);
    }
  });

  // 0 emotions: Quiet, pure tactile linen cream
  if (uniqueColors.length === 0) {
    return {
      background: "#FAF9F5",
    };
  }

  // 1 emotion logged (e.g. Craving [212, 134, 74]):
  // Ethereal soft glowing bloom diffused on a warm light linen backdrop
  if (uniqueColors.length === 1) {
    const c = uniqueColors[0];
    return {
      background: `
        radial-gradient(circle at 62% 40%, ${rgbStr(c, 0.46)} 0%, ${rgbStr(c, 0.20)} 42%, transparent 72%),
        radial-gradient(circle at 28% 66%, ${rgbStr(c, 0.26)} 0%, transparent 58%),
        radial-gradient(circle at 50% 25%, rgba(255, 255, 255, 0.8) 0%, transparent 60%),
        #FAF9F5
      `,
    };
  }

  // 2 emotions logged: Dual softened aura blooms bleeding softly across light canvas
  if (uniqueColors.length === 2) {
    const c1 = uniqueColors[0];
    const c2 = uniqueColors[1];

    return {
      background: `
        radial-gradient(circle at 34% 36%, ${rgbStr(c1, 0.44)} 0%, ${rgbStr(c1, 0.16)} 45%, transparent 72%),
        radial-gradient(circle at 68% 64%, ${rgbStr(c2, 0.42)} 0%, ${rgbStr(c2, 0.15)} 45%, transparent 72%),
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 60%),
        #FAF9F5
      `,
    };
  }

  // 3+ emotions logged: Multicolor ethereal harmony (like the board's multicolor cards)
  const c1 = uniqueColors[0];
  const c2 = uniqueColors[1];
  const c3 = uniqueColors[2];

  return {
    background: `
      radial-gradient(circle at 26% 30%, ${rgbStr(c1, 0.40)} 0%, ${rgbStr(c1, 0.14)} 45%, transparent 70%),
      radial-gradient(circle at 76% 32%, ${rgbStr(c2, 0.38)} 0%, ${rgbStr(c2, 0.14)} 45%, transparent 70%),
      radial-gradient(circle at 52% 76%, ${rgbStr(c3, 0.36)} 0%, ${rgbStr(c3, 0.12)} 45%, transparent 70%),
      #FAF9F5
    `,
  };
}

// ── Text Wrapping Helper for Canvas ──────────────────────────────────────────
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      if (linesDrawn === maxLines - 1 && i < words.length - 1) {
        ctx.fillText(line.trim() + "…", x, currentY);
        return;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (line && linesDrawn < maxLines) {
    ctx.fillText(line.trim(), x, currentY);
  }
}

// ── Ultra-High Resolution Canvas Generator (1080 × 1350 px, 300 DPI master) ───
async function generateHighResAuraCard({
  date,
  colors,
  flowers,
}: {
  date: Date;
  colors: [number, number, number][];
  flowers?: FlowerEntry[];
}): Promise<string> {
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const hasColors = colors.length > 0;

  const dayNum = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Extract unique emotions
  const emotionNames: string[] = [];
  if (flowers && flowers.length > 0) {
    const seen = new Set<string>();
    flowers.forEach((f) => {
      const em = typeof f.emotion === "string" ? f.emotion : f.emotion?.name;
      if (em && !seen.has(em)) {
        seen.add(em);
        emotionNames.push(em);
      }
    });
  }

  // Find user reflection quote if available
  let reflectionQuote = "";
  flowers?.forEach((f) => {
    const txt = f.reflection || f.buyingReason || f.compostReason;
    if (!reflectionQuote && txt && txt.trim().length > 0) {
      reflectionQuote = txt.trim();
    }
  });

  // Deduplicate colors to distinct logged emotion colors
  const uniqueColors: [number, number, number][] = [];
  const seenColors = new Set<string>();
  colors.forEach((c) => {
    if (!c) return;
    const k = `${c[0]},${c[1]},${c[2]}`;
    if (!seenColors.has(k)) {
      seenColors.add(k);
      uniqueColors.push(c);
    }
  });

  // 1. Base Layer (Softened True-Emotion Aura matching the light board)
  if (uniqueColors.length === 0) {
    // Pure matte tactile linen for empty days
    ctx.fillStyle = "#FAF9F5";
    ctx.fillRect(0, 0, W, H);
  } else if (uniqueColors.length === 1) {
    const c = uniqueColors[0];

    // Light airy linen canvas base
    ctx.fillStyle = "#FAF9F5";
    ctx.fillRect(0, 0, W, H);

    // Primary glowing soft aura bloom
    const g1 = ctx.createRadialGradient(W * 0.62, H * 0.40, 20, W * 0.62, H * 0.40, W * 0.68);
    g1.addColorStop(0, rgbStr(c, 0.46));
    g1.addColorStop(0.42, rgbStr(c, 0.20));
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Secondary ambient soft glow
    const g2 = ctx.createRadialGradient(W * 0.28, H * 0.66, 20, W * 0.28, H * 0.66, W * 0.58);
    g2.addColorStop(0, rgbStr(c, 0.26));
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  } else if (uniqueColors.length === 2) {
    const c1 = uniqueColors[0];
    const c2 = uniqueColors[1];

    ctx.fillStyle = "#FAF9F5";
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * 0.34, H * 0.36, 20, W * 0.34, H * 0.36, W * 0.70);
    g1.addColorStop(0, rgbStr(c1, 0.44));
    g1.addColorStop(0.45, rgbStr(c1, 0.16));
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.68, H * 0.64, 20, W * 0.68, H * 0.64, W * 0.70);
    g2.addColorStop(0, rgbStr(c2, 0.42));
    g2.addColorStop(0.45, rgbStr(c2, 0.15));
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  } else {
    const c1 = uniqueColors[0];
    const c2 = uniqueColors[1];
    const c3 = uniqueColors[2];

    ctx.fillStyle = "#FAF9F5";
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * 0.26, H * 0.30, 20, W * 0.26, H * 0.30, W * 0.68);
    g1.addColorStop(0, rgbStr(c1, 0.40));
    g1.addColorStop(0.45, rgbStr(c1, 0.14));
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.76, H * 0.32, 20, W * 0.76, H * 0.32, W * 0.68);
    g2.addColorStop(0, rgbStr(c2, 0.38));
    g2.addColorStop(0.45, rgbStr(c2, 0.14));
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    const g3 = ctx.createRadialGradient(W * 0.52, H * 0.76, 20, W * 0.52, H * 0.76, W * 0.68);
    g3.addColorStop(0, rgbStr(c3, 0.36));
    g3.addColorStop(0.45, rgbStr(c3, 0.12));
    g3.addColorStop(1, "transparent");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Ultra-Fine Tactile Film Grain Texture (1:1 micro pixels)
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = 720;
  noiseCanvas.height = 900;
  const nCtx = noiseCanvas.getContext("2d")!;
  const imgData = nCtx.createImageData(720, 900);
  const buf = imgData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    buf[i] = v;
    buf[i + 1] = v;
    buf[i + 2] = v;
    buf[i + 3] = 7; // very soft and fine
  }
  nCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(noiseCanvas, 0, 0, W, H);
  ctx.restore();

  // 3. Clean Minimalist Top Header (NO border lines, NO divider lines)
  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `bold 30px 'Passion One', sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText("CANOPY", 90, 120);

  ctx.textAlign = "right";
  ctx.font = `500 16px 'Fraunces', serif`;
  ctx.fillStyle = INK_SOFT;
  ctx.letterSpacing = "2px";
  ctx.fillText(weekday, W - 90, 118);
  ctx.restore();

  // 4. Day Text Hero Section (Spacious, elegant, editorial dark ink)
  ctx.save();
  ctx.font = `bold 100px 'Passion One', sans-serif`;
  ctx.fillStyle = INK;
  ctx.letterSpacing = "1px";
  ctx.shadowColor = "transparent";
  ctx.fillText(`${dayNum} ${monthName} ${year}`, 90, 275);

  // 4. Subtitle: Number of drawings (strictly no "logged")
  const count = flowers?.length || 0;
  const daySubtitleText =
    count > 0
      ? `${count} ${count === 1 ? "drawing" : "drawings"}`
      : "0 drawings · Stillness";

  ctx.font = `italic 30px 'Fraunces', serif`;
  ctx.fillStyle = INK_SOFT;
  ctx.letterSpacing = "0.5px";
  ctx.fillText(daySubtitleText, 90, 335);
  ctx.restore();

  // 5. Day Reflection (if available and not just the emotion word repeated)
  const isEmotionWord = emotionNames.some(
    (em) => em.toLowerCase() === reflectionQuote.toLowerCase()
  );
  if (reflectionQuote && !isEmotionWord) {
    ctx.save();
    ctx.font = `italic 32px 'Fraunces', serif`;
    ctx.fillStyle = INK;
    ctx.letterSpacing = "0.3px";
    drawWrappedText(ctx, `“${reflectionQuote}”`, 90, 560, W - 180, 52, 6);
    ctx.restore();
  }

  // 6. Minimalist Footer (NO divider line)
  ctx.save();
  ctx.font = `bold 18px 'Passion One', sans-serif`;
  ctx.fillStyle = INK_SOFT;
  ctx.letterSpacing = "3px";
  ctx.fillText("CANOPY", 90, H - 75);

  ctx.textAlign = "right";
  ctx.font = `14px 'Fraunces', serif`;
  ctx.fillStyle = INK_SOFT;
  ctx.letterSpacing = "1.5px";
  ctx.fillText(`${dayNum} ${monthName} ${year}`, W - 90, H - 75);
  ctx.restore();

  return canvas.toDataURL("image/png", 1.0);
}



// ── Aesthetic Downloadable Aura Gradient Card Component ────────────────────
function AestheticAuraCard({
  date,
  colors,
  flowers,
  customTitle,
  customSubtitle,
  drawingCount,
  scope = "day",
}: {
  date: Date;
  colors: [number, number, number][];
  flowers?: FlowerEntry[];
  customTitle?: string;
  customSubtitle?: string;
  drawingCount?: number;
  scope?: "day" | "week" | "month";
}) {
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const hasColors = colors.length > 0;
  const count = drawingCount !== undefined ? drawingCount : flowers?.length || 0;

  const cardStyle = hasColors
    ? getAuraGradientStyle(colors)
    : {
        background: "#EBEAE5", // Quiet matte grey, zero gradient
      };

  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Emotion names for clean day text
  const emotionNames = useMemo(() => {
    if (!flowers || flowers.length === 0) return [];
    const names = new Set<string>();
    flowers.forEach((f) => {
      const em = typeof f.emotion === "string" ? f.emotion : f.emotion?.name;
      if (em) names.add(em);
    });
    return Array.from(names);
  }, [flowers]);

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const dataUrl = await generateHighResAuraCard({
        date,
        colors,
        flowers,
      });
      const filename = `canopy-aura-${date.toISOString().slice(0, 10)}.png`;

      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Canopy Aura - ${dayNum} ${monthName}`,
          });
          setSaving(false);
          return;
        }
      } catch {}

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error("Failed to generate aura image", err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dataUrl = await generateHighResAuraCard({
        date,
        colors,
        flowers,
      });
      setPreviewDataUrl(dataUrl);
      setShowPreview(true);
    } catch (err) {
      console.error("Failed to prepare aura preview", err);
    }
  };

  return (
    <>
      <div
        onClick={handleOpenPreview}
        className="group relative w-full rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-[0.99]"
        style={{
          ...cardStyle,
          minHeight: 135,
          padding: "20px 22px",
          boxShadow: "0 4px 20px rgba(28,46,42,0.05)",
          border: `1px solid ${BORDER}`,
        }}
        title="Tap to preview or save aesthetic art card"
      >
        {/* Authentic Fine Fractal Noise Texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_DATA_URI,
            backgroundRepeat: "repeat",
            opacity: 0.08,
            mixBlendMode: "multiply",
          }}
        />

        {/* Aesthetic Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
          {/* Top row: Drawings Badge + Clean Save button */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all"
              style={{
                background: "rgba(255,255,255,0.78)",
                color: INK,
                border: `1px solid ${BORDER}`,
                fontFamily: BODY,
                boxShadow: "0 1px 4px rgba(28,46,42,0.04)",
              }}
            >
              <span>
                🌸 {count} {count === 1 ? "drawing" : "drawings"}
              </span>
            </div>

            <button
              id="aura-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.78)",
                color: INK,
                border: `1px solid ${BORDER}`,
                fontFamily: BODY,
                boxShadow: "0 1px 4px rgba(28,46,42,0.04)",
              }}
              title="Save aesthetic aura image"
            >
              <Download size={13} />
              <span>{saving ? "Saving…" : "Save"}</span>
            </button>
          </div>

          {/* Bottom row: Title & Canopy watermark */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p
                style={{
                  fontFamily: HEAD,
                  fontSize: customTitle ? 28 : 32,
                  lineHeight: 1.05,
                  color: INK,
                  letterSpacing: "0.5px",
                  textShadow: "none",
                }}
              >
                {customTitle || `${dayNum} ${monthName} ${year}`}
              </p>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 14,
                  color: INK_SOFT,
                  marginTop: 4,
                  fontStyle: "italic",
                }}
              >
                {customSubtitle ||
                  (count > 0
                    ? `${count} ${count === 1 ? "drawing" : "drawings"}`
                    : "0 drawings · Stillness")}
              </p>
            </div>

            <span
              style={{
                fontFamily: HEAD,
                fontSize: 13,
                letterSpacing: "1px",
                color: "rgba(28,46,42,0.35)",
                textTransform: "uppercase",
              }}
            >
              Canopy
            </span>
          </div>
        </div>
      </div>

      {/* ── Fullscreen High-Resolution Aura Card Modal via Portal ─────────── */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPreview && previewDataUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-4 sm:p-6"
                style={{
                  background: "#2E3F3A",
                  willChange: "opacity",
                }}
                onClick={() => setShowPreview(false)}
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 16 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full"
                  style={{ maxHeight: "90vh" }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setShowPreview(false)}
                    className="absolute -top-11 right-0 p-2 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
                    title="Close"
                  >
                    <X size={18} />
                  </button>

                  {/* High-Resolution Aesthetic Card Render (No border line) */}
                  <img
                    src={previewDataUrl}
                    alt={`Canopy Aura ${dayNum} ${monthName}`}
                    className="h-auto w-auto max-w-full max-h-[68vh] object-contain block rounded-2xl"
                  />

                  {/* Modal Download Actions */}
                  <div className="flex items-center justify-center gap-3 mt-4 w-full">
                    <button
                      type="button"
                      onClick={() => handleDownload()}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-semibold transition-all active:scale-98 shadow-xl"
                      style={{
                        background: KEPT,
                        color: "#FFFFFF",
                        fontFamily: BODY,
                      }}
                    >
                      <Download size={16} />
                      <span>{saving ? "Saving…" : "Save"}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

// ── Psychology-informed Insight Card ──────────────────────────────────────────
// Grounded in: urge surfing (Marlatt), affect labeling (Lieberman 2007),
// implementation intentions (Gollwitzer), self-compassion (Neff), progress principle (Amabile).
function InsightCard({
  scope,
  total,
  keptN,
  spentN,
  keptHours,
  topMood,
  peakLabel,
}: {
  scope: TimeScope;
  total: number;
  keptN: number;
  spentN: number;
  keptHours: number;
  topMood?: { name: string; pct: number; rgb: [number, number, number] };
  peakLabel?: string;
}) {
  const period = scope === "day" ? "today" : scope === "week" ? "this week" : "this month";
  const rate = total ? Math.round((keptN / total) * 100) : 0;
  const accent: [number, number, number] = topMood?.rgb || [74, 154, 142];

  const tips: Record<string, { act: string; why: string }> = {
    stressed: { act: "Breathe out slowly for 60 seconds before deciding.", why: "A long exhale calms your body's alarm, so the choice is made by you, not the stress." },
    anxious: { act: "Breathe out slowly for 60 seconds before deciding.", why: "A long exhale calms your body's alarm, so the choice is made by you, not the stress." },
    bored: { act: "Swap in a 5-minute walk or message a friend first.", why: "Boredom wants novelty, not the item. Give it a cheaper dose." },
    craving: { act: "Wait 20 minutes and save it to a wish list instead.", why: "Urges rise, peak and fade on their own, usually within 20–30 minutes (urge surfing)." },
    fomo: { act: "Ask: would I still want this if no one else had it?", why: "FOMO borrows other people's wants. Questioning it hands the choice back to you." },
    excited: { act: "Sleep on it. Excitement fades, real wants stay.", why: "Strong feelings distort how much we value things in the moment." },
  };
  const tip =
    (topMood && tips[topMood.name.toLowerCase()]) || {
      act: "Say it out loud: “I'm feeling ___ right now.”",
      why: "Naming a feeling lowers its intensity (affect labeling).",
    };

  let headline = "";
  let body = "";
  if (total === 0) {
    headline = "A quiet stretch";
    body = `No urges logged ${period}. Noticing calm is practice too.`;
  } else if (rate >= 60) {
    headline = `You let go of ${rate}% of urges ${period}`;
    body = `That's about ${keptHours}h of your life kept. Small wins compound, so notice this one.`;
  } else if (spentN > keptN) {
    headline = "Data, not a verdict";
    body = `Buying happened more than pausing ${period}. Shame fuels the cycle, curiosity breaks it. Look at the pattern below.`;
  } else {
    headline = `${keptN} urge${keptN === 1 ? "" : "s"} paused ${period}`;
    body = "Every pause strengthens the gap between feeling and acting.";
  }

  const pattern =
    total > 0 && topMood
      ? `${topMood.name} drives ${topMood.pct}% of your urges${peakLabel ? `, mostly in the ${peakLabel.toLowerCase()}` : ""}.`
      : null;

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <div
      className="w-full rounded-3xl relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${rgbStr(accent, 0.14)} 0%, #FFFFFF 62%)`,
        border: `1px solid ${BORDER}`,
        padding: 20,
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(28,46,42,0.08)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r={R} fill="none" stroke={KEPT} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C - (C * rate) / 100}
              style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.23,1,0.32,1)" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: HEAD, fontSize: 18, color: INK }}>
            {total ? `${rate}%` : "–"}
          </span>
        </div>
        <div className="min-w-0">
          <p style={{ fontFamily: BODY, fontSize: 11, letterSpacing: "1.4px", color: INK_SOFT, textTransform: "uppercase" }}>Pause rate</p>
          <h2 style={{ fontFamily: HEAD, fontSize: 22, lineHeight: 1.1, color: INK, marginTop: 2 }}>{headline}</h2>
        </div>
      </div>

      <p style={{ fontFamily: BODY, fontSize: 14.5, color: INK, lineHeight: 1.5, marginTop: 14 }}>{body}</p>
      {pattern && (
        <p style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, lineHeight: 1.5, marginTop: 6 }}>{pattern}</p>
      )}

      <div className="mt-4 p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${BORDER}` }}>
        <p style={{ fontFamily: BODY, fontSize: 11, letterSpacing: "1.2px", color: KEPT, textTransform: "uppercase", fontWeight: 600 }}>Try next time</p>
        <p style={{ fontFamily: BODY, fontSize: 14.5, color: INK, marginTop: 3, lineHeight: 1.45 }}>{tip.act}</p>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: INK_SOFT, marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>{tip.why}</p>
      </div>
    </div>
  );
}

// ── Interactive Calendar with Day Selection ───────────────────────────────────
function MoodGradientCalendar({
  days,
  year,
  month,
  selectedDayNumber,
  onSelectDay,
}: {
  days: DayData[];
  year: number;
  month: number;
  selectedDayNumber: number;
  onSelectDay: (dayNum: number) => void;
}) {
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayNum =
    today.getMonth() === month && today.getFullYear() === year ? today.getDate() : -1;

  function dayBg(d: DayData) {
    if (d.colors.length === 0) return "transparent";
    const cs =
      d.colors.length === 1
        ? [d.colors[0], d.colors[0].map((v) => Math.min(255, v + 40))]
        : d.colors;
    return `linear-gradient(135deg, ${cs.map((c) => rgbStr(c, 0.95)).join(", ")})`;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center"
            style={{ fontFamily: HEAD, fontSize: 15, color: INK_SOFT }}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((d) => {
          const hasColors = d.colors.length > 0;
          const isCurrentDay = d.day === todayNum;
          const isFuture =
            year > today.getFullYear() ||
            (year === today.getFullYear() && month > today.getMonth()) ||
            (year === today.getFullYear() && month === today.getMonth() && d.day > today.getDate());
          const isSelected = !isFuture && d.day === selectedDayNumber;

          return (
            <div key={d.day} className="flex items-center justify-center">
              <button
                type="button"
                disabled={isFuture}
                onClick={() => {
                  if (!isFuture) onSelectDay(d.day);
                }}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                  isFuture ? "cursor-default" : "active:scale-90"
                }`}
                style={{
                  width: 42,
                  height: 42,
                  background: isFuture ? "transparent" : dayBg(d),
                  color: isFuture
                    ? INK_FAINT
                    : hasColors
                    ? "#FFFFFF"
                    : isCurrentDay
                    ? INK
                    : INK_SOFT,
                  opacity: isFuture ? 0.22 : 1,
                  fontFamily: HEAD,
                  fontSize: 19,
                  letterSpacing: "0.3px",
                  textShadow: hasColors && !isFuture ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
                  border: isSelected
                    ? `2.5px solid ${KEPT}`
                    : !hasColors && isCurrentDay
                    ? `1.5px solid ${INK}`
                    : "1.5px solid transparent",
                  boxShadow: isSelected ? "0 0 0 2px rgba(47,107,94,0.3), 0 3px 10px rgba(47,107,94,0.25)" : "none",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                  pointerEvents: isFuture ? "none" : "auto",
                }}
                aria-label={isFuture ? `Day ${d.day} (upcoming)` : `Select day ${d.day}`}
                aria-disabled={isFuture}
              >
                {d.day}
                {hasColors && isSelected && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: KEPT, border: "1.5px solid #FFFFFF" }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Daily Bars (Monthly distribution) ─────────────────────────────────────────
function DailyBars({
  days,
  year,
  month,
  onSelectDay,
}: {
  days: DayData[];
  year: number;
  month: number;
  onSelectDay: (day: number) => void;
}) {
  const max = Math.max(1, ...days.map((d) => d.kept + d.spent));
  const H = 130;
  const hasData = days.some((d) => d.kept + d.spent > 0);
  const today = new Date();

  if (!hasData) {
    return (
      <p style={{ fontFamily: BODY, fontSize: 16, color: INK_SOFT, padding: "24px 0", textAlign: "center" }}>
        Nothing logged this month yet.
      </p>
    );
  }

  return (
    <div>
      <div className="grid items-end gap-[3px]" style={{ height: H, gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const isFuture =
            year > today.getFullYear() ||
            (year === today.getFullYear() && month > today.getMonth()) ||
            (year === today.getFullYear() && month === today.getMonth() && d.day > today.getDate());
          const keptH = (d.kept / max) * H;
          const spentH = (d.spent / max) * H;
          return (
            <button
              key={d.day}
              disabled={isFuture}
              onClick={() => {
                if (!isFuture) onSelectDay(d.day);
              }}
              className={`flex-1 flex flex-col justify-end group transition-transform ${
                isFuture ? "cursor-default opacity-20 pointer-events-none" : "active:scale-95"
              }`}
              style={{ height: H }}
              title={isFuture ? `Day ${d.day} (upcoming)` : `Day ${d.day}: ${fmt(d.kept)} let go, ${fmt(d.spent)} bought`}
            >
              {d.spent > 0 && (
                <div style={{ height: Math.max(3, spentH), background: SPENT, borderRadius: "3px 3px 0 0" }} />
              )}
              {d.kept > 0 && (
                <div
                  style={{
                    height: Math.max(3, keptH),
                    background: KEPT,
                    borderRadius: d.spent > 0 ? 0 : "3px 3px 0 0",
                  }}
                />
              )}
              {d.kept + d.spent === 0 && <div style={{ height: 2, background: INK_FAINT }} />}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-2" style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT }}>
        <span>1</span>
        <span>{Math.ceil(days.length / 2)}</span>
        <span>{days.length}</span>
      </div>
      <div className="flex gap-5 mt-4" style={{ fontFamily: BODY, fontSize: 15, color: INK }}>
        <span className="flex items-center gap-2">
          <i style={{ width: 12, height: 12, borderRadius: 4, background: KEPT, display: "inline-block" }} />
          Let go
        </span>
        <span className="flex items-center gap-2">
          <i style={{ width: 12, height: 12, borderRadius: 4, background: SPENT, display: "inline-block" }} />
          Bought
        </span>
      </div>
    </div>
  );
}

// ── 7-Day Week Comparison Bars ────────────────────────────────────────────────
function WeekBars({
  weekDays,
  onSelectDate,
}: {
  weekDays: { date: Date; name: string; kept: number; spent: number; flowers: FlowerEntry[] }[];
  onSelectDate: (d: Date) => void;
}) {
  const max = Math.max(1, ...weekDays.map((d) => d.kept + d.spent));
  const H = 140;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-2 items-end" style={{ height: H }}>
        {weekDays.map((d, i) => {
          const keptH = (d.kept / max) * H;
          const spentH = (d.spent / max) * H;
          const isToday = isSameDay(d.date, new Date());
          const isFuture = d.date.getTime() > new Date().setHours(23, 59, 59, 999);

          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => {
                if (!isFuture) onSelectDate(d.date);
              }}
              className={`flex-1 flex flex-col justify-end items-center group h-full ${
                isFuture ? "cursor-default opacity-25 pointer-events-none" : ""
              }`}
            >
              <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden" style={{ height: H - 30 }}>
                {d.spent > 0 && (
                  <div
                    className="w-full transition-all group-hover:opacity-80"
                    style={{ height: Math.max(4, spentH), background: SPENT }}
                  />
                )}
                {d.kept > 0 && (
                  <div
                    className="w-full transition-all group-hover:opacity-80"
                    style={{ height: Math.max(4, keptH), background: KEPT }}
                  />
                )}
                {d.kept + d.spent === 0 && (
                  <div className="w-full" style={{ height: 3, background: INK_FAINT }} />
                )}
              </div>
              <span
                className="mt-2 text-xs font-semibold"
                style={{
                  fontFamily: HEAD,
                  color: isToday ? KEPT : INK_SOFT,
                  fontSize: 14,
                }}
              >
                {d.name}
              </span>
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: 11,
                  color: isToday ? INK : INK_SOFT,
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {d.date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-5 mt-2" style={{ fontFamily: BODY, fontSize: 14, color: INK }}>
        <span className="flex items-center gap-2">
          <i style={{ width: 11, height: 11, borderRadius: 3, background: KEPT, display: "inline-block" }} />
          Let go
        </span>
        <span className="flex items-center gap-2">
          <i style={{ width: 11, height: 11, borderRadius: 3, background: SPENT, display: "inline-block" }} />
          Bought
        </span>
      </div>
    </div>
  );
}

// ── Horizontal Day Scrubber (Day View) ────────────────────────────────────────
function DayScrubber({
  currentDate,
  onSelectDate,
  allFlowers,
}: {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  allFlowers: FlowerEntry[];
}) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + (i - 3));
      const hasUrges = allFlowers.some((f) => {
        const fd = new Date(f.date);
        return !isNaN(fd.getTime()) && isSameDay(fd, d);
      });
      return { date: d, hasUrges };
    });
  }, [currentDate, allFlowers]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
      {days.map(({ date, hasUrges }, i) => {
        const isSelected = isSameDay(date, currentDate);
        const isToday = isSameDay(date, new Date());
        const isFuture = date.getTime() > new Date().setHours(23, 59, 59, 999);
        const dayLetter = date.toLocaleDateString("en-US", { weekday: "narrow" });
        const dayNumber = date.getDate();

        return (
          <button
            key={i}
            disabled={isFuture}
            onClick={() => {
              if (!isFuture) onSelectDate(date);
            }}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 relative ${
              isFuture ? "cursor-default opacity-25 pointer-events-none" : ""
            }`}
            style={{
              background: isSelected ? KEPT : "rgba(28,46,42,0.04)",
              color: isSelected ? "#FFFFFF" : INK,
              border: isSelected ? `1.5px solid ${KEPT}` : isToday ? `1.5px solid ${INK}` : `1px solid ${BORDER}`,
              minWidth: 44,
            }}
          >
            <span style={{ fontFamily: BODY, fontSize: 11, opacity: isSelected ? 0.9 : 0.6 }}>
              {dayLetter}
            </span>
            <span style={{ fontFamily: HEAD, fontSize: 17, marginTop: 1 }}>
              {dayNumber}
            </span>
            {hasUrges && !isFuture && (
              <span
                className="w-1.5 h-1.5 rounded-full mt-1"
                style={{ background: isSelected ? "#FFFFFF" : KEPT }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Horizontal Week Scrubber (Week View) ──────────────────────────────────────
function WeekScrubber({
  weekDays,
  selectedDate,
  onSelectDate,
}: {
  weekDays: { date: Date; name: string; kept: number; spent: number; flowers: FlowerEntry[] }[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const today = new Date();
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full mt-3">
      {weekDays.map(({ date, name, flowers }, i) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        const isFuture = date.getTime() > new Date().setHours(23, 59, 59, 999);
        const hasDrawings = flowers.length > 0;

        return (
          <button
            key={i}
            disabled={isFuture}
            onClick={() => {
              if (!isFuture) onSelectDate(date);
            }}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 relative ${
              isFuture ? "cursor-default opacity-25 pointer-events-none" : "cursor-pointer active:scale-95"
            }`}
            style={{
              background: isSelected ? KEPT : "rgba(28,46,42,0.04)",
              color: isSelected ? "#FFFFFF" : INK,
              border: isSelected ? `1.5px solid ${KEPT}` : isToday ? `1.5px solid ${INK}` : `1px solid ${BORDER}`,
              minWidth: 44,
            }}
          >
            <span style={{ fontFamily: BODY, fontSize: 11, opacity: isSelected ? 0.9 : 0.6 }}>
              {name}
            </span>
            <span style={{ fontFamily: HEAD, fontSize: 17, marginTop: 1 }}>
              {date.getDate()}
            </span>
            {hasDrawings && !isFuture && (
              <span
                className="w-1.5 h-1.5 rounded-full mt-1"
                style={{ background: isSelected ? "#FFFFFF" : KEPT }}
                title={`${flowers.length} drawing(s)`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── SVG Arc Calculation Helpers for Donut Charts ──────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number) {
  const sweep = Math.min(359.99, Math.max(0.1, endAngle - startAngle));
  const largeArcFlag = sweep <= 180 ? 0 : 1;
  const p1 = polarToCartesian(cx, cy, r2, startAngle);
  const p2 = polarToCartesian(cx, cy, r2, startAngle + sweep);
  const p3 = polarToCartesian(cx, cy, r1, startAngle + sweep);
  const p4 = polarToCartesian(cx, cy, r1, startAngle);
  return `M ${p1.x} ${p1.y} A ${r2} ${r2} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r1} ${r1} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y} Z`;
}

// ── Botanical Color Palette for Data Visuals ──────────────────────────────────
const BOTANICAL_COLORS = [
  "#2F6B5E", // Forest green
  "#B5836A", // Warm terracotta
  "#E5A93B", // Amber honey
  "#729B79", // Sage
  "#8E7DBE", // Lavender
  "#4A90A4", // Ocean teal
  "#C06C84", // Rose
];

// ── Most Vulnerable Day of The Week (Line Chart matching Forest App) ──────────
function VulnerableDayOfWeekChart({ allFlowers }: { allFlowers: FlowerEntry[] }) {
  const dowNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0, 0, 0];
    allFlowers.forEach((f) => {
      const d = new Date(f.date);
      if (!isNaN(d.getTime())) {
        c[d.getDay()]++;
      }
    });
    return c;
  }, [allFlowers]);

  const max = Math.max(1, ...counts);
  const peakIndex = counts.indexOf(Math.max(...counts));
  const peakDayName = dowNames[peakIndex];

  // Width 320, Height 110
  const points = counts.map((cnt, i) => {
    const x = 24 + i * ((320 - 48) / 6);
    const y = 84 - (cnt / max) * 58;
    return { x, y, cnt, name: dowNames[i] };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  return (
    <Card pad={20}>
      <Title hint="Day of the week when urges are most frequent">
        Most Vulnerable Day of The Week
      </Title>
      <p style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, marginBottom: 12 }}>
        Most impulses on{" "}
        <strong style={{ color: FOREST, fontWeight: 700 }}>
          {allFlowers.length > 0 ? peakDayName : "—"}
        </strong>{" "}
        every week in general
      </p>

      <div className="w-full relative mt-1">
        <svg viewBox="0 0 320 110" className="w-full h-auto overflow-visible">
          {/* Subtle horizontal grid lines */}
          <line x1="16" y1="26" x2="304" y2="26" stroke="rgba(28,46,42,0.06)" strokeDasharray="3 3" />
          <line x1="16" y1="55" x2="304" y2="55" stroke="rgba(28,46,42,0.06)" strokeDasharray="3 3" />
          <line x1="16" y1="84" x2="304" y2="84" stroke="rgba(28,46,42,0.08)" />

          {/* Vertical dashed line at peak day */}
          {allFlowers.length > 0 && (
            <line
              x1={points[peakIndex].x}
              y1={points[peakIndex].y}
              x2={points[peakIndex].x}
              y2={84}
              stroke="rgba(47,107,94,0.4)"
              strokeDasharray="2 3"
              strokeWidth={1.5}
            />
          )}

          {/* Smooth connecting line */}
          <path
            d={pathD}
            fill="none"
            stroke={FOREST}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Node points on each day */}
          {points.map((p, i) => {
            const isPeak = i === peakIndex && allFlowers.length > 0;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isPeak ? 5.5 : 3.5}
                  fill={isPeak ? "#FFFFFF" : FOREST}
                  stroke={FOREST}
                  strokeWidth={isPeak ? 2.5 : 1.5}
                />
                {isPeak && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill={FOREST}
                    style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 700 }}
                  >
                    {p.cnt}
                  </text>
                )}
                <text
                  x={p.x}
                  y={102}
                  textAnchor="middle"
                  fill={isPeak ? INK : "rgba(28,46,42,0.5)"}
                  style={{
                    fontFamily: BODY,
                    fontSize: 11,
                    fontWeight: isPeak ? 600 : 400,
                  }}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

// ── Peak Period of The Day (Continuous 24h Curve matching Forest App) ─────────
function PeakPeriodOfDayChart({ allFlowers }: { allFlowers: FlowerEntry[] }) {
  const hourlyCounts = useMemo(() => {
    const c = Array(24).fill(0);
    allFlowers.forEach((f) => {
      const d = new Date(f.date);
      if (!isNaN(d.getTime())) {
        const h = d.getHours();
        if (h >= 0 && h < 24) c[h]++;
      }
    });
    return c;
  }, [allFlowers]);

  const max = Math.max(1, ...hourlyCounts);
  const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
  const peakHourLabel = `${String(peakHour).padStart(2, "0")}:00`;

  // Width 320, Height 110, padding left/right 24
  const points = hourlyCounts.map((cnt, h) => {
    const x = 24 + h * ((320 - 48) / 23);
    const y = 84 - (cnt / max) * 58;
    return { x, y, cnt, h };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[23].x} 84 L ${points[0].x} 84 Z`;

  const tickHours = [0, 6, 12, 18, 23];

  return (
    <Card pad={20}>
      <Title hint="Time of day when shopping triggers peak">
        Most Vulnerable Period of The Day
      </Title>
      <p style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, marginBottom: 12 }}>
        Most impulses around{" "}
        <strong style={{ color: FOREST, fontWeight: 700 }}>
          {allFlowers.length > 0 ? peakHourLabel : "—"}
        </strong>{" "}
        every day in general
      </p>

      <div className="w-full relative mt-1">
        <svg viewBox="0 0 320 110" className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="forestAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2F6B5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2F6B5E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal base line */}
          <line x1="16" y1="84" x2="304" y2="84" stroke="rgba(28,46,42,0.08)" />

          {/* Area fill */}
          {allFlowers.length > 0 && <path d={areaD} fill="url(#forestAreaGrad)" />}

          {/* Vertical dashed line at peak hour */}
          {allFlowers.length > 0 && (
            <line
              x1={points[peakHour].x}
              y1={points[peakHour].y}
              x2={points[peakHour].x}
              y2={84}
              stroke="rgba(47,107,94,0.4)"
              strokeDasharray="2 3"
              strokeWidth={1.5}
            />
          )}

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke={FOREST}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak dot */}
          {allFlowers.length > 0 && (
            <circle
              cx={points[peakHour].x}
              cy={points[peakHour].y}
              r={5}
              fill="#FFFFFF"
              stroke={FOREST}
              strokeWidth={2.5}
            />
          )}

          {/* Ticks for 00:00, 06:00, 12:00, 18:00, 23:00 */}
          {tickHours.map((th) => {
            const p = points[th];
            const label = `${String(th).padStart(2, "0")}:00`;
            return (
              <text
                key={th}
                x={p.x}
                y={100}
                textAnchor="middle"
                fill="rgba(28,46,42,0.5)"
                style={{ fontFamily: BODY, fontSize: 10.5 }}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

// ── Category Distribution Donut Chart (Matching Forest App) ───────────────────
function CategoryDonutChart({ flowers }: { flowers: FlowerEntry[] }) {
  const categoryData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    flowers.forEach((f) => {
      const cat = categoryOf(f);
      if (!map[cat]) map[cat] = { amount: 0, count: 0 };
      map[cat].amount += Number(f.amount) || 0;
      map[cat].count += 1;
    });

    const totalUrges = flowers.length || 1;
    const sorted = Object.entries(map).sort((a, b) => b[1].amount - a[1].amount);

    return sorted.map(([name, data], idx) => ({
      name,
      amount: data.amount,
      count: data.count,
      pct: Math.round((data.count / totalUrges) * 100),
      color: BOTANICAL_COLORS[idx % BOTANICAL_COLORS.length],
    }));
  }, [flowers]);

  if (flowers.length === 0) {
    return (
      <Card pad={20}>
        <Title hint="Categories where you paused purchases">Tag & Category Distribution</Title>
        <p style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, textAlign: "center", padding: "20px 0" }}>
          No impulses logged in this period yet.
        </p>
      </Card>
    );
  }

  // Build SVG arc paths
  const totalItems = flowers.length;
  let accumulatedAngle = 0;
  const arcs = categoryData.map((c) => {
    const sweep = (c.count / totalItems) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sweep;
    accumulatedAngle += sweep;

    const path = describeArc(100, 100, 52, 80, startAngle, endAngle);
    return { ...c, path };
  });

  return (
    <Card pad={20}>
      <Title hint="Where desires and urges are concentrated">
        Tag & Category Distribution
      </Title>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {arcs.map((arc, i) => (
              <path
                key={i}
                d={arc.path}
                fill={arc.color}
                className="transition-all duration-300 hover:opacity-90"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span style={{ fontFamily: HEAD, fontSize: 32, lineHeight: 1, color: INK }}>
              {totalItems}
            </span>
            <span style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT }}>
              {totalItems === 1 ? "impulse" : "impulses"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2.5 w-full">
          {categoryData.slice(0, 5).map((c) => (
            <div key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: c.color }}
                />
                <span style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 500 }}>
                  {c.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: HEAD, fontSize: 15, color: INK }}>
                  {c.pct}%
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
                  {fmt(c.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Favorite / Most Frequent Impulses (Matching Forest App) ───────────────────
function FavoriteImpulsesCard({ flowers }: { flowers: FlowerEntry[] }) {
  const topItems = useMemo(() => {
    const map: Record<string, { count: number; total: number; category: string }> = {};
    flowers.forEach((f) => {
      const name = f.itemName || categoryOf(f) || "Micro-indulgence";
      if (!map[name]) map[name] = { count: 0, total: 0, category: categoryOf(f) };
      map[name].count += 1;
      map[name].total += Number(f.amount) || 0;
    });

    const sorted = Object.entries(map).sort((a, b) => b[1].count - a[1].count || b[1].total - a[1].total);
    const maxCount = sorted[0]?.[1].count || 1;
    return sorted.slice(0, 4).map(([name, data], idx) => ({
      rank: idx + 1,
      name,
      count: data.count,
      total: data.total,
      category: data.category,
      barWidth: Math.max(12, Math.round((data.count / maxCount) * 100)),
    }));
  }, [flowers]);

  if (flowers.length === 0) return null;

  const itemEmoji = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("coffee") || c.includes("tea")) return "☕";
    if (c.includes("food") || c.includes("dining")) return "🍕";
    if (c.includes("tech") || c.includes("gadget")) return "🎧";
    if (c.includes("cloth") || c.includes("fashion")) return "👗";
    if (c.includes("book")) return "📚";
    if (c.includes("game")) return "🎮";
    return "🌱";
  };

  return (
    <Card pad={20}>
      <Title hint="The temptations you paused to reflect on most often">
        Favorite impulse species
      </Title>
      <div className="flex flex-col gap-4 mt-2">
        {topItems.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, width: 14 }}>
              {item.rank}.
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(28,46,42,0.06)", fontSize: 16 }}>
              {itemEmoji(item.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: INK }} className="truncate">
                  {item.name}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT }} className="shrink-0 ml-2">
                  {item.count} {item.count === 1 ? "time" : "times"} · {fmt(item.total)}
                </span>
              </div>
              <div className="w-full rounded-full overflow-hidden mt-1.5" style={{ height: 7, background: EMPTY }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.barWidth}%`,
                    background: FOREST,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Settings & Personalization Modal ──────────────────────────────────────────
function SettingsModal({
  isOpen,
  onClose,
  userName,
  onSaveName,
  monthlySalary,
  onSaveSalary,
  profileProblem,
  onSaveProblem,
  profileGoal,
  onSaveGoal,
  onExportData,
  onResetData,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSaveName: (n: string) => void;
  monthlySalary: number;
  onSaveSalary: (s: number) => void;
  profileProblem: string;
  onSaveProblem: (p: string) => void;
  profileGoal: string;
  onSaveGoal: (g: string) => void;
  onExportData: () => void;
  onResetData: () => void;
}) {
  const [name, setName] = useState(userName);
  const [salary, setSalary] = useState(String(monthlySalary || ""));
  const [problem, setProblem] = useState(profileProblem);
  const [goal, setGoal] = useState(profileGoal);

  useEffect(() => {
    if (isOpen) {
      setName(userName);
      setSalary(String(monthlySalary || ""));
      setProblem(profileProblem);
      setGoal(profileGoal);
    }
  }, [isOpen, userName, monthlySalary, profileProblem, profileGoal]);

  if (!isOpen) return null;

  const parsedSalary = Math.max(0, parseFloat(salary) || 0);
  const derivedWage = Math.round((parsedSalary / 22 / 8) * 100) / 100;

  function handleSave() {
    onSaveName(name.trim() || "Friend");
    onSaveSalary(parsedSalary);
    onSaveProblem(problem.trim() || "Late-night scrolling, Sales and discounts");
    onSaveGoal(goal.trim() || "Financial peace of mind");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(28,46,42,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        style={{ background: BG, color: INK }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(28,46,42,0.08)]">
          <div>
            <h2 style={{ fontFamily: HEAD, fontSize: 26, color: INK }}>Settings & Profile</h2>
            <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
              Personalize your Canopy reflections and value conversions
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            style={{ background: "rgba(28,46,42,0.06)" }}
            aria-label="Close settings"
          >
            <X size={16} color={INK} />
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          {/* Name */}
          <div>
            <label style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, fontWeight: 500 }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[rgba(28,46,42,0.15)] bg-white outline-none"
              style={{ fontFamily: BODY, fontSize: 15 }}
            />
          </div>

          {/* Monthly Salary */}
          <div>
            <div className="flex items-baseline justify-between">
              <label style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, fontWeight: 500 }}>
                Monthly Take-Home Salary
              </label>
              {parsedSalary > 0 && (
                <span style={{ fontFamily: BODY, fontSize: 12, color: FOREST, fontWeight: 600 }}>
                  @ ₹{derivedWage.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/hr · ≈ ₹{Math.round(parsedSalary / 22).toLocaleString("en-IN")}/day
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ fontFamily: HEAD, fontSize: 18, color: INK_SOFT }}>
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[rgba(28,46,42,0.15)] bg-white outline-none"
                style={{ fontFamily: HEAD, fontSize: 18 }}
              />
            </div>
            <p style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT, marginTop: 4 }}>
              Used to calculate the hours and days of work every impulse purchase costs. (Based on 22 days × 8h).
            </p>
          </div>

          {/* Impulse problem to soften */}
          <div>
            <label style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, fontWeight: 500 }}>
              Impulse Patterns to Soften
            </label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Late-night scrolling, Sales and discounts"
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[rgba(28,46,42,0.15)] bg-white outline-none"
              style={{ fontFamily: BODY, fontSize: 15 }}
            />
          </div>

          {/* Growing money towards */}
          <div>
            <label style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, fontWeight: 500 }}>
              Growing Money Towards (Personal Goal)
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Dream travel, Emergency peace fund"
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[rgba(28,46,42,0.15)] bg-white outline-none"
              style={{ fontFamily: BODY, fontSize: 15 }}
            />
          </div>

          {/* Navigation & Data Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("canopy_onboarded");
                window.location.href = "/?reboard=1";
              }}
              className="w-full py-2.5 px-4 rounded-xl text-left text-sm font-medium transition-colors hover:bg-stone-200/60 cursor-pointer"
              style={{ background: EMPTY, fontFamily: BODY, color: FOREST }}
            >
              Revisit onboarding journey
            </button>
            <button
              type="button"
              onClick={onExportData}
              className="w-full py-2.5 px-4 rounded-xl text-left text-sm font-medium transition-colors hover:bg-stone-200/60 cursor-pointer"
              style={{ background: EMPTY, fontFamily: BODY, color: INK }}
            >
              Export data backup (JSON)
            </button>
            <button
              type="button"
              onClick={onResetData}
              className="w-full py-2.5 px-4 rounded-xl text-left text-sm font-medium transition-colors hover:bg-red-50 cursor-pointer"
              style={{ background: "rgba(181,131,106,0.12)", fontFamily: BODY, color: SPENT }}
            >
              Reset all data
            </button>
          </div>

          {/* Save button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 rounded-2xl text-white font-semibold transition-transform active:scale-[0.99] cursor-pointer"
              style={{ background: FOREST, fontFamily: HEAD, fontSize: 18 }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Component ─────────────────────────────────────────────────────
export function Profile() {
  const [allFlowers, setAllFlowers] = useState<FlowerEntry[]>([]);
  const [timeScope, setTimeScope] = useState<TimeScope>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => new Date().getDate());
  const [confirmReset, setConfirmReset] = useState(false);
  const [showSettings, setShowSettings] = useState(false);


  // Hourly Wage settings
  const [hourlyWage, setHourlyWage] = useState<number>(() => {
    const val = parseFloat(localStorage.getItem("userHourlyWage") || "500") || 500;
    return Math.round(val * 100) / 100;
  });
  const [isEditingWage, setIsEditingWage] = useState(false);
  // Monthly salary (22 working days x 8h) is what we ask; hourly rate is derived
  const [monthlySalary, setMonthlySalary] = useState<number>(() => {
    const stored = parseFloat(localStorage.getItem("userMonthlySalary") || "");
    if (stored > 0) return stored;
    const hw = parseFloat(localStorage.getItem("userHourlyWage") || "500") || 500;
    return Math.round(hw * 8 * 22);
  });
  const [tempWage, setTempWage] = useState(String(monthlySalary));

  // Onboarded profile intentions & goals
  const [profileName, setProfileName] = useState(() => localStorage.getItem("userName") || "");
  const [profileProblem, setProfileProblem] = useState(() => localStorage.getItem("userSpendingProblem") || "");
  const [profileGoal, setProfileGoal] = useState(() => localStorage.getItem("userPersonalGoal") || "");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(profileGoal);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [tempProblem, setTempProblem] = useState(profileProblem);

  function saveGoal() {
    const val = tempGoal.trim() || "Financial peace of mind";
    setProfileGoal(val);
    localStorage.setItem("userPersonalGoal", val);
    setIsEditingGoal(false);
  }

  function saveProblem() {
    const val = tempProblem.trim() || "Impulse spending";
    setProfileProblem(val);
    localStorage.setItem("userSpendingProblem", val);
    setIsEditingProblem(false);
  }

  // Hours -> friendly time (days once it's a full working day)
  const fmtWork = (hours: number) => {
    if (hours >= 8) {
      const d = Math.round((hours / 8) * 10) / 10;
      return `${d} day${d === 1 ? "" : "s"}`;
    }
    return `${hours}h`;
  };

  function loadFlowers() {
    try {
      const raw = localStorage.getItem("gardenFlowers");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setAllFlowers(parsed);
      }
    } catch {}
  }

  useEffect(() => {
    loadFlowers();
    window.addEventListener("garden-updated", loadFlowers);
    return () => window.removeEventListener("garden-updated", loadFlowers);
  }, []);

  function saveWage() {
    const salary = Math.max(1, parseFloat(tempWage) || 0);
    const hw = Math.round((salary / 22 / 8) * 100) / 100;
    setMonthlySalary(salary);
    setHourlyWage(hw);
    localStorage.setItem("userMonthlySalary", String(salary));
    localStorage.setItem("userHourlyWage", String(hw));
    setIsEditingWage(false);
  }

  const amt = (f: FlowerEntry) => Number(f.amount) || 0;
  const now = new Date();

  // Navigation handlers for Day, Week, Month
  function shiftPeriod(delta: number) {
    if (timeScope === "day") {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + delta);
      setSelectedDate(d);
      setSelectedDayNumber(d.getDate());
    } else if (timeScope === "week") {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + delta * 7);
      setSelectedDate(d);
      setSelectedDayNumber(d.getDate());
    } else {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1);
      setSelectedDate(d);
      setSelectedDayNumber(1);
    }
  }

  function jumpToToday() {
    const today = new Date();
    setSelectedDate(today);
    setSelectedDayNumber(today.getDate());
  }

  // Filter flowers for current selections
  const dayFlowers = useMemo(() => {
    return allFlowers.filter((f) => {
      const d = new Date(f.date);
      return !isNaN(d.getTime()) && isSameDay(d, selectedDate);
    });
  }, [allFlowers, selectedDate]);

  const weekFlowers = useMemo(() => {
    return allFlowers.filter((f) => {
      const d = new Date(f.date);
      return !isNaN(d.getTime()) && isDateInWeek(d, selectedDate);
    });
  }, [allFlowers, selectedDate]);

  const monthFlowers = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    return allFlowers.filter((f) => {
      const d = new Date(f.date);
      return !isNaN(d.getTime()) && d.getMonth() === m && d.getFullYear() === y;
    });
  }, [allFlowers, selectedDate]);

  // Contextual flowers based on active scope
  const activeFlowers = timeScope === "day" ? dayFlowers : timeScope === "week" ? weekFlowers : monthFlowers;

  // Stats calculation for current active scope
  const stats = useMemo(() => {
    let kept = 0, spent = 0, keptN = 0, spentN = 0, planned = 0;
    activeFlowers.forEach((f) => {
      const a = amt(f);
      const emName = typeof f.emotion === "string" ? f.emotion : f.emotion?.name;
      if (emName?.toLowerCase() === "intentional") planned++;
      if (isSpent(f)) { spent += a; spentN++; }
      else { kept += a; keptN++; }
    });
    const total = activeFlowers.length;
    return {
      kept,
      spent,
      keptN,
      spentN,
      total,
      plannedPct: total ? Math.round((planned / total) * 100) : 0,
    };
  }, [activeFlowers]);

  const activeKeptHours = Math.round((stats.kept / hourlyWage) * 10) / 10;
  const activeSpentHours = Math.round((stats.spent / hourlyWage) * 10) / 10;

  // Week breakdown days
  const weekDaysData = useMemo(() => {
    const start = getStartOfWeek(selectedDate);
    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const fls = weekFlowers.filter((f) => isSameDay(new Date(f.date), d));
      let kept = 0, spent = 0;
      fls.forEach((f) => {
        const a = amt(f);
        if (isSpent(f)) spent += a;
        else kept += a;
      });
      return { date: d, name: dayNames[i], kept, spent, flowers: fls };
    });
  }, [selectedDate, weekFlowers]);

  const weekKeptAmt = useMemo(
    () => weekFlowers.filter((f) => !isSpent(f)).reduce((sum, f) => sum + amt(f), 0),
    [weekFlowers]
  );
  const weekSpentAmt = useMemo(
    () => weekFlowers.filter(isSpent).reduce((sum, f) => sum + amt(f), 0),
    [weekFlowers]
  );
  const weekKeptHours = Math.round((weekKeptAmt / hourlyWage) * 10) / 10;
  const weekSpentHours = Math.round((weekSpentAmt / hourlyWage) * 10) / 10;
  const weekTotalHours = weekKeptHours + weekSpentHours || 0.01;
  const weekKeptPct = Math.min(100, Math.round((weekKeptHours / weekTotalHours) * 100));

  // Month days array
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const days: DayData[] = useMemo(() => {
    const n = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => {
      const dayNum = i + 1;
      const dateObj = new Date(year, month, dayNum);
      const df = monthFlowers.filter((f) => new Date(f.date).getDate() === dayNum);
      let kept = 0, spent = 0;
      const sum = [0, 0, 0];
      let w = 0;
      const dayColors: [number, number, number][] = [];
      df.forEach((f) => {
        const a = amt(f);
        if (isSpent(f)) spent += a;
        else kept += a;
        const c = resolveEmotionRgb(f.emotion);
        if (c) {
          sum[0] += c[0];
          sum[1] += c[1];
          sum[2] += c[2];
          w++;
          if (!dayColors.some((x) => x[0] === c[0] && x[1] === c[1] && x[2] === c[2])) dayColors.push(c);
        }
      });
      return {
        day: dayNum,
        dateObj,
        kept,
        spent,
        count: df.length,
        colors: dayColors,
        color: w ? ([Math.round(sum[0] / w), Math.round(sum[1] / w), Math.round(sum[2] / w)] as [number, number, number]) : null,
        flowers: df,
      };
    });
  }, [monthFlowers, year, month]);

  // Selected calendar day data (safeguarded against future days)
  const safeSelectedDayNumber = useMemo(() => {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth && selectedDayNumber > now.getDate()) {
      return now.getDate();
    }
    return selectedDayNumber;
  }, [year, month, selectedDayNumber, now]);

  const selectedCalendarDayData = useMemo(() => {
    const found = days.find((d) => d.day === safeSelectedDayNumber);
    if (found) return found;
    return {
      day: safeSelectedDayNumber,
      dateObj: new Date(year, month, safeSelectedDayNumber),
      kept: 0,
      spent: 0,
      count: 0,
      colors: [],
      color: null,
      flowers: [],
    };
  }, [days, safeSelectedDayNumber, year, month]);

  const weekRangeTitle = useMemo(() => {
    const start = getStartOfWeek(selectedDate);
    const end = getEndOfWeek(selectedDate);
    return `${start.toLocaleDateString("en-US", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;
  }, [selectedDate]);

  const weekColors = useMemo(() => {
    const seen = new Set<string>();
    const res: [number, number, number][] = [];
    weekFlowers.forEach((f) => {
      const c = resolveEmotionRgb(f.emotion);
      if (c) {
        const k = `${c[0]},${c[1]},${c[2]}`;
        if (!seen.has(k)) {
          seen.add(k);
          res.push(c);
        }
      }
    });
    return res;
  }, [weekFlowers]);

  const monthColors = useMemo(() => {
    const seen = new Set<string>();
    const res: [number, number, number][] = [];
    monthFlowers.forEach((f) => {
      const c = resolveEmotionRgb(f.emotion);
      if (c) {
        const k = `${c[0]},${c[1]},${c[2]}`;
        if (!seen.has(k)) {
          seen.add(k);
          res.push(c);
        }
      }
    });
    return res;
  }, [monthFlowers]);

  const heroCount =
    timeScope === "day"
      ? dayFlowers.length
      : timeScope === "week"
      ? weekFlowers.length
      : monthFlowers.length;

  const heroColors: [number, number, number][] = useMemo(() => {
    if (timeScope === "day") {
      return dayFlowers
        .map((f) => resolveEmotionRgb(f.emotion))
        .filter((c): c is [number, number, number] => c !== null);
    }
    if (timeScope === "week") return weekColors;
    return monthColors;
  }, [timeScope, dayFlowers, weekColors, monthColors]);

  const heroTitle = useMemo(() => {
    if (timeScope === "day") {
      const d = selectedDate.getDate();
      const m = selectedDate.toLocaleDateString("en-US", { month: "short" });
      const y = selectedDate.getFullYear();
      return `${d} ${m} ${y}`;
    }
    if (timeScope === "week") return weekRangeTitle;
    const m = selectedDate.toLocaleDateString("en-US", { month: "long" });
    const y = selectedDate.getFullYear();
    return `${m} ${y}`;
  }, [timeScope, selectedDate, weekRangeTitle]);

  const heroSubtitle = useMemo(() => {
    if (heroCount === 0) return "0 drawings · Stillness";
    return `${heroCount} ${heroCount === 1 ? "drawing" : "drawings"}`;
  }, [heroCount]);

  const moodMix = useMemo(() => {
    const counts: Record<string, { count: number; rgb: [number, number, number] }> = {};
    activeFlowers.forEach((f) => {
      const e = typeof f.emotion === "string" ? f.emotion : f.emotion?.name || "Other";
      const rgb = resolveEmotionRgb(f.emotion) || [106, 181, 169];
      if (!counts[e]) counts[e] = { count: 0, rgb };
      counts[e].count += 1;
    });
    const total = Object.values(counts).reduce((s, c) => s + c.count, 0);
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        rgb: data.rgb,
        pct: total ? Math.round((data.count / total) * 100) : 0,
      }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [activeFlowers]);

  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    activeFlowers.forEach((f) => {
      const c = categoryOf(f);
      map[c] = (map[c] || 0) + amt(f);
    });
    const list = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const top = list[0]?.[1] || 1;
    return list.map(([name, total]) => ({ name, total, w: (total / top) * 100 }));
  }, [activeFlowers]);

  // Dynamic Navigation Period Label
  const periodLabel = useMemo(() => {
    if (timeScope === "day") {
      const isToday = isSameDay(selectedDate, now);
      return isToday
        ? `Today, ${selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`
        : selectedDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    }
    if (timeScope === "week") {
      const start = getStartOfWeek(selectedDate);
      const end = getEndOfWeek(selectedDate);
      return `${start.toLocaleDateString("en-US", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
    }
    return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [timeScope, selectedDate, now]);

  const isCurrentPeriod = useMemo(() => {
    if (timeScope === "day") return isSameDay(selectedDate, now);
    if (timeScope === "week") return isDateInWeek(now, selectedDate);
    return selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();
  }, [timeScope, selectedDate, now]);

  const barTotal = stats.kept + stats.spent || 1;

  const timeBuckets = useMemo(() => {
    const b = [
      { label: "Morning", range: "5am–12pm", count: 0, amount: 0 },
      { label: "Afternoon", range: "12–5pm", count: 0, amount: 0 },
      { label: "Evening", range: "5–9pm", count: 0, amount: 0 },
      { label: "Late night", range: "9pm–5am", count: 0, amount: 0 },
    ];
    activeFlowers.forEach((f) => {
      const h = new Date(f.date).getHours();
      const i = h >= 5 && h < 12 ? 0 : h >= 12 && h < 17 ? 1 : h >= 17 && h < 21 ? 2 : 3;
      b[i].count++;
      b[i].amount += amt(f);
    });
    return b;
  }, [activeFlowers]);
  const peakTime = [...timeBuckets].sort((a, b) => b.count - a.count)[0];
  const maxTime = Math.max(1, ...timeBuckets.map((t) => t.count));

  function exportData() {
    const blob = new Blob([JSON.stringify(allFlowers, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bloom-canopy-data.json";
    a.click();
  }

  function resetData() {
    [
      "gardenFlowers",
      "bloomData",
      "canopy_onboarded",
      "userName",
      "userSpendingProblem",
      "userSpendingProblemKey",
      "userPersonalGoal",
      "userPersonalGoalKey",
    ].forEach((k) => localStorage.removeItem(k));
    setAllFlowers([]);
    setProfileName("");
    setProfileProblem("");
    setProfileGoal("");
    setConfirmReset(false);
  }

  const arrowBtn = "w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform disabled:opacity-20 cursor-pointer";



  return (
    <div className="min-h-screen flex flex-col w-full pb-36" style={{ background: BG, color: INK }}>
      {/* ── Profile Header ────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: 38, lineHeight: 1, color: INK, letterSpacing: "0.5px" }}>
            Profile
          </h1>
          <p className="sr-only">Your urge patterns, without judgment</p>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentPeriod && (
            <button
              onClick={jumpToToday}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
              style={{
                background: "rgba(47,107,94,0.12)",
                color: KEPT,
                fontFamily: BODY,
                border: "1px solid rgba(47,107,94,0.2)",
              }}
            >
              <RotateCcw size={12} />
              Today
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            style={{
              background: "rgba(28,46,42,0.06)",
              border: `1px solid ${BORDER}`,
            }}
            aria-label="Settings and Profile"
            title="Settings & Profile"
          >
            <Settings size={18} color={INK} />
          </button>
        </div>
      </div>

      {/* ── Scope Switcher ─────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div
          className="relative flex p-1 rounded-2xl"
          style={{
            background: "rgba(28,46,42,0.06)",
            border: `1px solid ${BORDER}`,
          }}
        >
          {(["day", "week", "month"] as const).map((scope) => {
            const active = timeScope === scope;
            return (
              <button
                key={scope}
                onClick={() => setTimeScope(scope)}
                className="relative flex-1 py-2 text-center transition-colors duration-200 rounded-xl flex items-center justify-center gap-1.5 z-10"
                style={{
                  fontFamily: HEAD,
                  fontSize: 16,
                  letterSpacing: "0.4px",
                  color: active ? INK : INK_SOFT,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="activeScopePill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "#FFFFFF",
                      boxShadow: "0 2px 10px rgba(28,46,42,0.08)",
                      border: `1px solid ${BORDER}`,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 36 }}
                  />
                )}
                <span className="relative z-10 capitalize flex items-center gap-1.5">
                  {scope === "day" && <Clock size={14} />}
                  {scope === "week" && <CalendarRange size={14} />}
                  {scope === "month" && <CalendarDays size={14} />}
                  {scope}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Period Navigation Ribbon ─────────────────────────────────── */}
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={() => shiftPeriod(-1)}
            className={arrowBtn}
            style={{ background: "rgba(28,46,42,0.06)" }}
            aria-label="Previous period"
          >
            <ChevronLeft size={18} color={INK} />
          </button>

          <span
            style={{
              fontFamily: HEAD,
              fontSize: 18,
              minWidth: 160,
              textAlign: "center",
              color: INK,
              letterSpacing: "0.3px",
            }}
          >
            {periodLabel}
          </span>

          <button
            onClick={() => shiftPeriod(1)}
            disabled={isCurrentPeriod}
            className={arrowBtn}
            style={{ background: "rgba(28,46,42,0.06)" }}
            aria-label="Next period"
          >
            <ChevronRight size={18} color={INK} />
          </button>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* ── Top Aura Art Card (Proper standalone card) ───────────────── */}
        <AestheticAuraCard
          date={selectedDate}
          colors={heroColors}
          flowers={activeFlowers}
          customTitle={heroTitle}
          customSubtitle={heroSubtitle}
          drawingCount={heroCount}
          scope={timeScope}
        />

        {/* ── 2. STATISTICAL SUMMARY & DISTRIBUTION (FOREST-STYLE) ───────────── */}
        {timeScope === "month" && (
          <Card pad={20}>
            <div className="flex items-center justify-between mb-1">
              <Title hint="Total money and work time preserved across the month">
                Diverted Spending & Time Distribution
              </Title>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{
                  background: "rgba(47,107,94,0.12)",
                  color: KEPT,
                  fontFamily: BODY,
                }}
              >
                <Zap size={12} />
                {fmtWork(activeKeptHours)} saved
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 34, color: KEPT }}>
                  {fmt(stats.kept)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  diverted ({stats.keptN} impulses)
                </span>
              </div>
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 22, color: SPENT }}>
                  {fmt(stats.spent)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  spent
                </span>
              </div>
            </div>

            <DailyBars
              days={days}
              year={year}
              month={month}
              onSelectDay={(dayNum) => {
                setSelectedDayNumber(dayNum);
                const newD = new Date(year, month, dayNum);
                setSelectedDate(newD);
              }}
            />
          </Card>
        )}

        {timeScope === "week" && (
          <Card pad={20}>
            <div className="flex items-center justify-between mb-1">
              <Title hint="Money and work time preserved across the 7 days">
                Diverted Spending & Time Distribution
              </Title>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{
                  background: "rgba(47,107,94,0.12)",
                  color: KEPT,
                  fontFamily: BODY,
                }}
              >
                <Zap size={12} />
                {fmtWork(weekKeptHours)} saved
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 34, color: KEPT }}>
                  {fmt(stats.kept)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  diverted ({stats.keptN} impulses)
                </span>
              </div>
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 22, color: SPENT }}>
                  {fmt(stats.spent)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  spent
                </span>
              </div>
            </div>

            <WeekBars
              weekDays={weekDaysData}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedDayNumber(d.getDate());
                setTimeScope("day");
              }}
            />
          </Card>
        )}

        {timeScope === "day" && (
          <Card pad={22}>
            <Title hint="Impulses paused vs indulged on this day">
              Day impulse summary
            </Title>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 32, color: KEPT }}>
                  {fmt(stats.kept)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  kept today
                </span>
              </div>
              <div>
                <span style={{ fontFamily: HEAD, fontSize: 24, color: SPENT }}>
                  {fmt(stats.spent)}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                  spent
                </span>
              </div>
            </div>

            <div className="flex w-full rounded-full overflow-hidden" style={{ height: 10, background: EMPTY }}>
              <div style={{ width: `${(stats.kept / barTotal) * 100}%`, background: KEPT }} />
              <div style={{ width: `${(stats.spent / barTotal) * 100}%`, background: SPENT }} />
            </div>

            <div className="flex justify-between items-center mt-3 text-xs" style={{ fontFamily: BODY, color: INK_SOFT }}>
              <span>{stats.keptN} impulses diverted</span>
              <span>{stats.spentN} bought</span>
            </div>
          </Card>
        )}

        {/* ── 3. MOST VULNERABLE DAY OF THE WEEK (FOREST-STYLE LINE CHART) ──── */}
        <VulnerableDayOfWeekChart allFlowers={allFlowers} />

        {/* ── 4. PEAK IMPULSE PERIOD OF THE DAY (FOREST-STYLE 24H AREA CHART) ── */}
        <PeakPeriodOfDayChart allFlowers={allFlowers} />

        {/* ── 5. TAG & CATEGORY DISTRIBUTION (FOREST-STYLE DONUT CHART) ──────── */}
        <CategoryDonutChart flowers={activeFlowers} />

        {/* ── 6. EMOTIONAL SPECTRUM & DRIVERS ─────────────────────────────────── */}
        {moodMix.length > 0 && (
          <Card pad={20}>
            <Title hint="Dominant emotional states triggering your desires">
              Emotional drivers & spectrum
            </Title>
            <div className="flex flex-wrap gap-x-3 gap-y-2.5">
              {moodMix.map((m) => (
                <span
                  key={m.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
                  style={{
                    fontFamily: BODY,
                    background: "rgba(28,46,42,0.03)",
                    border: `1px solid ${BORDER}`,
                    color: INK,
                  }}
                >
                  <i
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 4,
                      background: rgbStr(m.rgb),
                      display: "inline-block",
                    }}
                  />
                  <span>{m.name}</span>
                  <strong style={{ fontFamily: HEAD, fontSize: 16 }}>{m.pct}%</strong>
                  <span style={{ color: INK_SOFT, fontSize: 12 }}>({m.count})</span>
                </span>
              ))}
            </div>
            {moodMix[0] && (
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  color: INK_SOFT,
                  marginTop: 14,
                  lineHeight: 1.5,
                }}
              >
                Primary impulse trigger: <strong style={{ color: INK }}>{moodMix[0].name}</strong>, accounting for {moodMix[0].pct}% of all logged moments in this period.
              </p>
            )}
          </Card>
        )}

        {/* ── 7. FAVORITE IMPULSE SPECIES (FOREST-STYLE RANKED HABITS) ───────── */}
        <FavoriteImpulsesCard flowers={activeFlowers} />

        {/* ── 8. LABOR & VALUE BALANCE ────────────────────────────────────────── */}
        <Card pad={22}>
          <div className="flex items-center justify-between mb-1">
            <Title hint="Hours of work saved vs traded on micro-indulgences">
              Labor & value balance
            </Title>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(28,46,42,0.06)",
                color: INK,
                fontFamily: BODY,
              }}
            >
              @ ₹{hourlyWage.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/hr
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 28, color: KEPT }}>
                {activeKeptHours}h
              </span>
              <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                life preserved
              </span>
            </div>
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 20, color: SPENT }}>
                {activeSpentHours}h
              </span>
              <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                traded away
              </span>
            </div>
          </div>

          <div className="w-full rounded-full overflow-hidden flex" style={{ height: 16, background: EMPTY }}>
            {activeKeptHours > 0 && (
              <div
                className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                style={{
                  width: `${(activeKeptHours / (activeKeptHours + activeSpentHours || 0.01)) * 100}%`,
                  background: KEPT,
                  fontFamily: HEAD,
                }}
              >
                {Math.round((activeKeptHours / (activeKeptHours + activeSpentHours || 0.01)) * 100)}%
              </div>
            )}
            {activeSpentHours > 0 && (
              <div
                className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                style={{
                  width: `${(activeSpentHours / (activeKeptHours + activeSpentHours || 0.01)) * 100}%`,
                  background: SPENT,
                  fontFamily: HEAD,
                }}
              >
                {Math.round((activeSpentHours / (activeKeptHours + activeSpentHours || 0.01)) * 100)}%
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(28,46,42,0.06)]" style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
            <span>Saved: {fmt(stats.kept)}</span>
            <span>Spent: {fmt(stats.spent)}</span>
          </div>
        </Card>

        {/* ── 9. DAY REFLECTIONS (FOR DAY VIEW ONLY) ───────────────────────────── */}
        {timeScope === "day" && dayFlowers.length > 0 && (
          <Card pad={20}>
            <Title hint="Logged urges, decisions & thoughts on this day">
              Today's reflections ({dayFlowers.length})
            </Title>
            <div className="flex flex-col gap-3">
              {dayFlowers.map((f) => {
                const isItemSpent = isSpent(f);
                const emName = typeof f.emotion === "string" ? f.emotion : f.emotion?.name;
                const emColor = resolveEmotionRgb(f.emotion) || [106, 181, 169];
                const cat = categoryOf(f);
                const refText = f.reflection || f.buyingReason || f.compostReason;

                return (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl flex flex-col gap-2"
                    style={{
                      background: "rgba(28,46,42,0.03)",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 600, color: INK }}>
                          {f.itemName || cat || "Impulse"}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: isItemSpent ? "rgba(181,131,106,0.15)" : "rgba(47,107,94,0.12)",
                            color: isItemSpent ? SPENT : KEPT,
                          }}
                        >
                          {isItemSpent ? "Bought" : "Let go"}
                        </span>
                      </div>
                      <span style={{ fontFamily: HEAD, fontSize: 20, color: INK }}>
                        {fmt(Number(f.amount) || 0)}
                      </span>
                    </div>

                    {refText && (
                      <p
                        style={{
                          fontFamily: BODY,
                          fontSize: 14,
                          color: INK_SOFT,
                          fontStyle: "italic",
                          lineHeight: 1.45,
                        }}
                      >
                        "{refText}"
                      </p>
                    )}

                    <div
                      className="flex items-center justify-between text-xs pt-1 border-t border-[rgba(28,46,42,0.05)]"
                      style={{ fontFamily: BODY, color: INK_SOFT }}
                    >
                      <span className="flex items-center gap-1.5">
                        <i
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: rgbStr(emColor),
                          }}
                        />
                        {emName || "Impulse"} · {cat}
                      </span>
                      <span>
                        {new Date(f.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* ── Settings Modal (Slide-up modal from header gear button) ─────────── */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userName={profileName}
        onSaveName={(n) => {
          setProfileName(n);
          localStorage.setItem("userName", n);
        }}
        monthlySalary={monthlySalary}
        onSaveSalary={(s) => {
          const hw = Math.round((s / 22 / 8) * 100) / 100;
          setMonthlySalary(s);
          setHourlyWage(hw);
          localStorage.setItem("userMonthlySalary", String(s));
          localStorage.setItem("userHourlyWage", String(hw));
        }}
        profileProblem={profileProblem}
        onSaveProblem={(p) => {
          setProfileProblem(p);
          localStorage.setItem("userSpendingProblem", p);
        }}
        profileGoal={profileGoal}
        onSaveGoal={(g) => {
          setProfileGoal(g);
          localStorage.setItem("userPersonalGoal", g);
        }}
        onExportData={exportData}
        onResetData={() => {
          setShowSettings(false);
          setConfirmReset(true);
        }}
      />

      {/* ── Confirmation Modal ──────────────────────────────────────────────── */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: "rgba(28,46,42,0.45)" }} onClick={() => setConfirmReset(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: BG }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: HEAD, fontSize: 26, color: INK }}>Reset all data?</h3>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: INK_SOFT, marginTop: 8 }}>
              Every logged want, mood, reflection, and garden flower will be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 rounded-2xl" style={{ fontFamily: HEAD, fontSize: 17, color: INK, background: EMPTY }}>
                Cancel
              </button>
              <button onClick={resetData} className="flex-1 py-3 rounded-2xl" style={{ fontFamily: HEAD, fontSize: 17, color: "#FAFAFA", background: SPENT }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
