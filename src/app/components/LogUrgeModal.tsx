import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Undo2 } from "lucide-react";
import { useNavigate } from "react-router";

import imgHappy from "../../imports/1.png";
import imgCalm from "../../imports/2.png";
import imgNeutral from "../../imports/3.png";
import imgAnxious from "../../imports/4.png";
import imgStressed from "../../imports/5.png";
import imgCraving from "../../imports/6.png";

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOTIONS = [
  { name: "Happy",     img: imgHappy,   hex: "#E5C253" },
  { name: "Calm",      img: imgCalm,    hex: "#6AB5A9" },
  { name: "Neutral",   img: imgNeutral, hex: "#5E94CB" },
  { name: "Anxious",   img: imgAnxious, hex: "#A073C4" },
  { name: "Stressed",  img: imgStressed,hex: "#D56B6B" },
  { name: "Craving",   img: imgCraving, hex: "#D98A52" },
];

const FOR_OPTIONS = [
  { label: "myself" },
  { label: "someone else" },
  { label: "future me" },
];

const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const MONO = BODY;   // alias so existing usages still resolve
const SERIF = HEAD;  // alias so existing usages still resolve
const LABEL: React.CSSProperties = {
  fontFamily: MONO, fontWeight: 600, fontSize: "11px",
  color: "#8A827E", letterSpacing: "0.02em",
};
const UNDERLINE: React.CSSProperties = { borderBottom: "1px solid rgba(28,46,42,0.15)", paddingBottom: 6 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function taskTime(price: number) {
  return Math.min(240, Math.round(60 + price * 0.3));
}

function taskType(price: number): { label: string; desc: string } {
  if (price < 100) return { label: "Single Flower", desc: "Trace 5–8 petals, slow and rhythmic" };
  if (price < 500) return { label: "Wildflower Cluster", desc: "Draw multiple stems and leaves" };
  return { label: "Imagination Tree", desc: "Branches, roots, and every detail you imagine" };
}

function hoursOfLife(price: number) {
  const hrs = price / 25;
  return hrs < 1 ? `${Math.round(hrs * 60)} minutes` : `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)} hours`;
}

// ─── Oil pastel canvas helpers ───────────────────────────────────────────────
interface Point { x: number; y: number; pressure?: number }

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadeColor(hex: string, darken = 0, lighten = 0): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - darken));
  const dg = Math.round(g * (1 - darken));
  const db = Math.round(b * (1 - darken));
  const lr = Math.round(dr + (255 - dr) * lighten);
  const lg = Math.round(dg + (255 - dg) * lighten);
  const lb = Math.round(db + (255 - db) * lighten);
  return `rgb(${lr},${lg},${lb})`;
}

function paintOilPastelDot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, pressure: number) {
  const { r, g, b } = hexToRgb(color);
  const bristles = Math.floor(10 + pressure * 8);
  const spread = size * 0.55;

  for (let i = 0; i < bristles; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * spread;
    const jx = Math.cos(angle) * dist;
    const jy = Math.sin(angle) * dist * 0.85;
    const radius = size * (0.15 + Math.random() * 0.45);
    const dr = Math.round((Math.random() - 0.5) * 18);
    const dg = Math.round((Math.random() - 0.5) * 18);
    const db = Math.round((Math.random() - 0.5) * 18);
    const alpha = (0.06 + pressure * 0.10) * (0.5 + Math.random() * 0.5);

    ctx.beginPath();
    ctx.arc(x + jx, y + jy, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(255, Math.max(0, r + dr))},${Math.min(255, Math.max(0, g + dg))},${Math.min(255, Math.max(0, b + db))},${alpha})`;
    ctx.fill();
  }
}

function paintOilPastelSegment(ctx: CanvasRenderingContext2D, from: Point, to: Point, size: number, color: string) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.floor(dist / (size * 0.25)));
  const velocity = dist;
  const pressure = Math.max(0.2, Math.min(1.0, 1.2 - velocity / 80));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const p = (from.pressure ?? pressure) * (1 - t) + (to.pressure ?? pressure) * t;
    paintOilPastelDot(ctx, x, y, size, color, p);
  }
}

// ─── Stroke sizes ─────────────────────────────────────
const STROKE_SIZES = [
  { id: "sm", label: "S", size: 8,  darken: 0.55, lighten: 0    },
  { id: "md", label: "M", size: 14, darken: 0,    lighten: 0    },
  { id: "lg", label: "L", size: 22, darken: 0,    lighten: 0.60 },
];

interface VectorStroke { points: Point[]; color: string; width: number; closed: boolean }
const AUTOCLOSE_PX = 62;

function buildSVGDataURL(strokes: VectorStroke[]): string {
  const all = strokes.flatMap((s) => s.points);
  if (all.length === 0) return "";
  const pad = 6;
  const minX = Math.min(...all.map((p) => p.x)) - pad;
  const minY = Math.min(...all.map((p) => p.y)) - pad;
  const maxX = Math.max(...all.map((p) => p.x)) + pad;
  const maxY = Math.max(...all.map((p) => p.y)) + pad;

  const paths = strokes.map((s) => {
    const pts = s.points;
    if (pts.length < 2) return "";
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`;
    }
    d += s.closed ? " Z" : ` L${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    const fill = s.closed ? s.color : "none";
    const fillOpacity = s.closed ? "1" : "0";
    return `<path d="${d}" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}" fill-opacity="${fillOpacity}"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">${paths}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function haptic(ms = 2) {
  try { if ("vibrate" in navigator) navigator.vibrate(ms); } catch {}
}

