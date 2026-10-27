import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { trimDrawingImage } from "../utils/trimDrawing";
import {
  buildZIndexMap,
  flowerPct,
  flowerRenderSize,
} from "./gardenZ";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Tag,
  DollarSign,
  User,
  BookOpen,
  Mic,
  X,
  Share,
  Download,
} from "lucide-react";
import ScribblePng from "../../imports/115.png";
import { ReceiptModal } from "./ReceiptModal";
import { SunShapeSvg } from "./SunShapeSvg";

const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

const DAY_1 = ["S", "M", "T", "W", "T", "F", "S"];

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
// Monday-anchored start of the ISO week containing `d`.
export function startOfWeek(d: Date) {
  const x = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  );
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function sameWeek(a: Date, b: Date) {
  return startOfWeek(a).getTime() === startOfWeek(b).getTime();
}
// e.g. "Jun 15 – 21" or "Jun 29 – Jul 5"
function weekRangeLabel(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  const sM = s.toLocaleDateString("en-US", { month: "short" });
  const eM = e.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${sM} ${s.getDate()} – ${e.getDate()}`
    : `${sM} ${s.getDate()} – ${eM} ${e.getDate()}`;
}

// ── Calendar Strip ────────────────────────────────────────────────
const STRIP_START = new Date(2026, 0, 1); // Jan 1 2026
const DAY_W = 48; // px per day cell incl. gap

function RecentDaysStrip({
  selectedDate,
  onSelectDate,
  flowersByDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  flowersByDate: Map<string, number>;
}) {
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);
  const [showJump, setShowJump] = useState(false);

  // Build every day from Jan 1 2026 → today
  const days: Date[] = [];
  const cursor = new Date(STRIP_START);
  while (cursor <= today) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const el = todayRef.current;
      const container = scrollRef.current;
      // Center today in the viewport
      const offset =
        el.offsetLeft -
        container.clientWidth / 2 +
        el.clientWidth / 2;
      container.scrollLeft = offset;
    }
  }, []);

  // Track whether we've scrolled away from today
  function handleScroll() {
    if (!scrollRef.current || !todayRef.current) return;
    const container = scrollRef.current;
    const el = todayRef.current;
    const elCenter = el.offsetLeft + el.clientWidth / 2;
    const viewLeft = container.scrollLeft;
    const viewRight =
      container.scrollLeft + container.clientWidth;
    setShowJump(elCenter < viewLeft || elCenter > viewRight);
  }

  function scrollToToday() {
    if (!todayRef.current || !scrollRef.current) return;
    const el = todayRef.current;
    const container = scrollRef.current;
    const offset =
      el.offsetLeft -
      container.clientWidth / 2 +
      el.clientWidth / 2;
    container.scrollTo({ left: offset, behavior: "smooth" });
  }

  return (
    <div className="relative w-full pt-[8px]">
      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-[4px] px-[16px] no-scrollbar"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {days.map((date, i) => {
          const isToday = sameDay(date, today);
          const isSelected = sameDay(date, selectedDate);
          const hasDot =
            (flowersByDate.get(dateKey(date)) ?? 0) > 0;

          return (
            <button
              key={i}
              ref={isToday ? todayRef : undefined}
              onClick={() => onSelectDate(date)}
              className="flex flex-col items-center rounded-xl transition-transform active:scale-95 shrink-0"
              style={{
                // ~7 days per viewport (6 gaps × 4px = 24px), scrollable
                width: "calc((100% - 24px) / 7)",
                minWidth: 40,
                padding: "8px 4px",
                gap: 2,
                background: isSelected
                  ? TEAL
                  : isToday
                    ? "rgba(28,46,42,0.08)"
                    : "transparent",
                border: "1px solid transparent",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontFamily: BODY,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: isSelected
                    ? "rgba(252,252,252,0.6)"
                    : "rgba(28,46,42,0.42)",
                }}
              >
                {date
                  .toLocaleDateString("en-US", {
                    weekday: "short",
                  })
                  .slice(0, 2)}
              </span>
              <span
                style={{
                  fontSize: 15,
                  lineHeight: 1.1,
                  fontFamily: HEAD,
                  color: isSelected
                    ? "#FAFAFA"
                    : isToday
                      ? TEAL
                      : "rgba(28,46,42,0.65)",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {date.getDate()}
              </span>
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: hasDot
                    ? isSelected
                      ? "rgba(250,250,250,0.9)"
                      : GREEN
                    : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* "Back to today" jump pill */}
      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToToday}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-3 py-1.5 z-10"
            style={{
              background: TEAL,
              boxShadow: "0 2px 10px rgba(28,46,42,0.25)",
            }}
          >
            <span
              style={{
                fontFamily: BODY,
                fontSize: 9,
                color: "#FAFAFA",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              today
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────
interface HeaderProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  flowersByDate: Map<string, number>;
  daySaved: number;
  daySpent: number;
  isToday: boolean;
  viewMode?: "day" | "week";
  onToggleMode?: () => void;
  hideDivider?: boolean;
}

export function GardenHeader({
  selectedDate,
  onSelectDate,
  flowersByDate,
  daySaved,
  daySpent,
  isToday,
  viewMode = "day",
  onToggleMode,
  hideDivider = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const shortDate = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const dateLabel =
    viewMode === "week"
      ? sameWeek(selectedDate, new Date())
        ? "this week"
        : weekRangeLabel(selectedDate)
      : isToday
        ? "today"
        : shortDate;

  return (
    <div className="flex-shrink-0 w-full">
      <div className="flex flex-col gap-1 items-start pt-[20px] relative w-full">
        <div className="w-full flex items-center justify-between gap-2 px-[10px]">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(28,46,42,0.05)" }}
              title="Canopy"
            >
              <SunShapeSvg width={22} height={22} />
            </div>

            {/* Previous week — sits right next to the label in week mode */}
            {viewMode === "week" && (
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 7);
                  onSelectDate(d);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-90 shrink-0"
                style={{ background: "rgba(28,46,42,0.06)" }}
              >
                <ChevronLeft
                  className="w-4 h-4"
                  style={{ color: TEAL }}
                />
              </button>
            )}

            <button
              onClick={onToggleMode}
              disabled={!onToggleMode}
              className="flex items-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                cursor: onToggleMode ? "pointer" : "default",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.h1
                  key={dateLabel}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  style={{
                    fontFamily: HEAD,
                    // Shrinks on narrow phones so the week range
                    // ("Jun 15 – 21") never wraps to a second line.
                    fontSize: "clamp(24px, 8vw, 40px)",
                    color: TEAL,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    // dotted underline cue that it's tappable
                    borderBottom: onToggleMode
                      ? "2px dotted rgba(28,46,42,0.25)"
                      : "none",
                    paddingBottom: 2,
                  }}
                >
                  {dateLabel}
                </motion.h1>
              </AnimatePresence>
              {onToggleMode && (
                <ChevronsUpDown
                  className="w-4 h-4"
                  style={{ color: "rgba(28,46,42,0.4)" }}
                />
              )}
            </button>

            {/* Next week / jump back to current week (week mode, past weeks) */}
            {viewMode === "week" &&
              !sameWeek(selectedDate, new Date()) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 7);
                      onSelectDate(d);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-90"
                    style={{
                      background: "rgba(28,46,42,0.06)",
                    }}
                  >
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: TEAL }}
                    />
                  </button>
                  <button
                    onClick={() => onSelectDate(new Date())}
                    className="rounded-full px-2.5 py-1"
                    style={{
                      background: TEAL,
                      boxShadow:
                        "0 2px 10px rgba(28,46,42,0.25)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 9,
                        color: "#FAFAFA",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      this week
                    </span>
                  </button>
                </div>
              )}
          </div>

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-[8px] shrink-0 cursor-pointer active:scale-95 transition-transform"
            title="View Profile & Insights"
          >
            <div className="flex flex-col items-end">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`saved-${daySaved}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: HEAD,
                    fontSize: 24,
                    color: GREEN,
                    lineHeight: 1,
                    top: "-0.72px",
                    position: "relative",
                  }}
                >
                  ₹{daySaved.toFixed(0)}
                </motion.p>
              </AnimatePresence>
              <p
                style={{
                  fontSize: 8,
                  color: "rgba(28,46,42,0.42)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                saved
              </p>
            </div>
            <div
              style={{
                width: 1,
                height: 24,
                background: "rgba(28,46,42,0.1)",
              }}
            />
            <div className="flex flex-col items-end">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`spent-${daySpent}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: HEAD,
                    fontSize: 24,
                    color:
                      daySpent > 0
                        ? "rgba(180,50,30,0.75)"
                        : "rgba(28,46,42,0.3)",
                    lineHeight: 1,
                    top: "-0.72px",
                    position: "relative",
                  }}
                >
                  ₹{daySpent.toFixed(0)}
                </motion.p>
              </AnimatePresence>
              <p
                style={{
                  fontSize: 8,
                  color:
                    daySpent > 0
                      ? "rgba(180,50,30,0.45)"
                      : "rgba(28,46,42,0.35)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                spent
              </p>
            </div>
          </div>
        </div>

        {/* Calendar strip — day mode only (week nav lives by the label) */}
        {viewMode === "day" && (
          <div className="w-full mt-[8px]">
            <RecentDaysStrip
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              flowersByDate={flowersByDate}
            />
          </div>
        )}

        {!hideDivider && (
          <div className="w-full pt-[4px]">
            <div
              style={{
                height: 1,
                background: "rgba(28,46,42,0.08)",
                width: "100%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inline audio player ───────────────────────────────────────────
export function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  }
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "rgba(77,170,87,0.08)",
        border: "1px solid rgba(77,170,87,0.25)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (el?.duration)
            setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: TEAL }}
      >
        {playing ? (
          <Pause className="w-4 h-4 text-white" fill="white" />
        ) : (
          <Play className="w-4 h-4 text-white" fill="white" />
        )}
      </button>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, background: "rgba(28,46,42,0.12)" }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: TEAL,
            borderRadius: 99,
            transition: "width 0.1s",
          }}
        />
      </div>
      <p
        style={{
          fontSize: 11,
          color: TEAL,
          opacity: 0.55,
          flexShrink: 0,
        }}
      >
        voice note
      </p>
    </div>
  );
}
// ── Flower interface ──────────────────────────────────────────────
function ScribbleOverlay({
  size,
  animate = false,
}: {
  size: number;
  animate?: boolean;
}) {
  return (
    <motion.img
      src={ScribblePng}
      alt=""
      initial={
        animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size,
        height: size,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
// ── Flower interface ──────────────────────────────────────────────
interface Flower {
  id: number;
  emotion: any;
  amount: number;
  date: string;
  state: "bloomed" | "wilted";
  drawing: string | null;
  x?: number;
  y?: number;
  worldX?: number;
  worldY?: number;
  scale?: number;
  itemName?: string;
  whoFor?: string;
  journal?: string;
  voiceNote?: string;
  photos?: string[];
}

// ── Main Garden ───────────────────────────────────────────────────
export function Garden() {
  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] =
    useState<Flower | null>(null);
  const [activeDate, setActiveDate] = useState(new Date());
  // Display mode — "day" shows one day, "week" shows the whole ISO week.
  // Always starts in day mode (e.g. when returning from PlantFlower).
  const [viewMode, setViewMode] = useState<"day" | "week">(
    "day",
  );
  const [snapshotting, setSnapshotting] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(
    null,
  );

  function deleteFlower(id: number) {
    const updated = allFlowers.filter((f) => f.id !== id);
    setAllFlowers(updated);
    localStorage.setItem(
      "gardenFlowers",
      JSON.stringify(updated),
    );
    setSelectedFlower(null);
  }

  function downloadSnapshot() {
    if (!snapshotUrl) return;
    const link = document.createElement("a");
    link.href = snapshotUrl;
    link.download = `garden-snapshot-${Date.now()}.png`;
    link.click();
  }

  useEffect(() => {
    const garden = localStorage.getItem("gardenFlowers");
    if (!garden) return;
    let flowers = JSON.parse(garden);

    // One-time cleanup: strip the old seeded demo flowers
    // (they had no drawing and emotion name "Intentional").
    if (!localStorage.getItem("demoCleaned")) {
      flowers = flowers.filter(
        (f: any) =>
          !(!f.drawing && f.emotion?.name === "Intentional"),
      );
      localStorage.setItem(
        "gardenFlowers",
        JSON.stringify(flowers),
      );
      localStorage.removeItem("demoSeeded");
      localStorage.setItem("demoCleaned", "true");
    }

    setAllFlowers(flowers);

    // Auto-trim any legacy drawings so shadows are not pushed far below
    Promise.all(
      flowers.map(async (f: any) => {
        if (f.drawing && typeof f.drawing === "string" && f.drawing.startsWith("data:image")) {
          const trimmed = await trimDrawingImage(f.drawing);
          if (trimmed && trimmed !== f.drawing) {
            return { ...f, drawing: trimmed };
          }
        }
        return f;
      })
    ).then((updated) => {
      const changed = updated.some((f, idx) => f.drawing !== flowers[idx]?.drawing);
      if (changed) {
        localStorage.setItem("gardenFlowers", JSON.stringify(updated));
        setAllFlowers(updated);
      }
    });

    function handleGardenUpdated() {
      const g = localStorage.getItem("gardenFlowers");
      if (g) {
        try {
          setAllFlowers(JSON.parse(g));
        } catch {}
      }
    }
    window.addEventListener("garden-updated", handleGardenUpdated);
    return () => window.removeEventListener("garden-updated", handleGardenUpdated);
  }, []);

  const flowersByDate = new Map<string, number>();
  allFlowers.forEach((f) => {
    if (f.state === "parked" || (f as any).status === "parked") return;
    const k = dateKey(new Date(f.date));
    flowersByDate.set(k, (flowersByDate.get(k) ?? 0) + 1);
  });

  // Day mode → flowers from the selected day. Week mode → all flowers
  // in the same Monday-anchored ISO week as the selected day.
  const visibleFlowers = allFlowers.filter((f) =>
    (f.state === "bloomed" || f.state === "wilted" || !f.state) &&
    (viewMode === "week"
      ? sameWeek(new Date(f.date), activeDate)
      : sameDay(new Date(f.date), activeDate))
  );

  const daySaved = visibleFlowers
    .filter((f) => f.state === "bloomed")
    .reduce((s, f) => s + (f.amount || 0), 0);
  const daySpent = visibleFlowers
    .filter((f) => f.state === "wilted")
    .reduce((s, f) => s + (f.amount || 0), 0);
  const isToday = sameDay(activeDate, new Date());

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSnapshot = async () => {
      if (!canvasContainerRef.current) return;
      const el = canvasContainerRef.current;

      const originalBg = el.style.background;
      const originalPadding = el.style.padding;
      el.style.background = "#FAFAFA";
      el.style.padding = "16px 16px 64px 16px";

      const textEl = document.createElement("div");
      textEl.innerText =
        viewMode === "week"
          ? `${weekRangeLabel(activeDate)}, ${activeDate.getFullYear()}`
          : activeDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
      textEl.style.position = "absolute";
      textEl.style.bottom = "20px";
      textEl.style.left = "0";
      textEl.style.width = "100%";
      textEl.style.textAlign = "center";
      textEl.style.fontFamily = "'Fraunces', serif";
      textEl.style.fontSize = "12px";
      textEl.style.color = "#4DAA57";
      textEl.style.letterSpacing = "0.05em";
      el.appendChild(textEl);

      setSnapshotting(true);
      try {
        const images = Array.from(el.querySelectorAll("img"));

        // Wait for every image to fully load AND decode, so none are
        // missing from the snapshot. Each has a 4s fallback timeout.
        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>((resolve) => {
                const done = () => resolve();
                const timeout = setTimeout(done, 4000);
                const finish = async () => {
                  try {
                    if ((img as any).decode) await img.decode();
                  } catch {}
                  clearTimeout(timeout);
                  done();
                };
                if (img.complete && img.naturalWidth > 0) {
                  finish();
                } else {
                  img.onload = finish;
                  img.onerror = () => {
                    clearTimeout(timeout);
                    done();
                  };
                }
              }),
          ),
        );

        // Let layout/paint settle (two frames) before capturing.
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );

        const { toPng } = await import("html-to-image");

        // Crisp on retina/iPhone (cap at 3 to avoid huge files / memory).
        const pixelRatio = Math.min(
          3,
          Math.max(2, window.devicePixelRatio || 2),
        );
        const opts = { cacheBust: true, pixelRatio };

        // Render twice — Safari/iOS often drops images on the first pass;
        // the second pass has them warm in cache and renders complete.
        await toPng(el, opts);
        const dataUrl = await toPng(el, opts);

        // Show a preview (download / share) instead of auto-downloading.
        setSnapshotUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate image", err);
      } finally {
        el.style.background = originalBg;
        el.style.padding = originalPadding;
        if (textEl.parentNode === el) el.removeChild(textEl);
        setSnapshotting(false);
      }
    };
    window.addEventListener("trigger-snapshot", handleSnapshot);
    return () =>
      window.removeEventListener(
        "trigger-snapshot",
        handleSnapshot,
      );
  }, [activeDate, viewMode]);

  // Snapshot loader overlay (rendered via portal so it's never captured)
  const snapshotOverlay = snapshotting
    ? createPortal(
        <div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{
            zIndex: 100000,
            background: "rgba(250,250,250,0.7)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "3px solid rgba(28,46,42,0.15)",
              borderTopColor: GREEN,
            }}
          />
          <p
            style={{
              marginTop: 14,
              fontFamily: HEAD,
              fontStyle: "italic",
              fontSize: 14,
              color: TEAL,
            }}
          >
            saving your garden…
          </p>
        </div>,
        document.body,
      )
    : null;

  // Snapshot preview with Download / Share actions.
  const snapshotPreview = createPortal(
    <AnimatePresence>
      {snapshotUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSnapshotUrl(null)}
          className="fixed inset-0 flex flex-col items-center justify-center px-6"
          style={{
            zIndex: 100001,
            background: "rgba(28,46,42,0.55)",
            backdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full flex flex-col items-center"
            style={{ maxWidth: 380 }}
          >
            {/* Close */}
            <button
              onClick={() => setSnapshotUrl(null)}
              className="self-end mb-2 w-9 h-9 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(250,250,250,0.9)",
                boxShadow: "0 2px 10px rgba(28,46,42,0.2)",
              }}
            >
              <X className="w-4 h-4" style={{ color: TEAL }} />
            </button>

            {/* Preview image */}
            <img
              src={snapshotUrl}
              alt="garden snapshot"
              className="w-full rounded-2xl"
              style={{
                maxHeight: "62vh",
                objectFit: "contain",
                boxShadow: "0 16px 48px rgba(28,46,42,0.35)",
                background: "#FAFAFA",
              }}
            />

            {/* Actions */}
            <div className="w-full flex mt-4">
              <button
                onClick={downloadSnapshot}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-transform active:scale-95"
                style={{
                  background: GREEN,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  boxShadow: "0 8px 24px rgba(77,170,87,0.35)",
                }}
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div
      className="fixed inset-0"
      style={{
        fontFamily: BODY,
        background: BG,
        color: TEAL,
        overflow: "hidden",
      }}
    >
      {snapshotOverlay}
      {snapshotPreview}
      {/* ── Full-bleed garden canvas (static, no panning) ── */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      >
        {/* Cross-fade between day/week views (keyed by viewMode) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {visibleFlowers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <p
                  style={{
                    fontFamily: HEAD,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: "rgba(32,70,84,0.22)",
                    textAlign: "center",
                  }}
                >
                  {viewMode === "week"
                    ? "nothing planted this week · tap to start"
                    : isToday
                      ? "your garden is waiting to bloom"
                      : "nothing planted this day"}
                </p>
              </div>
            )}
            {(() => {
              const zMap = buildZIndexMap(
                visibleFlowers.map((f) => ({
                  id: f.id,
                  sortY: flowerPct(f).y,
                })),
              );
              return visibleFlowers.map((flower, idx) => (
                <GardenFlower
                  key={flower.id}
                  flower={flower}
                  index={idx}
                  zIndex={zMap.get(flower.id) ?? 1}
                  animateIn={viewMode === "day"}
                  onTap={() => setSelectedFlower(flower)}
                />
              ));
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* end canvasContainerRef */}

      {/* ── Floating header — constrained to max-width, matches nav pills ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex justify-center">
        <div
          className="w-full pointer-events-auto"
          style={{ maxWidth: 480 }}
        >
          <GardenHeader
            selectedDate={activeDate}
            onSelectDate={setActiveDate}
            flowersByDate={flowersByDate}
            daySaved={daySaved}
            daySpent={daySpent}
            isToday={isToday}
            viewMode={viewMode}
            onToggleMode={() =>
              setViewMode((m) => (m === "day" ? "week" : "day"))
            }
            hideDivider={!!selectedFlower}
          />
        </div>
      </div>

      {/* ── Flower detail sheet ── */}

      {createPortal(
        <AnimatePresence>
          {selectedFlower && (
            <ReceiptModal
              selectedFlower={selectedFlower}
              entryNumber={allFlowers.findIndex(f => f.id === selectedFlower.id) + 1}
              onClose={() => setSelectedFlower(null)}
              onDelete={(id) => deleteFlower(id)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

// ── Garden flower ─────────────────────────────────────────────────
function GardenFlower({
  flower,
  index,
  zIndex,
  animateIn = true,
  onTap,
}: {
  flower: Flower;
  index: number;
  zIndex: number;
  animateIn?: boolean;
  onTap: () => void;
}) {
  // Resolve position via the shared resolver — identical on both screens.
  const { x: xPct, y: yPct } = flowerPct(flower);
  const size = flowerRenderSize(yPct, flower.scale ?? 1.0);
  const wilted = flower.state === "wilted";
  const tilt = ((flower.id % 9) - 4) * 4;
  const shadowW = Math.round(size * 0.62);
  const shadowH = Math.round(shadowW * 0.1);

  // Sound on mount
  useEffect(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        800,
        ctx.currentTime + 0.1,
      );

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        0.2,
        ctx.currentTime + 0.05,
      );
      gain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + 0.1,
      );

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);

      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 1000;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + 0.2,
      );

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start();

      if (navigator.vibrate) navigator.vibrate(10);
    } catch (e) {}
  }, []);

  return (
    // Outer wrapper owns the centering transform (plain CSS — framer-motion
    // must NOT manage it, or it overrides translate(-50%,-50%)).
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
        opacity: wilted ? 0.55 : 1,
        lineHeight: 0,
        zIndex,
      }}
    >
      <motion.button
        initial={animateIn ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          animateIn
            ? {
                delay: index * 0.06,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }
            : { duration: 0 }
        }
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(5);
          onTap();
        }}
        className="relative flex flex-col items-center"
        style={{ lineHeight: 0 }}
      >
        {flower.drawing ? (
          <div
            style={{
              position: "relative",
              width: size,
              height: "auto",
            }}
          >
            <img
              src={flower.drawing}
              alt="flower"
              style={{
                width: size,
                height: "auto",
                display: "block",
                position: "relative",
                zIndex: 2,
                filter: wilted
                  ? "grayscale(1) brightness(0.62) sepia(0.1)"
                  : "none",
              }}
            />

            {wilted && <ScribbleOverlay size={size} />}
          </div>
        ) : (
          <div
            style={{
              width: size * 0.55,
              height: size * 0.55,
              borderRadius: "50%",
              background: `${flower.emotion?.hex || "#4DAA57"}55`,
              position: "relative",
              zIndex: 2,
            }}
          />
        )}
      </motion.button>
    </div>
  );
}