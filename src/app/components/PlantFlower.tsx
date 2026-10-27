import { useNavigate } from "react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { trimDrawingImage } from "../utils/trimDrawing";
import { Minus, Plus, Maximize2 } from "lucide-react";
import ScribblePng from "../../imports/116.png";
import { sameDay, sameWeek } from "./Garden";
import { GardenHeader } from "./Garden";
import {
  buildZIndexMap,
  flowerPct,
  flowerRenderSize as flowerSize,
} from "./gardenZ";

interface Pos {
  x: number;
  y: number;
}
type Phase = "idle" | "asking" | "composting" | "wilting";

// Same tokens as Garden
const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const FOREST = "#2F6B5E";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

// Wilting animation
function WiltSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path
        d="M26 10 C26 10, 20 16, 18 22 C16 28, 18 34, 26 36 C34 34, 36 28, 34 22 C32 16, 26 10, 26 10 Z"
        stroke="rgba(28,46,42,0.35)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M26 36 L24 46"
        stroke="rgba(28,46,42,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 40 C24 40, 19 39, 17 42"
        stroke="rgba(28,46,42,0.35)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

export function PlantFlower() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [planted, setPlanted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [scale, setScale] = useState(1.0);
  const [showSize, setShowSize] = useState(false);

  const [drawing, setDrawing] = useState<string | null>(
    localStorage.getItem("currentDrawing"),
  );

  useEffect(() => {
    const raw = localStorage.getItem("currentDrawing");
    if (raw) {
      trimDrawingImage(raw).then((trimmed) => {
        if (trimmed && trimmed !== raw) {
          setDrawing(trimmed);
          localStorage.setItem("currentDrawing", trimmed);
        }
      });
    }
  }, []);
  const urgeItem = localStorage.getItem("urgeItem") || "this item";
  const category = localStorage.getItem("currentCategory") || "Other";
  const cost = parseFloat(localStorage.getItem("purchaseCost") || "0");
  const laborHours =
    localStorage.getItem("laborHours") ||
    (cost > 0 ? (cost / 500).toFixed(1) : "1.0");
  const buyingReason =
    localStorage.getItem("buyingReason") || "an impulse trigger";

  // Onboarded user intentions
  const userName = localStorage.getItem("userName") || "";
  const userProblem = localStorage.getItem("userSpendingProblem") || "";
  const userGoal = localStorage.getItem("userPersonalGoal") || "";
  const monthlySalary = parseFloat(localStorage.getItem("userMonthlySalary") || "0");

  const userProblemKeys: string[] = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("userSpendingProblemKeys") || "[]");
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch {}
    const single = localStorage.getItem("userSpendingProblemKey");
    return single ? [single] : [];
  }, []);

  const userProblemsList: string[] = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("userSpendingProblems") || "[]");
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch {}
    const single = localStorage.getItem("userSpendingProblem");
    return single ? [single] : [];
  }, []);

  const daysOfWork = monthlySalary > 0
    ? Math.round((cost / (monthlySalary / 22)) * 10) / 10
    : Math.round((cost / 500 / 8) * 10) / 10;
  const workDurationText = daysOfWork >= 1
    ? `${daysOfWork} day${daysOfWork === 1 ? "" : "s"} of work`
    : `${parseFloat(laborHours) || (cost > 0 ? (cost / 500).toFixed(1) : "1")}h of work`;

  const [compostReason, setCompostReason] = useState(userProblemsList[0] || userProblem || "Quick dopamine spike");
  const [customCompost, setCustomCompost] = useState("");

  const tailoredReflection = useMemo(() => {
    const goalPhrase = userGoal ? `your ${userGoal.toLowerCase()}` : "what truly matters to you";
    const itemPhrase = urgeItem && urgeItem !== "this item" ? `"${urgeItem}"` : "this purchase";
    const costPhrase = cost > 0 ? `₹${cost.toLocaleString("en-IN")}` : "this amount";

    const hasKey = (k: string) => userProblemKeys.includes(k);

    if (hasKey("late_night") || userProblem.toLowerCase().includes("night") || userProblem.toLowerCase().includes("scroll")) {
      return {
        tag: "Breaking Late-Night Urges",
        prompt: `Is ${itemPhrase} solving a real daylight need, or is it late-night fatigue and scrolling craving a quick dopamine salve?`,
        tradeoff: `Letting this go saves ${costPhrase} (${workDurationText}) straight towards ${goalPhrase}.`,
        closing: `Does buying this now serve your future self, or just a sleepy impulse?`,
      };
    }
    if (hasKey("stress") || userProblem.toLowerCase().includes("stress") || userProblem.toLowerCase().includes("exhaust")) {
      return {
        tag: "Stress & Exhaustion Check",
        prompt: `Work was demanding, but buying ${itemPhrase} won't undo that stress — it trades away ${workDurationText} of the very labor that tired you.`,
        tradeoff: `Keep this ${costPhrase} to fund ${goalPhrase} instead of soothing temporary exhaustion.`,
        closing: `Give yourself real rest and peace instead of a checkout screen.`,
      };
    }
    if (hasKey("discount") || userProblem.toLowerCase().includes("discount") || userProblem.toLowerCase().includes("sale") || userProblem.toLowerCase().includes("fomo")) {
      return {
        tag: "Sale & Discount Reality Check",
        prompt: `A discount is only a saving if you were already looking for ${itemPhrase}. Were you planning on this before seeing the price tag?`,
        tradeoff: `Skipping it keeps ${costPhrase} (${workDurationText}) intact for ${goalPhrase}.`,
        closing: `100% off is what you save when you choose not to buy at all.`,
      };
    }
    if (hasKey("boredom") || userProblem.toLowerCase().includes("bored") || userProblem.toLowerCase().includes("dopamine")) {
      return {
        tag: "Dopamine & Boredom Pause",
        prompt: `The fleeting excitement of ordering ${itemPhrase} fades in minutes, but the ${workDurationText} spent working for it is gone permanently.`,
        tradeoff: `Direct this ${costPhrase} into growing ${goalPhrase}.`,
        closing: `Sit with the boredom for a few moments — notice how the urge dissolves.`,
      };
    }
    if (hasKey("fantasy_self") || userProblem.toLowerCase().includes("fantasy")) {
      return {
        tag: "Fantasy Self vs Reality",
        prompt: `Will ${itemPhrase} genuinely fit your daily routine, or is it for an idealized version of yourself that lives in your imagination?`,
        tradeoff: `Real progress comes from protecting ${goalPhrase} with this ${costPhrase} (${workDurationText}).`,
        closing: `Honor where you are today before buying gear for an imaginary tomorrow.`,
      };
    }
    if (userProblemsList.length > 0) {
      const displayProblems = userProblemsList.slice(0, 2).join(" & ");
      return {
        tag: `Conquering ${displayProblems}`,
        prompt: `You stepped into Canopy to soften impulse spending (${displayProblems}). Does buying ${itemPhrase} repeat that familiar cycle?`,
        tradeoff: `Letting it go keeps ${costPhrase} (${workDurationText}) to protect ${goalPhrase}.`,
        closing: `The pause you took today is proof you are already in control.`,
      };
    }
    return {
      tag: "Future Utility Reflection",
      prompt: `Will ${itemPhrase} bring you meaningful value 30 days from now, or is it a 15-minute dopamine salve?`,
      tradeoff: `Letting this go saves ${costPhrase} (${workDurationText}) for ${goalPhrase}.`,
      closing: `Take a deep breath and decide with full clarity.`,
    };
  }, [userProblemKeys, userProblemsList, userProblem, userGoal, urgeItem, cost, workDurationText]);

  const emotion = localStorage.getItem("currentEmotion")
    ? JSON.parse(localStorage.getItem("currentEmotion")!)
    : null;
  const allFlowers: any[] = JSON.parse(
    localStorage.getItem("gardenFlowers") || "[]",
  );

  // The new flower is always planted into TODAY, so only show today's
  // flowers as placement context — not the whole week.
  const today = new Date();
  const existingFlowers = allFlowers.filter((f) =>
    sameWeek(new Date(f.date), today),
  );
  const todaysFlowers = allFlowers.filter((f) =>
    sameDay(new Date(f.date), today),
  );

  const flowersByDate = new Map<string, number>();
  allFlowers.forEach((f) => {
    const d = new Date(f.date);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    flowersByDate.set(k, (flowersByDate.get(k) ?? 0) + 1);
  });

  const daySaved = todaysFlowers
    .filter((f) => f.state === "bloomed")
    .reduce((s, f) => s + (f.amount || 0), 0);
  const daySpent = todaysFlowers
    .filter((f) => f.state === "wilted")
    .reduce((s, f) => s + (f.amount || 0), 0);

  const moodHex: string =
    typeof emotion?.hex === "string" &&
    emotion.hex.startsWith("#")
      ? emotion.hex
      : "#4DAA57";

  const wilting = phase === "wilting" || phase === "composting";

  // Convert a pointer event to % of the canvas element.
  function pctFromEvent(
    e: React.PointerEvent | PointerEvent,
  ): Pos {
    const el = canvasRef.current!;
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (planted || phase !== "idle") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setPos(pctFromEvent(e));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || planted || phase !== "idle") return;
    setPos(pctFromEvent(e));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    setPos(pctFromEvent(e));
  }

  function handlePlantHere() {
    if (!pos || planted || phase !== "idle") return;
    setPhase("asking");
  }

  function plantNow(bought: boolean, compost?: string) {
    if (!pos || planted) return;
    setPlanted(true);
    const cost = parseFloat(
      localStorage.getItem("purchaseCost") || "0",
    );
    const garden: any[] = JSON.parse(
      localStorage.getItem("gardenFlowers") || "[]",
    );

    garden.push({
      id: Date.now(),
      emotion,
      amount: cost,
      date: new Date().toISOString(),
      state: bought ? "wilted" : "bloomed",
      status: bought ? "bought" : "let_go",
      laborHours: parseFloat(laborHours),
      buyingReason,
      compostReason: bought ? (compost || compostReason) : undefined,
      drawing: drawing || null,
      // x/y are percentages of the full viewport — identical to what
      // Garden uses, same anchor (bottom-center), no conversion needed.
      x: pos.x,
      y: pos.y,
      scale,
      itemName: localStorage.getItem("urgeItem") || undefined,
      whoFor:
        localStorage.getItem("currentWhoFor") || undefined,
      category:
        localStorage.getItem("currentCategory") || "Other",
      categories: localStorage.getItem("currentCategories")
        ? JSON.parse(localStorage.getItem("currentCategories")!)
        : [localStorage.getItem("currentCategory") || "Other"],
      journal:
        localStorage.getItem("currentJournal") || undefined,
      voiceNote:
        localStorage.getItem("currentVoiceNote") || undefined,
      photos: localStorage.getItem("currentPhotos")
        ? JSON.parse(localStorage.getItem("currentPhotos")!)
        : undefined,
    });
    localStorage.setItem(
      "gardenFlowers",
      JSON.stringify(garden),
    );
    window.dispatchEvent(new Event("garden-updated"));
    [
      "currentJournal",
      "urgeItem",
      "currentCategory",
      "currentCategories",
      "currentWhoFor",
      "currentEmotion",
      "purchaseCost",
      "laborHours",
      "buyingReason",
      "currentVoiceNote",
      "currentPhotos",
      "currentLink",
      "coolingHours",
    ].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(
      "boughtAnyway",
      bought ? "true" : "false",
    );

    const bd = JSON.parse(
      localStorage.getItem("bloomData") ||
        '{"totalSaved":0,"flowersGrown":0,"currentStreak":0,"totalEntries":0}',
    );
    if (!bought) {
      bd.totalSaved = (bd.totalSaved || 0) + cost;
      bd.currentStreak = (bd.currentStreak || 0) + 1;
    }
    bd.flowersGrown = (bd.flowersGrown || 0) + 1;
    bd.totalEntries = (bd.totalEntries || 0) + 1;
    localStorage.setItem("bloomData", JSON.stringify(bd));
    setTimeout(() => navigate("/success"), 700);
  }

  // z-index map: sort by y% (deeper = in front), then id (newer = in front)
  const zMap = buildZIndexMap(
    existingFlowers.map((f) => ({
      id: f.id,
      sortY: flowerPct(f).y,
    })),
  );

  const previewSize = pos
    ? flowerSize(pos.y, scale)
    : flowerSize(50, scale);

  return (
    <div
      className="fixed inset-0"
      style={{
        background: BG,
        fontFamily: BODY,
        userSelect: "none",
        color: TEAL,
        touchAction: "none",
      }}
    >
      {/* ── Full-bleed canvas ── */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          cursor:
            planted || phase !== "idle"
              ? "default"
              : "crosshair",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Existing flowers — dimmed */}
        {existingFlowers.map((f) => {
          const tilt = ((f.id % 9) - 4) * 4;
          const { x: xPct, y: yPct } = flowerPct(f);
          const sz = flowerSize(yPct, f.scale ?? 1.0);
          const shW = Math.round(sz * 0.62);
          const shH = Math.round(shW * 0.1);
          return (
            <div
              key={f.id}
              className="absolute pointer-events-none flex flex-col items-center"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                // Center anchor, upright — matches Garden + preview
                transform: "translate(-50%, -50%)",
                opacity: 0.4,
                lineHeight: 0,
                zIndex: zMap.get(f.id) ?? 1,
              }}
            >
              {f.drawing ? (
                <div
                  style={{
                    position: "relative",
                    width: sz,
                    height: "auto",
                  }}
                >
                  <img
                    src={f.drawing}
                    alt=""
                    style={{
                      width: sz,
                      height: "auto",
                      display: "block",
                    }}
                  />
                  {f.state === "wilted" && (
                    <ScribbleOverlay size={sz} />
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: sz * 0.6,
                    height: sz * 0.6,
                    borderRadius: "50%",
                    background: `${f.emotion?.hex || "#4DAA57"}55`,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Preview — outer plain div owns the centering transform (framer
            on the inner element must not manage transform), so the preview
            anchors EXACTLY like the garden flower. */}
        <AnimatePresence>
          {pos && (
            <div
              key="preview"
              className="absolute pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                lineHeight: 0,
                zIndex: 99999,
              }}
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{
                  scale: planted ? [1, 1.15, 1] : 1,
                  opacity: 1,
                }}
                transition={
                  planted
                    ? { duration: 0.45, times: [0, 0.5, 1] }
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                      }
                }
                className="relative flex flex-col items-center"
                style={{ lineHeight: 0 }}
              >
                {drawing ? (
                  <div
                    style={{
                      position: "relative",
                      width: previewSize,
                      height: "auto",
                    }}
                  >
                    <img
                      src={drawing}
                      alt="flower"
                      style={{
                        width: previewSize,
                        height: "auto",
                        display: "block",
                        filter: wilting
                          ? "grayscale(0.8) brightness(0.65)"
                          : "none",
                      }}
                    />
                    {wilting && (
                      <ScribbleOverlay
                        size={previewSize}
                        animate
                      />
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      width: previewSize * 0.6,
                      height: previewSize * 0.6,
                      borderRadius: "50%",
                      background: `${moodHex}88`,
                    }}
                  />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating header — constrained width, click-through ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex justify-center">
        <div className="w-full" style={{ maxWidth: 480 }}>
          {/* Item name badge */}
          {urgeItem ? (
            <div className="flex items-center gap-2 px-4 pt-5 pb-1">
              <span
                style={{
                  fontFamily: HEAD,
                  fontSize: 13,
                  color: "rgba(28,46,42,0.45)",
                  letterSpacing: "0.04em",
                }}
              >
                placing ·{" "}
              </span>
              <span
                style={{
                  fontFamily: HEAD,
                  fontSize: 15,
                  color: TEAL,
                  letterSpacing: "0.02em",
                }}
              >
                {urgeItem.length > 28
                  ? urgeItem.slice(0, 28) + "…"
                  : urgeItem}
              </span>
            </div>
          ) : null}
          <GardenHeader
            selectedDate={new Date()}
            onSelectDate={() => {}}
            flowersByDate={flowersByDate}
            daySaved={daySaved}
            daySpent={daySpent}
            isToday={true}
          />
        </div>
      </div>

      {/* ── Hint pill ── */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-30"
        style={{ paddingTop: 90 }}
      >
        <div
          className="rounded-full px-4 py-1.5"
          style={{
            background: "rgba(250,250,250,0.88)",
            border: "1px solid rgba(32,70,84,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p
            style={{
              fontFamily: HEAD,
              fontStyle: "italic",
              fontSize: 13,
              color: TEAL,
            }}
          >
            {phase !== "idle"
              ? "almost there…"
              : pos
                ? dragging
                  ? "drag to adjust…"
                  : "looking good?"
                : "drag your flower into place"}
          </p>
        </div>
      </div>

      {/* ── Bottom bar: [size icon] ──────────── [plant here] ── */}
      <style>{`
        .vslider{-webkit-appearance:none;appearance:none;writing-mode:vertical-lr;direction:rtl;width:4px;height:120px;border-radius:99px;outline:none;cursor:pointer}
        .vslider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#1C2E2A;cursor:pointer;box-shadow:0 1px 6px rgba(28,46,42,0.4)}
        .vslider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#1C2E2A;border:none;cursor:pointer}
      `}</style>
      <div
        className="absolute left-0 right-0 z-30 flex items-end justify-between"
        style={{
          bottom: 28,
          paddingLeft: 20,
          paddingRight: 20,
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Size icon + vertical slider popover */}
        <div
          className="flex flex-col items-center gap-2"
          style={{ position: "relative" }}
        >
          <AnimatePresence>
            {showSize && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{
                  type: "spring",
                  damping: 24,
                  stiffness: 340,
                }}
                className="absolute flex flex-col items-center gap-2 rounded-2xl px-3 py-4"
                style={{
                  bottom: 52,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(252,252,252,0.96)",
                  border: "1px solid rgba(32,70,84,0.1)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 8px 32px rgba(28,46,42,0.12)",
                }}
              >
                <span
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    color: TEAL,
                    letterSpacing: "0.06em",
                  }}
                >
                  {Math.round(scale * 100)}%
                </span>
                <input
                  type="range"
                  min={40}
                  max={300}
                  step={5}
                  value={Math.round(scale * 100)}
                  onChange={(e) =>
                    setScale(parseInt(e.target.value) / 100)
                  }
                  className="vslider"
                  style={{
                    background: `linear-gradient(to top, ${TEAL} ${((scale - 0.4) / (3 - 0.4)) * 100}%, rgba(32,70,84,0.15) ${((scale - 0.4) / (3 - 0.4)) * 100}%)`,
                  }}
                />
                <button
                  onClick={() =>
                    setScale((s) =>
                      Math.max(
                        0.4,
                        parseFloat((s - 0.1).toFixed(2)),
                      ),
                    )
                  }
                >
                  <Minus
                    style={{
                      width: 12,
                      height: 12,
                      color: TEAL,
                    }}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setShowSize((v) => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: showSize
                ? TEAL
                : "rgba(252,252,252,0.94)",
              border: "1px solid rgba(32,70,84,0.12)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 16px rgba(28,46,42,0.1)",
            }}
          >
            <Maximize2
              style={{
                width: 16,
                height: 16,
                color: showSize ? "#FAFAFA" : TEAL,
              }}
            />
          </button>
        </div>

        {/* Plant here button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePlantHere}
          disabled={!pos || planted || phase !== "idle"}
          className="py-4 px-8 rounded-2xl"
          style={{
            background:
              pos && !planted && phase === "idle"
                ? TEAL
                : "rgba(32,70,84,0.07)",
            color:
              pos && !planted && phase === "idle"
                ? "#FAFAFA"
                : "rgba(32,70,84,0.3)",
            fontFamily: BODY,
            fontSize: 13,
            letterSpacing: "0.06em",
            border: "1px solid rgba(32,70,84,0.1)",
            backdropFilter: "blur(8px)",
            transition: "background 0.25s, color 0.25s",
          }}
        >
          {planted
            ? "blooming…"
            : pos
              ? "plant here"
              : "drag first"}
        </motion.button>
      </div>

      {/* ── Decision & Composting modal ── */}
      <AnimatePresence>
        {(phase === "asking" || phase === "composting" || phase === "wilting") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end justify-center px-4 pb-6"
            style={{
              zIndex: 100000,
              background: phase === "composting" ? "rgba(18,22,20,0.72)" : "rgba(250,250,250,0.85)",
              backdropFilter: "blur(14px)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
              }}
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                background: "#FAFAFA",
                boxShadow: "0 24px 72px rgba(28,46,42,0.22)",
                border: "1px solid rgba(28,46,42,0.08)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {phase === "wilting" ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <motion.div
                    animate={{
                      scale: [1, 0.85, 0.65],
                      rotate: [0, -8, -18],
                      opacity: [1, 0.9, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeIn",
                    }}
                  >
                    <WiltSVG />
                  </motion.div>
                  <p
                    style={{
                      fontFamily: HEAD,
                      fontSize: 18,
                      color: TEAL,
                    }}
                  >
                    Composting into soil…
                  </p>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 12,
                      color: "rgba(28,46,42,0.55)",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    Anterior insula pain signal registered. Every paused urge builds neurological strength.
                  </p>
                </div>
              ) : phase === "composting" ? (
                <div>
                  {/* Insula Pain Activation Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px]"
                      style={{
                        background: "rgba(180,50,40,0.08)",
                        color: "#9A3428",
                        border: "1px solid rgba(180,50,40,0.18)",
                        fontFamily: BODY,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                      }}
                    >
                      Anterior Insula Activated
                    </span>
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 12,
                        color: "rgba(28,46,42,0.4)",
                      }}
                    >
                      Artwork Withered
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: HEAD,
                      fontSize: 22,
                      color: TEAL,
                      marginBottom: 4,
                    }}
                  >
                    Compost the Urge
                  </h3>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 12.5,
                      color: "rgba(28,46,42,0.65)",
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    What emotional need did this purchase serve?
                  </p>

                  {/* Emotion chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      ...(userProblemsList.length > 0 ? userProblemsList : (userProblem ? [userProblem] : [])),
                      "Tired & low energy",
                      "Reward after work",
                      "Social obligation",
                      "Boredom & stimulation",
                      "Idealized self fantasy",
                      "Quick dopamine salve",
                    ].filter((v, i, a) => a.indexOf(v) === i).map((reason) => {
                      const selected = compostReason === reason && !customCompost;
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => {
                            setCompostReason(reason);
                            setCustomCompost("");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                          style={{
                            background: selected ? TEAL : "rgba(28,46,42,0.05)",
                            color: selected ? "#FAFAFA" : TEAL,
                            border: `1px solid ${selected ? TEAL : "rgba(28,46,42,0.1)"}`,
                            fontFamily: BODY,
                          }}
                        >
                          {reason}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={customCompost}
                    onChange={(e) => setCustomCompost(e.target.value)}
                    placeholder="Or describe the underlying feeling..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none mb-5"
                    style={{
                      background: "rgba(28,46,42,0.04)",
                      border: "1px solid rgba(28,46,42,0.12)",
                      fontFamily: BODY,
                      color: TEAL,
                    }}
                  />

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhase("wilting");
                        setTimeout(() => plantNow(true, customCompost.trim() || compostReason), 1500);
                      }}
                      className="w-full py-3.5 rounded-2xl cursor-pointer"
                      style={{
                        background: TEAL,
                        color: "#FAFAFA",
                        fontFamily: BODY,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                      }}
                    >
                      Compost Urge & Record Purchase
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase("asking")}
                      className="w-full py-2.5 rounded-2xl cursor-pointer"
                      style={{
                        background: "transparent",
                        color: "rgba(28,46,42,0.6)",
                        fontFamily: BODY,
                        fontSize: 12,
                      }}
                    >
                      Wait, I'll let it go instead
                    </button>
                  </div>
                </div>
              ) : (
                /* phase === "asking" Tailored Reflection & Decision Generator */
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: GREEN,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: BODY,
                          fontSize: 11,
                          color: "rgba(28,46,42,0.55)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {userName ? `${userName} · Pause Complete` : "Pause Complete"}
                      </span>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px]"
                      style={{
                        background: `${GREEN}18`,
                        color: "#286634",
                        border: `1px solid ${GREEN}40`,
                        fontFamily: BODY,
                        fontWeight: 600,
                      }}
                    >
                      {workDurationText}
                    </span>
                  </div>

                  {/* Tailored Reflection Card */}
                  <div
                    className="p-4 rounded-2xl mb-4 transition-all"
                    style={{
                      background: "rgba(47,107,94,0.06)",
                      border: "1px solid rgba(47,107,94,0.18)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p
                        style={{
                          fontFamily: BODY,
                          fontSize: 10,
                          color: FOREST,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                        }}
                      >
                        {tailoredReflection.tag}
                      </p>
                      {userGoal && (
                        <span
                          style={{
                            fontFamily: BODY,
                            fontSize: 10.5,
                            color: "rgba(28,46,42,0.5)",
                          }}
                        >
                          Target: {userGoal}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 13.5,
                        color: TEAL,
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      {tailoredReflection.prompt}
                    </p>

                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 12,
                        color: "rgba(28,46,42,0.7)",
                        lineHeight: 1.45,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px dashed rgba(47,107,94,0.2)",
                      }}
                    >
                      {tailoredReflection.tradeoff}
                    </p>
                  </div>

                  <p
                    style={{
                      fontFamily: HEAD,
                      fontSize: 16,
                      color: TEAL,
                      textAlign: "center",
                      marginBottom: 12,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Do you still buy it?
                  </p>

                  {/* Dual Action Choices */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => plantNow(false)}
                      className="w-full py-3.5 px-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                      style={{
                        background: GREEN,
                        color: "#FAFAFA",
                        fontFamily: BODY,
                        boxShadow: `0 4px 18px ${GREEN}40`,
                      }}
                    >
                      <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em" }}>
                        Let it go & save
                      </span>
                      <span className="opacity-90 text-xs font-medium">
                        {cost > 0 ? `+₹${cost.toLocaleString("en-IN")}` : `Keep ${workDurationText}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhase("composting")}
                      className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      style={{
                        background: "rgba(28,46,42,0.05)",
                        color: "rgba(28,46,42,0.75)",
                        fontFamily: BODY,
                        fontSize: 12,
                        border: "1px solid rgba(28,46,42,0.1)",
                      }}
                    >
                      <span>I still buy it</span>
                      <span style={{ opacity: 0.55 }}>(compost urge)</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}