// ─── Drawing Canvas Step ──────────────────────────────────────────────────────
function DrawingStep({ item, price, emotion, onDone }: { item: string; price: number; emotion: typeof EMOTIONS[0] | undefined; onDone: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPt = useRef<Point | null>(null);
  const snapshotStack = useRef<ImageData[]>([]);
  const vectorStrokes = useRef<VectorStroke[]>([]);
  const currentVectorPts = useRef<Point[]>([]);
  const lastHapticAt = useRef(0);
  const [started, setStarted] = useState(false);
  const [brushSizeId, setBrushSizeId] = useState("md");
  const duration = taskTime(price);
  const [timeLeft, setTimeLeft] = useState(duration);
  const task = taskType(price);
  const baseColor = emotion?.hex ?? "#6AB5A9";
  const CANVAS_SIZE = 900;

  const activeSizeObj = STROKE_SIZES.find((s) => s.id === brushSizeId) ?? STROKE_SIZES[1];
  const brushSize = activeSizeObj.size;
  const paintColor = shadeColor(baseColor, activeSizeObj.darken, activeSizeObj.lighten);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
  }, []);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [started, timeLeft]);

  function getPoint(e: React.MouseEvent | React.TouchEvent): Point | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      const touch = (e as React.TouchEvent).touches[0] ?? (e as React.TouchEvent).changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * CANVAS_SIZE * 10) / 10,
      y: Math.round(((clientY - rect.top) / rect.height) * CANVAS_SIZE * 10) / 10,
    };
  }

  function saveSnapshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    snapshotStack.current.push(ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE));
    if (snapshotStack.current.length > 40) snapshotStack.current.shift();
  }

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!started) setStarted(true);
    const pt = getPoint(e);
    if (!pt) return;
    saveSnapshot();
    isDrawing.current = true;
    lastPt.current = pt;
    currentVectorPts.current = [pt];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) paintOilPastelDot(ctx, pt.x, pt.y, brushSize, paintColor, 0.8);
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing.current || !lastPt.current) return;
    const pt = getPoint(e);
    if (!pt) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) paintOilPastelSegment(ctx, lastPt.current, pt, brushSize, paintColor);
    lastPt.current = pt;
    currentVectorPts.current.push(pt);

    const now = Date.now();
    if (now - lastHapticAt.current > 70) {
      haptic(2);
      lastHapticAt.current = now;
    }
  }

  function onPointerUp(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const pts = currentVectorPts.current;
    if (pts.length > 1) {
      const svgWidth = Math.max(1.5, Math.round((brushSize / CANVAS_SIZE) * 900 * 0.55 * 10) / 10);
      const first = pts[0];
      const last = pts[pts.length - 1];
      const gap = Math.hypot(last.x - first.x, last.y - first.y);
      const closed = pts.length > 4 && gap < AUTOCLOSE_PX;

      if (closed) {
        pts.push({ ...first });
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          const { r, g, b } = hexToRgb(baseColor);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fill();
          haptic(8);
        }
      }

      vectorStrokes.current.push({ points: [...pts], color: paintColor, width: svgWidth, closed });
    }
    currentVectorPts.current = [];
    isDrawing.current = false;
    lastPt.current = null;
  }

  function handleUndo() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (vectorStrokes.current.length > 0) vectorStrokes.current.pop();
    if (snapshotStack.current.length === 0) {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      ctx.putImageData(snapshotStack.current.pop()!, 0, 0);
    }
    haptic(4);
  }

  function handleDone() {
    const svg = buildSVGDataURL(vectorStrokes.current);
    onDone(svg || "");
  }

  const pct = (timeLeft / duration) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;

  return (
    <div className="flex flex-col h-full bg-[#FCFCFC]">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "20px", color: "#1C2E2A", lineHeight: 1.1 }}>{task.label}</p>
            <p style={{ fontFamily: MONO, fontSize: "10px", color: "#8A827E", marginTop: 2 }}>{task.desc}</p>
          </div>
          {/* Timer ring */}
          <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52 }}>
            <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(28,46,42,0.1)" strokeWidth="3" />
              <circle cx="26" cy="26" r="22" fill="none" stroke={baseColor} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: "10px", color: "#1C2E2A" }}>{timeStr}</span>
          </div>
        </div>

        {price > 0 && (
          <div className="rounded-xl px-3 py-2 mb-2" style={{ background: `${baseColor}12`, border: `1px solid ${baseColor}22` }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", color: baseColor }}>
              this costs <span style={{ fontWeight: 600 }}>{hoursOfLife(price)} of your life</span>
            </p>
          </div>
        )}

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "11px", color: "#8A827E", lineHeight: 1.5 }}>
          "Draw to feel the movement, not to make art. There are no mistakes."
        </p>
      </div>

      <div className="flex-1 mx-4 relative rounded-2xl overflow-hidden" style={{ minHeight: 0, background: "#FFFFFF", border: `1.5px solid ${baseColor}33` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none block"
          style={{ cursor: "crosshair" }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />

        <div
          className="absolute top-3 left-1/2 flex items-center gap-3 px-4 py-2.5 rounded-full"
          style={{ transform: "translateX(-50%)", background: "rgba(252,252,252,0.92)", backdropFilter: "blur(8px)", border: "1px solid rgba(28,46,42,0.1)", boxShadow: "0 2px 10px rgba(28,46,42,0.08)" }}
        >
          {STROKE_SIZES.map((s) => {
            const dotColor = shadeColor(baseColor, s.darken, s.lighten);
            const active = brushSizeId === s.id;
            const dotPx = s.id === "sm" ? 7 : s.id === "md" ? 11 : 16;
            return (
              <button
                key={s.id}
                onClick={() => setBrushSizeId(s.id)}
                className="flex items-center justify-center rounded-full transition-all"
                style={{ width: 34, height: 34, background: active ? `${baseColor}22` : "transparent", border: active ? `1.5px solid ${baseColor}55` : "1.5px solid transparent" }}
              >
                <div className="rounded-full transition-all" style={{ width: dotPx, height: dotPx, background: dotColor }} />
              </button>
            );
          })}
        </div>

        {!started && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "14px", color: "rgba(28,46,42,0.4)" }}>start drawing…</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-3 flex-shrink-0 flex gap-3">
        <button
          onClick={handleUndo}
          className="w-12 h-14 flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ background: "rgba(28,46,42,0.05)", border: "1px solid rgba(28,46,42,0.1)" }}
        >
          <Undo2 className="w-4 h-4" style={{ color: "#1C2E2A" }} />
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDone}
          className="flex-1 py-4 rounded-2xl"
          style={{ background: "#1C2E2A", color: "white", fontFamily: MONO, fontWeight: 700, fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 8px 20px rgba(28,46,42,0.2)" }}
        >
          {timeLeft === 0 ? "plant it →" : "i'm ready →"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function LogUrgeModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [emotion, setEmotion] = useState(EMOTIONS[0].name);
  const [forOpt, setForOpt] = useState(FOR_OPTIONS[0].label);
  const [journal, setJournal] = useState("");
  const [step, setStep] = useState<"form" | "draw">("form");

  const selectedEmotion = EMOTIONS.find((e) => e.name === emotion) ?? EMOTIONS[0];

  function handleLog() {
    if (!item) return;
    localStorage.setItem("currentEmotion", JSON.stringify({ name: selectedEmotion.name, hex: selectedEmotion.hex }));
    localStorage.setItem("purchaseCost", amount || "0");
    localStorage.setItem("urgeItem", item);
    localStorage.setItem("currentWhoFor", forOpt);
    if (journal) localStorage.setItem("currentJournal", journal);
    setStep("draw");
  }

  function handleDrawDone(dataUrl: string) {
    if (dataUrl) localStorage.setItem("currentDrawing", dataUrl);
    localStorage.setItem("drawingCompleted", "true");
    onClose();
    navigate("/plant");
  }

  return (
    <AnimatePresence>
      <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: "rgba(28,46,42,0.4)", backdropFilter: "blur(4px)" }}
        onClick={step === "form" ? onClose : undefined}
      />

      <motion.div
        key="sheet"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 340 }}
        className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
        style={{ height: "92dvh", background: "#FCFCFC", borderRadius: "32px 32px 0 0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "form" ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-5 pb-2 flex items-center justify-between">
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "24px", color: "#1C2E2A" }}>Log the urge</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "rgba(28,46,42,0.06)" }}>
                <X className="w-4 h-4" style={{ color: "#1C2E2A" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-8">
              
              {/* What + How much */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <p style={LABEL}>What is it?</p>
                  <div style={UNDERLINE}>
                    <input value={item} onChange={(e) => setItem(e.target.value)}
                      placeholder="New headphones…"
                      className="w-full bg-transparent outline-none"
                      style={{ fontFamily: MONO, fontSize: "15px", color: "#1C2E2A" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p style={LABEL}>How much?</p>
                  <div style={UNDERLINE}>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)}
                      placeholder="$0.00" type="number"
                      className="w-full bg-transparent outline-none"
                      style={{ fontFamily: MONO, fontSize: "15px", color: "#1C2E2A" }} />
                  </div>
                </div>
              </div>

              {/* ── Feeling ── */}
              <div className="flex flex-col gap-3">
                <p style={LABEL}>How are you feeling?</p>
                <div className="grid grid-cols-3 gap-3">
                  {EMOTIONS.map((e) => {
                    const active = emotion === e.name;
                    return (
                      <button key={e.name} onClick={() => setEmotion(e.name)}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl transition-all"
                        style={{
                          padding: "12px 4px",
                          background: active ? `${e.hex}15` : "transparent",
                          border: `1.5px solid ${active ? e.hex : "rgba(28,46,42,0.08)"}`,
                          transform: active ? "scale(1.02)" : "scale(1)",
                        }}>
                        <img src={e.img} alt={e.name} className="w-12 h-12 object-contain drop-shadow-sm" />
                        <span style={{
                          fontFamily: MONO, fontSize: 11,
                          color: active ? "#1C2E2A" : "#8A827E",
                          fontWeight: active ? 600 : 400,
                        }}>
                          {e.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Who is it for? ── */}
              <div className="flex flex-col gap-3">
                <p style={LABEL}>Who is it for?</p>
                <div className="flex gap-2">
                  {FOR_OPTIONS.map((opt) => {
                    const active = forOpt === opt.label;
                    return (
                      <button key={opt.label} onClick={() => setForOpt(opt.label)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 justify-center transition-all"
                        style={{
                          background: active ? "#1C2E2A" : "transparent",
                          border: `1px solid ${active ? "#1C2E2A" : "rgba(28,46,42,0.15)"}`,
                        }}>
                        <span style={{ fontFamily: MONO, fontSize: 11,
                          color: active ? "white" : "#1C2E2A",
                          fontWeight: active ? 600 : 400 }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Journal */}
              <div className="flex flex-col gap-2 pb-6">
                <p style={LABEL}>Journal <span style={{ color: "#8A827E", fontWeight: 400 }}>(optional)</span></p>
                <textarea value={journal} onChange={(e) => setJournal(e.target.value)}
                  placeholder="What's on your mind…"
                  rows={3}
                  className="w-full rounded-2xl px-4 py-3 resize-none outline-none transition-colors"
                  style={{ background: "rgba(28,46,42,0.02)", border: "1px solid rgba(28,46,42,0.1)",
                    fontFamily: MONO, fontSize: 13, color: "#1C2E2A", lineHeight: 1.6 }} />
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t" style={{ borderColor: "rgba(28,46,42,0.05)", background: "#FCFCFC" }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleLog} disabled={!item}
                className="w-full py-4 rounded-2xl transition-all"
                style={{
                  background: item ? "#1C2E2A" : "rgba(28,46,42,0.1)",
                  color: item ? "white" : "rgba(28,46,42,0.4)",
                  fontFamily: MONO, fontWeight: 700, fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase",
                  boxShadow: item ? "0 8px 20px rgba(28,46,42,0.2)" : "none"
                }}>
                next →
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <DrawingStep item={item} price={parseFloat(amount) || 0} emotion={selectedEmotion} onDone={handleDrawDone} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}