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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { SunShapeSvg } from "./SunShapeSvg";

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

// Emotion colours — used ONLY for mood visuals
const EMOTION_RGB: Record<string, [number, number, number]> = {
  Stressed: [192, 70, 58],
  Craving: [212, 134, 74],
  FOMO: [155, 114, 207],
  Bored: [212, 168, 83],
  Excited: [96, 190, 120],
  Intentional: [74, 154, 142],
  Happy: [229, 194, 83],
  Calm: [106, 181, 169],
  Neutral: [94, 148, 203],
  Anxious: [160, 115, 196],
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

// High-definition fine fractal noise data URI for authentic risograph texture
const NOISE_DATA_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.42'/%3E%3C/svg%3E")`;

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

// ── Non-Linear Aura Gradient Generator ────────────────────────────────────────
function getAuraGradientStyle(colors: [number, number, number][]) {
  // If no emotion logged that day, create a soothing serene Canopy forest / morning mist tone
  const palette: [number, number, number][] =
    colors.length > 0
      ? colors
      : [
          [47, 107, 94], // Deep Canopy Green
          [74, 154, 142], // Mindful Teal
          [146, 186, 175], // Gentle Mist
        ];

  const c1 = palette[0];
  const c2 =
    palette[1] || [
      Math.min(255, c1[0] + 45),
      Math.max(0, c1[1] - 20),
      Math.min(255, c1[2] + 45),
    ];
  const c3 =
    palette[2] || [
      Math.max(0, c1[0] - 35),
      Math.min(255, c1[1] + 35),
      Math.max(0, c1[2] - 30),
    ];
  const c4 = [
    Math.min(255, Math.round((c1[0] + c2[0]) / 2)),
    Math.min(255, Math.round((c2[1] + c3[1]) / 2)),
    Math.min(255, Math.round((c3[2] + c1[2]) / 2)),
  ];

  // Non-linear Multi-focal Organic Aura Blooms
  return {
    background: `
      radial-gradient(circle at 24% 28%, ${rgbStr(c1, 0.96)} 0%, transparent 55%),
      radial-gradient(circle at 82% 32%, ${rgbStr(c2, 0.92)} 0%, transparent 56%),
      radial-gradient(circle at 50% 82%, ${rgbStr(c3, 0.95)} 0%, transparent 58%),
      radial-gradient(circle at 85% 82%, ${rgbStr(c4, 0.78)} 0%, transparent 52%),
      radial-gradient(circle at 18% 74%, ${rgbStr(c2, 0.72)} 0%, transparent 54%),
      #132521
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

  // 1. Base Layer
  if (hasColors) {
    // Deep atmospheric canopy forest backdrop
    ctx.fillStyle = "#4A5A55";
    ctx.fillRect(0, 0, W, H);

    // Multi-focal Organic Aura Gradient Blooms
    const palette: [number, number, number][] =
      colors.length > 0
        ? colors
        : [
            [47, 107, 94],
            [74, 154, 142],
            [146, 186, 175],
          ];

    const c1 = palette[0];
    const c2 =
      palette[1] || [
        Math.min(255, c1[0] + 45),
        Math.max(0, c1[1] - 20),
        Math.min(255, c1[2] + 45),
      ];
    const c3 =
      palette[2] || [
        Math.max(0, c1[0] - 35),
        Math.min(255, c1[1] + 35),
        Math.max(0, c1[2] - 30),
      ];
    const c4 = [
      Math.min(255, Math.round((c1[0] + c2[0]) / 2)),
      Math.min(255, Math.round((c2[1] + c3[1]) / 2)),
      Math.min(255, Math.round((c3[2] + c1[2]) / 2)),
    ];

    // Bloom 1 (top-left)
    const g1 = ctx.createRadialGradient(320, 380, 20, 320, 380, 680);
    g1.addColorStop(0, rgbStr(c1, 0.94));
    g1.addColorStop(0.5, rgbStr(c1, 0.45));
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Bloom 2 (top-right)
    const g2 = ctx.createRadialGradient(840, 420, 30, 840, 420, 720);
    g2.addColorStop(0, rgbStr(c2, 0.90));
    g2.addColorStop(0.52, rgbStr(c2, 0.40));
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Bloom 3 (center-lower)
    const g3 = ctx.createRadialGradient(540, 920, 40, 540, 920, 760);
    g3.addColorStop(0, rgbStr(c3, 0.92));
    g3.addColorStop(0.55, rgbStr(c3, 0.42));
    g3.addColorStop(1, "transparent");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);

    // Bloom 4 (lower-right accent)
    const g4 = ctx.createRadialGradient(920, 980, 20, 920, 980, 560);
    g4.addColorStop(0, rgbStr(c4, 0.8));
    g4.addColorStop(1, "transparent");
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, W, H);

    // Bloom 5 (lower-left ambient)
    const g5 = ctx.createRadialGradient(200, 900, 20, 200, 900, 580);
    g5.addColorStop(0, rgbStr(c2, 0.72));
    g5.addColorStop(1, "transparent");
    ctx.fillStyle = g5;
    ctx.fillRect(0, 0, W, H);

    // Gentle luminous lift (no dark vignette) so the aura glows edge to edge
    const gl = ctx.createRadialGradient(540, 560, 80, 540, 560, 1000);
    gl.addColorStop(0, "rgba(255, 255, 255, 0.10)");
    gl.addColorStop(1, "transparent");
    ctx.fillStyle = gl;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Pure matte tactile grey for empty days - zero gradient
    ctx.fillStyle = "#EBEAE5";
    ctx.fillRect(0, 0, W, H);
  }

  // 2. High-Definition Risograph / Film Grain Texture
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = 360;
  noiseCanvas.height = 450;
  const nCtx = noiseCanvas.getContext("2d")!;
  const imgData = nCtx.createImageData(360, 450);
  const buf = imgData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    buf[i] = v;
    buf[i + 1] = v;
    buf[i + 2] = v;
    buf[i + 3] = hasColors ? 24 : 18;
  }
  nCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = hasColors ? "overlay" : "multiply";
  ctx.drawImage(noiseCanvas, 0, 0, W, H);
  ctx.restore();

  // 3. Clean Minimalist Top Header (NO border lines, NO divider lines)
  ctx.save();
  ctx.fillStyle = hasColors ? "#FFFFFF" : INK;
  ctx.font = `bold 30px 'Passion One', sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText("CANOPY", 90, 120);

  ctx.textAlign = "right";
  ctx.font = `500 16px 'Fraunces', serif`;
  ctx.fillStyle = hasColors ? "rgba(255, 255, 255, 0.75)" : INK_SOFT;
  ctx.letterSpacing = "2px";
  ctx.fillText(weekday, W - 90, 118);
  ctx.restore();

  // 4. Day Text Hero Section (Spacious, elegant, zero chips, zero divider lines)
  ctx.save();
  ctx.font = `bold 100px 'Passion One', sans-serif`;
  ctx.fillStyle = hasColors ? "#FFFFFF" : INK;
  ctx.letterSpacing = "1px";
  if (hasColors) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }
  ctx.fillText(`${dayNum} ${monthName} ${year}`, 90, 275);
  ctx.shadowColor = "transparent";

  // Emotional spectrum / Stillness description as elegant typography (NO CHIPS)
  const dayMoodText =
    hasColors && emotionNames.length > 0
      ? emotionNames.join(" · ")
      : "Stillness · Clear Mind";

  ctx.font = `italic 30px 'Fraunces', serif`;
  ctx.fillStyle = hasColors ? "rgba(255, 255, 255, 0.88)" : INK_SOFT;
  ctx.letterSpacing = "0.5px";
  ctx.fillText(dayMoodText, 90, 335);
  ctx.restore();

  // 5. Day Reflection (if available) - pure typography, NO lines or boxes
  if (reflectionQuote) {
    ctx.save();
    ctx.font = `italic 32px 'Fraunces', serif`;
    ctx.fillStyle = hasColors ? "#FFFFFF" : INK;
    ctx.letterSpacing = "0.3px";
    drawWrappedText(ctx, `“${reflectionQuote}”`, 90, 560, W - 180, 52, 6);
    ctx.restore();
  }

  // 6. Minimalist Footer (NO divider line)
  ctx.save();
  ctx.font = `bold 18px 'Passion One', sans-serif`;
  ctx.fillStyle = hasColors ? "rgba(255, 255, 255, 0.75)" : INK;
  ctx.letterSpacing = "3px";
  ctx.fillText("CANOPY", 90, H - 75);

  ctx.textAlign = "right";
  ctx.font = `14px 'Fraunces', serif`;
  ctx.fillStyle = hasColors ? "rgba(255, 255, 255, 0.55)" : INK_SOFT;
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
}: {
  date: Date;
  colors: [number, number, number][];
  flowers?: FlowerEntry[];
}) {
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const hasColors = colors.length > 0;

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
        className="group relative w-full rounded-2xl overflow-hidden transition-all duration-300 mb-4 cursor-pointer hover:shadow-lg active:scale-[0.99]"
        style={{
          ...cardStyle,
          minHeight: 110,
          padding: "16px 18px",
          boxShadow: hasColors
            ? "inset 0 1px 3px rgba(255,255,255,0.25), 0 6px 18px rgba(28,46,42,0.1)"
            : "inset 0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(28,46,42,0.03)",
          border: `1px solid ${hasColors ? "rgba(28,46,42,0.12)" : "rgba(28,46,42,0.08)"}`,
        }}
        title="Tap to preview or save aesthetic art card"
      >
        {/* Authentic Fine Fractal Noise Texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_DATA_URI,
            backgroundRepeat: "repeat",
            opacity: hasColors ? 0.38 : 0.22,
            mixBlendMode: hasColors ? "overlay" : "multiply",
          }}
        />

        {/* Aesthetic Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[78px]">
          {/* Top row: Only the clean Save button (no chips) */}
          <div className="flex items-center justify-end">
            <button
              id="aura-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: hasColors ? "rgba(255,255,255,0.22)" : "rgba(28,46,42,0.08)",
                color: hasColors ? "#FFFFFF" : INK,
                border: `1px solid ${hasColors ? "rgba(255,255,255,0.28)" : "rgba(28,46,42,0.12)"}`,
                fontFamily: BODY,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
              title="Save aesthetic aura image"
            >
              <Download size={13} />
              <span>{saving ? "Saving…" : "Save"}</span>
            </button>
          </div>

          {/* Bottom row: Day text & Canopy watermark (No chips!) */}
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p
                style={{
                  fontFamily: HEAD,
                  fontSize: 28,
                  lineHeight: 1,
                  color: hasColors ? "#FFFFFF" : INK,
                  letterSpacing: "0.5px",
                  textShadow: hasColors ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {dayNum} {monthName} {year}
              </p>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  color: hasColors ? "rgba(255,255,255,0.85)" : INK_SOFT,
                  marginTop: 3,
                  fontStyle: "italic",
                }}
              >
                {hasColors && emotionNames.length > 0
                  ? emotionNames.join(" · ")
                  : "Stillness · Clear Mind"}
              </p>
            </div>

            <span
              style={{
                fontFamily: HEAD,
                fontSize: 13,
                letterSpacing: "1px",
                color: hasColors ? "rgba(255,255,255,0.6)" : "rgba(28,46,42,0.35)",
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

// ── Main Profile Component ─────────────────────────────────────────────────────
export function Profile() {
  const [allFlowers, setAllFlowers] = useState<FlowerEntry[]>([]);
  const [timeScope, setTimeScope] = useState<TimeScope>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => new Date().getDate());
  const [confirmReset, setConfirmReset] = useState(false);

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

  const arrowBtn = "w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform disabled:opacity-20";

  return (
    <div className="min-h-screen flex flex-col w-full pb-36" style={{ background: BG, color: INK }}>
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-8 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(28,46,42,0.05)" }}
            title="Canopy"
          >
            <SunShapeSvg width={24} height={24} />
          </div>
          <h1 style={{ fontFamily: HEAD, fontSize: 38, lineHeight: 1, color: INK, letterSpacing: "0.5px" }}>
            Profile
          </h1>
        </div>
        <p className="sr-only">Your urge patterns, without judgment</p>

        {/* Quick jump to Today if drifted */}
        {!isCurrentPeriod && (
          <button
            onClick={jumpToToday}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
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
      </div>

      {/* ── Refined Time Scope Switcher (Day · Week · Month) ────────────────── */}
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

        {/* Period Navigation Ribbon */}
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
        <InsightCard
          scope={timeScope}
          total={stats.total}
          keptN={stats.keptN}
          spentN={stats.spentN}
          keptHours={activeKeptHours}
          topMood={moodMix[0]}
          peakLabel={peakTime && peakTime.count > 0 ? peakTime.label : undefined}
        />

        {/* ── DAY VIEW ───────────────────────────────────────────────────────── */}
        {timeScope === "day" && (
          <>
            {/* Interactive Day Aura at Top + Day Scrubber */}
            <Card pad={16}>
              <AestheticAuraCard
                date={selectedDate}
                colors={
                  dayFlowers
                    .map((f) => resolveEmotionRgb(f.emotion))
                    .filter((c): c is [number, number, number] => c !== null)
                }
                flowers={dayFlowers}
              />
              <DayScrubber
                currentDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedDayNumber(d.getDate());
                }}
                allFlowers={allFlowers}
              />
            </Card>

            {/* Day Financial & Impulse Reframe */}
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

            {/* Day Reflections & Logged Urge Notes */}
            {dayFlowers.length > 0 ? (
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

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[rgba(28,46,42,0.05)]" style={{ fontFamily: BODY, color: INK_SOFT }}>
                          <span className="flex items-center gap-1.5">
                            <i style={{ width: 8, height: 8, borderRadius: "50%", background: rgbStr(emColor) }} />
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
            ) : (
              <Card pad={20}>
                <Title hint="Mindful pause">Today's reflections</Title>
                <p style={{ fontFamily: BODY, fontSize: 15, color: INK_SOFT, textAlign: "center", padding: "16px 0" }}>
                  No urges logged on this day. You kept all your money and time.
                </p>
              </Card>
            )}

            {/* Day Hourly Pulse */}
            {dayFlowers.length > 0 && (
              <Card pad={20}>
                <Title hint="When urges surfaced today">Hourly pulse</Title>
                <div className="flex flex-col gap-3">
                  {timeBuckets.map((t) => (
                    <div key={t.label}>
                      <div className="flex items-baseline justify-between">
                        <span style={{ fontFamily: BODY, fontSize: 15, color: INK }}>
                          {t.label} <span style={{ fontSize: 13, color: INK_SOFT }}>({t.range})</span>
                        </span>
                        <span style={{ fontFamily: HEAD, fontSize: 17, color: INK }}>
                          {t.count} · {fmt(t.amount)}
                        </span>
                      </div>
                      <div className="w-full rounded-full overflow-hidden mt-1.5" style={{ height: 6, background: EMPTY }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(t.count / maxTime) * 100}%`,
                            background: t.count > 0 ? KEPT : INK_FAINT,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── WEEK VIEW ──────────────────────────────────────────────────────── */}
        {timeScope === "week" && (
          <>
            {/* Week Summary Hero */}
            <Card pad={24}>
              <div className="flex items-center justify-between">
                <p style={{ fontFamily: BODY, fontSize: 16, color: INK_SOFT }}>Let go this week</p>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{
                    background: "rgba(47,107,94,0.12)",
                    color: KEPT,
                    fontFamily: BODY,
                  }}
                >
                  <Zap size={12} />
                  {fmtWork(weekKeptHours)} of work saved
                </span>
              </div>

              <p style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1.05, color: KEPT, marginTop: 4 }}>
                {fmt(stats.kept)}
              </p>
              <p style={{ fontFamily: BODY, fontSize: 15, color: INK, marginTop: 4 }}>
                {stats.total} urges paused · {stats.plannedPct}% planned
              </p>

              <div className="flex w-full rounded-full overflow-hidden mt-5" style={{ height: 10, background: EMPTY }}>
                <div style={{ width: `${(stats.kept / barTotal) * 100}%`, background: KEPT }} />
                <div style={{ width: `${(stats.spent / barTotal) * 100}%`, background: SPENT }} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="p-3.5 rounded-2xl" style={{ background: "rgba(47,107,94,0.05)", border: "1px solid rgba(47,107,94,0.12)" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: KEPT, fontFamily: BODY }}>
                      <ArrowUpRight size={14} /> Let go
                    </span>
                    <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: KEPT }}>
                      +{weekKeptHours}h
                    </span>
                  </div>
                  <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.kept)}</p>
                  <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.keptN} diverted</p>
                </div>

                <div className="p-3.5 rounded-2xl" style={{ background: "rgba(181,131,106,0.08)", border: "1px solid rgba(181,131,106,0.15)" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SPENT, fontFamily: BODY }}>
                      <ArrowDownRight size={14} /> Bought
                    </span>
                    <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: SPENT }}>
                      -{weekSpentHours}h
                    </span>
                  </div>
                  <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.spent)}</p>
                  <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.spentN} bought</p>
                </div>
              </div>
            </Card>

            {/* Weekly Labor Bar */}
            <Card pad={22}>
              <div className="flex items-center justify-between mb-1">
                <Title hint="Hours of work saved vs traded on micro-indulgences">
                  Weekly labor bar
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
                    {weekKeptHours}h
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                    life preserved
                  </span>
                </div>
                <div>
                  <span style={{ fontFamily: HEAD, fontSize: 20, color: SPENT }}>
                    {weekSpentHours}h
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                    traded away
                  </span>
                </div>
              </div>

              <div className="w-full rounded-full overflow-hidden flex" style={{ height: 16, background: EMPTY }}>
                {weekKeptHours > 0 && (
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{
                      width: `${weekKeptPct}%`,
                      background: KEPT,
                      fontFamily: HEAD,
                    }}
                  >
                    {weekKeptPct > 15 ? `${weekKeptPct}%` : ""}
                  </div>
                )}
                {weekSpentHours > 0 && (
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{
                      width: `${100 - weekKeptPct}%`,
                      background: SPENT,
                      fontFamily: HEAD,
                    }}
                  >
                    {(100 - weekKeptPct) > 15 ? `${100 - weekKeptPct}%` : ""}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(28,46,42,0.06)]" style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
                <span>Week saved: {fmt(weekKeptAmt)}</span>
                <span>{fmt(weekSpentAmt)} spent</span>
              </div>

              <p style={{ fontFamily: BODY, fontSize: 12.5, color: "rgba(28,46,42,0.55)", lineHeight: 1.5, marginTop: 10 }}>
                {weekKeptHours >= weekSpentHours
                  ? "Great week: you're keeping more of your money and time. Every paused urge saves hours of work."
                  : "You spent more hours of work than you saved this week. Next time, pause and draw before you decide."}
              </p>
            </Card>

            {/* 7-Day Day-by-Day Bars */}
            <Card>
              <Title hint="Tap any day to focus its date in Day view">7-day breakdown</Title>
              <WeekBars
                weekDays={weekDaysData}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedDayNumber(d.getDate());
                  setTimeScope("day");
                }}
              />
            </Card>

            {/* Week Mood Mix */}
            {moodMix.length > 0 && (
              <Card>
                <Title hint="Emotions guiding your impulses this week">Week's emotional spectrum</Title>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {moodMix.map((m) => (
                    <span key={m.name} className="flex items-center gap-2" style={{ fontFamily: BODY, fontSize: 16, color: INK }}>
                      <i style={{ width: 14, height: 14, borderRadius: 5, background: rgbStr(m.rgb), display: "inline-block" }} />
                      {m.name} {m.pct}%
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── MONTH VIEW ─────────────────────────────────────────────────────── */}
        {timeScope === "month" && (
          <>
            {/* Monthly Summary Hero */}
            <Card pad={24}>
              <div className="flex items-center justify-between">
                <p style={{ fontFamily: BODY, fontSize: 16, color: INK_SOFT }}>Let go this month</p>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{
                    background: "rgba(47,107,94,0.12)",
                    color: KEPT,
                    fontFamily: BODY,
                  }}
                >
                  <Zap size={12} />
                  {fmtWork(activeKeptHours)} of work saved
                </span>
              </div>

              <p style={{ fontFamily: HEAD, fontSize: 56, lineHeight: 1.05, color: KEPT, marginTop: 4 }}>
                {fmt(stats.kept)}
              </p>
              <p style={{ fontFamily: BODY, fontSize: 15, color: INK, marginTop: 4 }}>
                {stats.total} urges paused · {stats.plannedPct}% planned
              </p>

              <div className="flex w-full rounded-full overflow-hidden mt-5" style={{ height: 10, background: EMPTY }}>
                <div style={{ width: `${(stats.kept / barTotal) * 100}%`, background: KEPT }} />
                <div style={{ width: `${(stats.spent / barTotal) * 100}%`, background: SPENT }} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="p-3.5 rounded-2xl" style={{ background: "rgba(47,107,94,0.05)", border: "1px solid rgba(47,107,94,0.12)" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: KEPT, fontFamily: BODY }}>
                      <ArrowUpRight size={14} /> Let go
                    </span>
                    <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: KEPT }}>
                      +{activeKeptHours}h
                    </span>
                  </div>
                  <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.kept)}</p>
                  <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.keptN} impulses diverted</p>
                </div>

                <div className="p-3.5 rounded-2xl" style={{ background: "rgba(181,131,106,0.08)", border: "1px solid rgba(181,131,106,0.15)" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SPENT, fontFamily: BODY }}>
                      <ArrowDownRight size={14} /> Bought
                    </span>
                    <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: SPENT }}>
                      -{activeSpentHours}h
                    </span>
                  </div>
                  <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.spent)}</p>
                  <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.spentN} impulses purchased</p>
                </div>
              </div>
            </Card>

            {/* Weekly Labor Bar */}
            <Card pad={22}>
              <div className="flex items-center justify-between mb-1">
                <Title hint="Hours of this week's work saved vs spent on micro-indulgences">
                  Weekly labor bar
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
                    {weekKeptHours}h
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                    of work saved
                  </span>
                </div>
                <div>
                  <span style={{ fontFamily: HEAD, fontSize: 20, color: SPENT }}>
                    {weekSpentHours}h
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                    traded away
                  </span>
                </div>
              </div>

              <div className="w-full rounded-full overflow-hidden flex" style={{ height: 16, background: EMPTY }}>
                {weekKeptHours > 0 && (
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{
                      width: `${weekKeptPct}%`,
                      background: KEPT,
                      fontFamily: HEAD,
                    }}
                  >
                    {weekKeptPct > 15 ? `${weekKeptPct}%` : ""}
                  </div>
                )}
                {weekSpentHours > 0 && (
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{
                      width: `${100 - weekKeptPct}%`,
                      background: SPENT,
                      fontFamily: HEAD,
                    }}
                  >
                    {(100 - weekKeptPct) > 15 ? `${100 - weekKeptPct}%` : ""}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(28,46,42,0.06)]" style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
                <span>This week: {fmt(weekKeptAmt)} saved</span>
                <span>{fmt(weekSpentAmt)} spent</span>
              </div>

              <p style={{ fontFamily: BODY, fontSize: 12.5, color: "rgba(28,46,42,0.55)", lineHeight: 1.5, marginTop: 10 }}>
                {weekKeptHours >= weekSpentHours
                  ? "Great week: you're keeping more of your money and time. Every paused urge saves hours of work."
                  : "You spent more hours of work than you saved this week. Next time, pause and draw before you decide."}
              </p>
            </Card>

            {/* Interactive Mood Calendar with Aesthetic Aura Card at TOP */}
            <Card>
              <Title hint="Tap any day below to change the mood aura">
                Mood this month
              </Title>

              {/* Aesthetic Downloadable Aura Card at TOP */}
              <AestheticAuraCard
                date={selectedCalendarDayData.dateObj}
                colors={selectedCalendarDayData.colors}
                flowers={selectedCalendarDayData.flowers}
              />

              <MoodGradientCalendar
                days={days}
                year={year}
                month={month}
                selectedDayNumber={selectedDayNumber}
                onSelectDay={(dayNum) => {
                  setSelectedDayNumber(dayNum);
                  const newD = new Date(year, month, dayNum);
                  setSelectedDate(newD);
                }}
              />

              {moodMix.length > 0 && (
                <div className="flex flex-wrap gap-x-5 gap-y-3 mt-5">
                  {moodMix.map((m) => (
                    <span key={m.name} className="flex items-center gap-2" style={{ fontFamily: BODY, fontSize: 16, color: INK }}>
                      <i style={{ width: 14, height: 14, borderRadius: 5, background: rgbStr(m.rgb), display: "inline-block" }} />
                      {m.name} {m.pct}%
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Daily Money Distribution Bars */}
            <Card>
              <Title hint="What you let go vs bought, day by day">Daily money</Title>
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
          </>
        )}

        {/* ── Top Categories ─────────────────────────────────────────────────── */}
        {topCategories.length > 0 && (
          <Card>
            <Title>Top categories</Title>
            <div className="flex flex-col gap-5">
              {topCategories.map((c) => (
                <div key={c.name}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontFamily: BODY, fontSize: 17, color: INK }}>{c.name}</span>
                    <span style={{ fontFamily: HEAD, fontSize: 20, color: INK }}>{fmt(c.total)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: 8, background: EMPTY }}>
                    <div className="h-full rounded-full" style={{ width: `${c.w}%`, background: INK }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Patterns: When It Happens ───────────────────────────────────────── */}
        {stats.total > 0 && timeScope === "month" && (
          <Card>
            <Title hint={`You want things most in the ${peakTime.label.toLowerCase()} (${peakTime.range})`}>
              When it happens
            </Title>
            <div className="flex flex-col gap-4">
              {timeBuckets.map((t) => (
                <div key={t.label}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontFamily: BODY, fontSize: 17, color: INK }}>
                      {t.label} <span style={{ fontSize: 14, color: INK_SOFT }}>{t.range}</span>
                    </span>
                    <span style={{ fontFamily: HEAD, fontSize: 18, color: INK }}>{t.count} · {fmt(t.amount)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: 8, background: EMPTY }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(t.count / maxTime) * 100}%`,
                        background: t === peakTime ? INK : "rgba(28,46,42,0.3)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 flex flex-col gap-3" style={{ borderTop: `1px solid ${BORDER}`, fontFamily: BODY, fontSize: 17, lineHeight: 1.5, color: INK }}>
              {topCategories[0] && (
                <p>
                  <strong>{topCategories[0].name}</strong> is where most goes: {fmt(topCategories[0].total)} ({Math.round((topCategories[0].total / (topCategories.reduce((s, c) => s + c.total, 0) || 1)) * 100)}% of this period).
                </p>
              )}
              {moodMix[0] && (
                <p>
                  <strong>{moodMix[0].name}</strong> is your most common trigger ({moodMix[0].pct}% of moments).
                </p>
              )}
            </div>
          </Card>
        )}

        {/* ── Intentions & Settings ─────────────────────────────────────────── */}
        <Card>
          <Title hint="Your grounded intentions and work conversion">
            Your canopy intentions & settings
          </Title>
          <div className="flex flex-col gap-3.5">
            {/* User problem to soften */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: EMPTY }}
            >
              <div className="flex-1 mr-2 min-w-0">
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Impulse patterns to soften
                </p>
                {isEditingProblem ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempProblem}
                      onChange={(e) => setTempProblem(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-sm bg-white border border-gray-300 outline-none"
                      style={{ fontFamily: BODY, fontSize: 14 }}
                      placeholder="e.g. Late-night scrolling, Stress"
                      autoFocus
                    />
                    <button
                      onClick={saveProblem}
                      className="p-2 rounded-lg text-white shrink-0 cursor-pointer"
                      style={{ background: KEPT }}
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: INK, marginTop: 2 }}>
                    {profileProblem || "Late-night scrolling, Sales and discounts"}
                  </p>
                )}
              </div>
              {!isEditingProblem && (
                <button
                  onClick={() => {
                    setTempProblem(profileProblem || "Late-night scrolling");
                    setIsEditingProblem(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  style={{
                    background: CARD,
                    color: INK,
                    fontFamily: BODY,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Edit2 size={12} />
                  Change
                </button>
              )}
            </div>

            {/* Personal goal to grow */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: EMPTY }}
            >
              <div className="flex-1 mr-2 min-w-0">
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Growing money towards
                </p>
                {isEditingGoal ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-sm bg-white border border-gray-300 outline-none"
                      style={{ fontFamily: BODY, fontSize: 14 }}
                      placeholder="e.g. Dream travel & adventures"
                      autoFocus
                    />
                    <button
                      onClick={saveGoal}
                      className="p-2 rounded-lg text-white shrink-0 cursor-pointer"
                      style={{ background: KEPT }}
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: FOREST, marginTop: 2 }}>
                    {profileGoal || "Financial peace of mind"}
                  </p>
                )}
              </div>
              {!isEditingGoal && (
                <button
                  onClick={() => {
                    setTempGoal(profileGoal || "Financial peace of mind");
                    setIsEditingGoal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  style={{
                    background: CARD,
                    color: INK,
                    fontFamily: BODY,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Edit2 size={12} />
                  Change
                </button>
              )}
            </div>

            {/* Salary setting */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: EMPTY }}
            >
              <div>
                <p style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT }}>Monthly take-home salary</p>
                {isEditingWage ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontFamily: HEAD, fontSize: 20, color: INK }}>₹</span>
                    <input
                      type="number"
                      value={tempWage}
                      onChange={(e) => setTempWage(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg text-sm bg-white border border-gray-300 outline-none"
                      style={{ fontFamily: HEAD, fontSize: 18 }}
                      placeholder="e.g. 40000"
                      inputMode="numeric"
                      autoFocus
                    />
                    <button
                      onClick={saveWage}
                      className="p-1.5 rounded-lg text-white cursor-pointer"
                      style={{ background: KEPT }}
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: HEAD, fontSize: 22, color: INK, marginTop: 2 }}>
                      ₹{monthlySalary.toLocaleString("en-IN")}/month
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
                      ≈ ₹{Math.round(monthlySalary / 22).toLocaleString("en-IN")} for each day of work
                    </p>
                  </>
                )}
              </div>
              {!isEditingWage && (
                <button
                  onClick={() => {
                    setTempWage(String(monthlySalary));
                    setIsEditingWage(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  style={{
                    background: CARD,
                    color: INK,
                    fontFamily: BODY,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Edit2 size={12} />
                  Change
                </button>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("canopy_onboarded");
                window.location.href = "/?reboard=1";
              }}
              className="w-full text-left rounded-2xl px-4 py-3 cursor-pointer transition-colors hover:bg-stone-100"
              style={{ background: EMPTY, fontFamily: BODY, fontSize: 15, color: FOREST }}
            >
              Revisit onboarding journey
            </button>
            <button onClick={exportData} className="w-full text-left rounded-2xl px-4 py-3 cursor-pointer transition-colors hover:bg-stone-100" style={{ background: EMPTY, fontFamily: BODY, fontSize: 15, color: INK }}>
              Export my data
            </button>
            <button onClick={() => setConfirmReset(true)} className="w-full text-left rounded-2xl px-4 py-3 cursor-pointer transition-colors hover:bg-stone-100" style={{ background: EMPTY, fontFamily: BODY, fontSize: 15, color: SPENT }}>
              Reset all data
            </button>
          </div>
        </Card>
      </div>

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
