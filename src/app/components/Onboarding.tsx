import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Moon,
  BatteryLow,
  Tag,
  Smartphone,
  Shirt,
  PencilLine,
  Plane,
  ShieldCheck,
  Home,
  Hourglass,
  Target,
  Sprout,
} from "lucide-react";
import { SunShapeSvg } from "./SunShapeSvg";

const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const INK = "#1C2E2A";
const INK_SOFT = "rgba(28,46,42,0.6)";
const INK_FAINT = "rgba(28,46,42,0.12)";
const SNOW_WHITE = "#FAFAFA";
const FOREST = "#2F6B5E";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`;

function TypewriterText({ text, delay = 0, speed = 0.04 }: { text: string; delay?: number; speed?: number }) {
  return (
    <span>
      {Array.from(text).map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: delay + index * speed }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

type HoldStep = "idle" | "pressing" | "bloomed";
type FlowStep = "holding" | "name" | "salary" | "problem" | "goal" | "summary";

const STEP_ORDER: FlowStep[] = ["name", "salary", "problem", "goal", "summary"];

const vibrateVariants = {
  idle: { x: 0, y: 0 },
  pressing: {
    x: [-1.2, 1.2, -1, 1, -0.6, 0.6, 0],
    y: [0.8, -0.8, 1, -1, 0.6, -0.6, 0],
    transition: { duration: 0.1, repeat: Infinity, ease: "linear" },
  },
  bloomed: { x: 0, y: 0 },
};

function YellowLightBloom({ active, blooming }: { active: boolean; blooming: boolean }) {
  const t = (b: any, a: any, i: any) => (blooming ? b : active ? a : i);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="squiggle">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 800,
          height: 800,
          background: "repeating-conic-gradient(from 0deg, rgba(250,204,21,0.15) 0deg 8deg, transparent 8deg 16deg)",
          maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 60%)",
          filter: "url(#squiggle)",
        }}
        initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
        animate={t(
          { opacity: [1, 0.8, 0], scale: [1.2, 2.5, 4], rotate: 120 },
          { opacity: [0, 0.6, 1], scale: [0.5, 1, 1.2], rotate: 45 },
          { opacity: 0, scale: 0.2, rotate: 0 },
        )}
        transition={t({ duration: 0.8, ease: "easeOut" }, { duration: 2.2, ease: "linear" }, { duration: 0.35, ease: "easeOut" })}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(254,240,138,0.95) 0%, rgba(250,204,21,0.75) 40%, rgba(245,158,11,0.25) 70%, transparent 80%)",
          filter: "blur(30px)",
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={t(
          { opacity: [1, 1, 0.95], scale: [1.2, 2.6, 3.6] },
          { opacity: [0.25, 0.75, 1], scale: [0.55, 1.08, 1.25] },
          { opacity: 0, scale: 0.3 },
        )}
        transition={t({ duration: 0.8, ease: "easeOut" }, { duration: 2.2, ease: "easeInOut" }, { duration: 0.35, ease: "easeOut" })}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle, rgba(253,224,71,0.6) 0%, rgba(251,191,36,0.4) 45%, rgba(245,158,11,0.1) 75%, transparent 90%)",
          filter: "blur(50px)",
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={t(
          { opacity: [0.8, 1, 0.95], scale: [1.15, 2.5, 3.5] },
          { opacity: [0.15, 0.55, 0.85], scale: [0.6, 1.1, 1.3] },
          { opacity: 0, scale: 0.4 },
        )}
        transition={t({ duration: 0.8, ease: "easeOut" }, { duration: 2.2, ease: "easeInOut" }, { duration: 0.35, ease: "easeOut" })}
      />
    </div>
  );
}

type Option = { id: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; desc: string };

const SPENDING_PROBLEMS: Option[] = [
  { id: "late_night", Icon: Moon, title: "Late-night scrolling", desc: "Carts filled in bed when you are tired" },
  { id: "stress", Icon: BatteryLow, title: "Stress and exhaustion", desc: "\u201CToday was hard, I deserve this\u201D" },
  { id: "discount", Icon: Tag, title: "Sales and discounts", desc: "\u201CIt\u2019s 40% off, I\u2019ll regret missing it\u201D" },
  { id: "boredom", Icon: Smartphone, title: "Boredom", desc: "Ordering just to feel something arrive" },
  { id: "fantasy_self", Icon: Shirt, title: "Buying for a future self", desc: "Gear and clothes for a life not lived yet" },
  { id: "custom", Icon: PencilLine, title: "Something else", desc: "Describe it in your own words" },
];

const PERSONAL_GOALS: Option[] = [
  { id: "travel", Icon: Plane, title: "A trip I\u2019ve been putting off", desc: "Travel without the money guilt" },
  { id: "emergency", Icon: ShieldCheck, title: "A safety cushion", desc: "3 to 6 months of calm in savings" },
  { id: "home", Icon: Home, title: "A space of my own", desc: "Moving out or upgrading home life" },
  { id: "freedom", Icon: Hourglass, title: "Working less, later", desc: "Investing early and buying back time" },
  { id: "milestone", Icon: Target, title: "One meaningful milestone", desc: "A single dream worth saving for" },
  { id: "custom", Icon: Sprout, title: "Something else", desc: "Write your own goal" },
];

function OptionRow({
  option,
  selected,
  multi,
  onClick,
}: {
  option: Option;
  selected: boolean;
  multi: boolean;
  onClick: () => void;
}) {
  const { Icon } = option;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      aria-pressed={selected}
      className="w-full text-left flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer transition-colors"
      style={{
        background: selected ? "rgba(47,107,94,0.09)" : "#FFFFFF",
        border: `1px solid ${selected ? FOREST : INK_FAINT}`,
      }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ background: selected ? FOREST : "#EFEEEA", color: selected ? "#FAFAFA" : INK }}
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block" style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.25 }}>
          {option.title}
        </span>
        <span className="block" style={{ fontFamily: BODY, fontSize: 12.5, color: INK_SOFT, marginTop: 2, lineHeight: 1.35 }}>
          {option.desc}
        </span>
      </span>
      <span
        className={`w-5 h-5 shrink-0 flex items-center justify-center transition-all ${multi ? "rounded-md" : "rounded-full"}`}
        style={{
          background: selected ? FOREST : "transparent",
          border: `1.5px solid ${selected ? FOREST : "rgba(28,46,42,0.25)"}`,
          color: "#FAFAFA",
        }}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </span>
    </motion.button>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [holdStep, setHoldStep] = useState<HoldStep>("idle");
  const [flowStep, setFlowStep] = useState<FlowStep>("holding");
  const [fontReady, setFontReady] = useState(false);

  const [name, setName] = useState(() => localStorage.getItem("userName") || "");
  const [salaryStr, setSalaryStr] = useState(() => localStorage.getItem("userMonthlySalary") || "50000");
  const [problems, setProblems] = useState<string[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("userSpendingProblemKeys") || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });
  const [customProblem, setCustomProblem] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string>(() => localStorage.getItem("userPersonalGoalKey") || "");
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (localStorage.getItem("canopy_onboarded") && !params.get("reboard")) {
      navigate("/garden", { replace: true });
    }
  }, [navigate]);

  const triggerHaptic = (pattern: number | number[]) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
    } catch {
      /* unsupported */
    }
  };

  const stopHaptic = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    triggerHaptic(0);
  };

  const startHapticRhythm = () => {
    stopHaptic();
    triggerHaptic(30);
    hapticIntervalRef.current = setInterval(() => triggerHaptic(35), 90);
  };

  function handleHoldComplete() {
    stopHaptic();
    triggerHaptic([60, 40, 110]);
    setHoldStep("bloomed");
    setTimeout(() => setFlowStep("name"), 700);
  }

  function handlePointerDown() {
    if (holdStep !== "idle") return;
    setHoldStep("pressing");
    startHapticRhythm();
    timerRef.current = setTimeout(handleHoldComplete, 2200);
  }

  function handlePointerUp() {
    if (holdStep === "pressing") {
      stopHaptic();
      setHoldStep("idle");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
      triggerHaptic(0);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const parsedSalary = Math.max(1, parseFloat(salaryStr) || 0);
  const dailyWorkRate = Math.round(parsedSalary / 22);

  const toggleProblem = (id: string) =>
    setProblems((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const problemTitles = (): string[] =>
    problems.map((id) => {
      if (id === "custom") return customProblem.trim() || "Something else";
      return SPENDING_PROBLEMS.find((p) => p.id === id)?.title || id;
    });

  const goalText = () => {
    if (selectedGoal === "custom") return customGoal.trim() || "My own goal";
    return PERSONAL_GOALS.find((g) => g.id === selectedGoal)?.title || "Financial peace of mind";
  };

  function handleFinish() {
    const titles = problemTitles();
    localStorage.setItem("userName", name.trim() || "Friend");
    localStorage.setItem("userMonthlySalary", String(parsedSalary));
    const calculatedHourlyWage = Math.round((parsedSalary / 22 / 8) * 100) / 100;
    localStorage.setItem("userHourlyWage", String(calculatedHourlyWage));
    localStorage.setItem("userSpendingProblems", JSON.stringify(titles));
    localStorage.setItem("userSpendingProblemKeys", JSON.stringify(problems));
    localStorage.setItem("userSpendingProblem", titles.join(", "));
    localStorage.setItem("userSpendingProblemKey", problems[0] || "");
    localStorage.setItem("userPersonalGoal", goalText());
    localStorage.setItem("userPersonalGoalKey", selectedGoal);
    localStorage.setItem("canopy_onboarded", "1");
    window.dispatchEvent(new Event("garden-updated"));
    triggerHaptic([40, 60, 90]);
    navigate("/garden");
  }

  const stepIndex = STEP_ORDER.indexOf(flowStep);
  const goBack = () => {
    const prev = STEP_ORDER[stepIndex - 1];
    if (prev) setFlowStep(prev);
  };

  const canContinue =
    flowStep === "name"
      ? name.trim().length > 0
      : flowStep === "salary"
        ? parsedSalary > 1
        : flowStep === "problem"
          ? problems.length > 0 && (!problems.includes("custom") || customProblem.trim().length > 0)
          : flowStep === "goal"
            ? !!selectedGoal && (selectedGoal !== "custom" || customGoal.trim().length > 0)
            : true;

  const goNext = () => {
    if (!canContinue) return;
    if (flowStep === "summary") return handleFinish();
    const next = STEP_ORDER[stepIndex + 1];
    if (next) setFlowStep(next);
  };

  const primaryBtn = (label: string) => (
    <button
      type="button"
      onClick={goNext}
      disabled={!canContinue}
      className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:cursor-not-allowed"
      style={{
        background: canContinue ? INK : "rgba(28,46,42,0.12)",
        color: canContinue ? "#FAFAFA" : "rgba(28,46,42,0.4)",
        fontFamily: BODY,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      <span>{label}</span>
      <ArrowRight size={16} />
    </button>
  );

  const heading = (eyebrow: string, title: string, sub: string) => (
    <div>
      <p style={{ fontFamily: BODY, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", color: FOREST, fontWeight: 600 }}>
        {eyebrow}
      </p>
      <h2 style={{ fontFamily: HEAD, fontSize: "clamp(28px, 7.5vw, 38px)", color: INK, lineHeight: 1.08, marginTop: 8 }}>
        {title}
      </h2>
      <p style={{ fontFamily: BODY, fontSize: 14.5, color: INK_SOFT, marginTop: 10, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between h-9">
      {stepIndex > 0 ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/5"
          style={{ color: INK }}
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1.5" aria-label={`Step ${stepIndex + 1} of ${STEP_ORDER.length}`}>
        {STEP_ORDER.map((s, i) => (
          <motion.span
            key={s}
            className="h-1.5 rounded-full"
            animate={{ width: i === stepIndex ? 24 : 6, background: i <= stepIndex ? INK : "rgba(28,46,42,0.15)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );

  const stepShell = (key: string, children: React.ReactNode, cta: string) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full max-w-md mx-auto flex flex-col relative z-10 px-6 pt-[max(env(safe-area-inset-top,0px),24px)] pb-[max(env(safe-area-inset-bottom,0px),24px)]"
    >
      {header}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 flex flex-col gap-6" style={{ touchAction: "pan-y" }}>
        {children}
      </div>
      <div className="pt-3">{primaryBtn(cta)}</div>
    </motion.div>
  );

  const inputBase =
    "w-full bg-white border rounded-2xl px-5 py-4 outline-none transition-all focus:border-[#1C2E2A]";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: SNOW_WHITE,
        touchAction: flowStep === "holding" ? "none" : "auto",
        userSelect: flowStep === "holding" ? "none" : "auto",
        WebkitUserSelect: flowStep === "holding" ? "none" : "auto",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          opacity: 0.18,
          mixBlendMode: "multiply",
        }}
      />

      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: holdStep === "bloomed" && flowStep === "holding" ? 1 : 0 }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle at center, #FFFFFF 20%, #FFFBEB 65%, #FEF3C7 100%)" }}
      />

      <AnimatePresence mode="wait">
        {flowStep === "holding" && (
          <motion.div
            key="holding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col items-center justify-between relative z-10 py-[max(env(safe-area-inset-top,0px),40px)]"
          >
            <div />
            <div className="flex flex-col items-center gap-8 px-8">
              <div className="flex flex-col items-center gap-6">
                <h1
                  style={{
                    fontFamily: HEAD,
                    fontSize: "clamp(48px, 15vw, 80px)",
                    fontWeight: 400,
                    color: INK,
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                    textAlign: "center",
                    minHeight: "1em",
                  }}
                >
                  {fontReady && <TypewriterText text="Canopy" delay={0.15} speed={0.15} />}
                </h1>
                <p
                  style={{
                    fontFamily: BODY,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(15px, 4vw, 18px)",
                    color: "rgba(28,24,20,0.52)",
                    letterSpacing: "0.04em",
                    textAlign: "center",
                    lineHeight: 1.55,
                    maxWidth: 340,
                    minHeight: "3.2em",
                  }}
                >
                  {fontReady && (
                    <>
                      <span style={{ display: "block" }}>
                        <TypewriterText text="pause before you purchase." delay={1.3} />
                      </span>
                      <span style={{ display: "block" }}>
                        <TypewriterText text="grow what matters instead." delay={2.8} />
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <motion.div
              className="flex flex-col items-center gap-6 mt-8 mb-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 4.8 }}
            >
              <div className="relative flex flex-col items-center justify-center">
                <motion.button
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  variants={vibrateVariants}
                  animate={holdStep === "pressing" ? "pressing" : "idle"}
                  aria-label="Hold to root"
                  className="w-32 h-32 flex items-center justify-center relative focus:outline-none z-10 bg-transparent cursor-pointer select-none"
                >
                  <div className="absolute w-[300px] h-[300px] pointer-events-none flex items-center justify-center">
                    <YellowLightBloom active={holdStep === "pressing"} blooming={holdStep === "bloomed"} />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={
                        holdStep === "bloomed"
                          ? { rotate: 540, scale: 1.35, filter: "drop-shadow(0 0 24px rgba(245, 158, 11, 0.9))" }
                          : holdStep === "pressing"
                            ? { rotate: 360, scale: 1.16, filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))" }
                            : { rotate: 0, scale: 1, filter: "drop-shadow(0 0 0px rgba(0,0,0,0))" }
                      }
                      transition={
                        holdStep === "bloomed"
                          ? { duration: 0.8, ease: "easeOut" }
                          : holdStep === "pressing"
                            ? { duration: 2.2, ease: "easeInOut" }
                            : { duration: 0.6, ease: "easeOut" }
                      }
                    >
                      <SunShapeSvg width={150} height={150} />
                    </motion.div>
                  </div>
                </motion.button>
              </div>
              <motion.span
                animate={{ opacity: holdStep === "pressing" ? 0.35 : 1, scale: holdStep === "pressing" ? 0.94 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: BODY,
                  fontWeight: 400,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(28,24,20,0.35)",
                  zIndex: 10,
                }}
              >
                {holdStep === "bloomed" ? "rooted" : "hold to root"}
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {flowStep === "name" &&
          stepShell(
            "name",
            <>
              {heading("Welcome", "What should we call you?", "Canopy is personal. Your name makes the reflections feel like they come from someone who knows you.")}
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goNext()}
                placeholder="Your first name"
                className={inputBase}
                style={{ fontFamily: HEAD, fontSize: 26, color: INK, borderColor: INK_FAINT }}
              />
            </>,
            "Continue",
          )}

        {flowStep === "salary" &&
          stepShell(
            "salary",
            <>
              {heading(
                "Your time has a price",
                "What do you take home each month?",
                "We turn prices into days of your work, so \u20B95,000 feels like what it really costs you. This never leaves your device.",
              )}
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2" style={{ fontFamily: HEAD, fontSize: 26, color: "rgba(28,46,42,0.4)" }}>
                  {"\u20B9"}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  value={salaryStr}
                  onChange={(e) => setSalaryStr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  className={`${inputBase} pl-11`}
                  style={{ fontFamily: HEAD, fontSize: 26, color: INK, borderColor: INK_FAINT }}
                />
              </div>
              <div className="flex flex-wrap gap-2 -mt-2">
                {[30000, 50000, 75000, 100000, 150000].map((val) => {
                  const on = parsedSalary === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSalaryStr(String(val))}
                      className="px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors"
                      style={{
                        background: on ? INK : "#FFFFFF",
                        color: on ? "#FAFAFA" : INK,
                        border: `1px solid ${on ? INK : INK_FAINT}`,
                        fontFamily: BODY,
                      }}
                    >
                      {"\u20B9"}{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(47,107,94,0.08)" }}>
                <p style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 600 }}>
                  One day of work is about {"\u20B9"}{dailyWorkRate.toLocaleString("en-IN")}
                </p>
                <p style={{ fontFamily: BODY, fontSize: 12.5, color: INK_SOFT, marginTop: 2 }}>
                  Based on 22 working days a month.
                </p>
              </div>
            </>,
            "Continue",
          )}

        {flowStep === "problem" &&
          stepShell(
            "problem",
            <>
              {heading(
                "Be honest, no judgment",
                "When do you spend without meaning to?",
                "Choose every one that sounds like you. We\u2019ll use these to ask better questions at the moment it matters.",
              )}
              <div className="flex flex-col gap-2.5">
                {SPENDING_PROBLEMS.map((opt) => (
                  <OptionRow key={opt.id} option={opt} multi selected={problems.includes(opt.id)} onClick={() => toggleProblem(opt.id)} />
                ))}
              </div>
              {problems.includes("custom") && (
                <input
                  type="text"
                  autoFocus
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="What triggers it for you?"
                  className={inputBase}
                  style={{ fontFamily: BODY, fontSize: 15, color: INK, borderColor: INK_FAINT }}
                />
              )}
              <p style={{ fontFamily: BODY, fontSize: 12.5, color: INK_SOFT, textAlign: "center" }}>
                {problems.length === 0 ? "Pick at least one" : `${problems.length} selected`}
              </p>
            </>,
            "Continue",
          )}

        {flowStep === "goal" &&
          stepShell(
            "goal",
            <>
              {heading(
                "The reason behind it all",
                "What is your money for instead?",
                "When you let an urge go, this is where that money and time are headed.",
              )}
              <div className="flex flex-col gap-2.5">
                {PERSONAL_GOALS.map((opt) => (
                  <OptionRow key={opt.id} option={opt} multi={false} selected={selectedGoal === opt.id} onClick={() => setSelectedGoal(opt.id)} />
                ))}
              </div>
              {selectedGoal === "custom" && (
                <input
                  type="text"
                  autoFocus
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Describe your goal"
                  className={inputBase}
                  style={{ fontFamily: BODY, fontSize: 15, color: INK, borderColor: INK_FAINT }}
                />
              )}
            </>,
            "Continue",
          )}

        {flowStep === "summary" &&
          stepShell(
            "summary",
            <>
              {heading(
                `Welcome, ${name.trim() || "Friend"}`,
                "Your canopy is rooted.",
                "Next time an urge shows up, open Canopy, draw for a minute, and let your future self decide.",
              )}
              <div className="rounded-3xl bg-white" style={{ border: `1px solid ${INK_FAINT}` }}>
                {[
                  { label: "Moments to soften", value: problemTitles().join(" \u00B7 ") },
                  { label: "Saving towards", value: goalText() },
                  {
                    label: "Your time",
                    value: `\u20B9${parsedSalary.toLocaleString("en-IN")} a month, about \u20B9${dailyWorkRate.toLocaleString("en-IN")} per day of work`,
                  },
                ].map((row, i) => (
                  <div key={row.label} className="px-5 py-4" style={{ borderTop: i ? `1px solid ${INK_FAINT}` : "none" }}>
                    <p style={{ fontFamily: BODY, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: INK_SOFT }}>
                      {row.label}
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: i === 1 ? FOREST : INK, marginTop: 4, lineHeight: 1.4 }}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </>,
            "Enter my garden",
          )}
      </AnimatePresence>
    </div>
  );
}