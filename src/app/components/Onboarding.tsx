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
type FlowStep = "holding" | "name" | "problem" | "goal" | "summary";

const STEP_ORDER: FlowStep[] = ["name", "problem", "goal", "summary"];

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

type Option = { id: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string };

const SPENDING_PROBLEMS: Option[] = [
  { id: "late_night", Icon: Moon, title: "Late-night scrolling" },
  { id: "stress", Icon: BatteryLow, title: "Stress and exhaustion" },
  { id: "discount", Icon: Tag, title: "Sales and discounts" },
  { id: "boredom", Icon: Smartphone, title: "Boredom" },
  { id: "fantasy_self", Icon: Shirt, title: "Buying for a future self" },
  { id: "custom", Icon: PencilLine, title: "Something else" },
];

const PERSONAL_GOALS: Option[] = [
  { id: "travel", Icon: Plane, title: "A trip I\u2019ve been putting off" },
  { id: "emergency", Icon: ShieldCheck, title: "A safety cushion" },
  { id: "home", Icon: Home, title: "A space of my own" },
  { id: "freedom", Icon: Hourglass, title: "Working less, later" },
  { id: "milestone", Icon: Target, title: "One meaningful milestone" },
  { id: "custom", Icon: Sprout, title: "Something else" },
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
    localStorage.removeItem("userMonthlySalary");
    localStorage.removeItem("userHourlyWage");
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
                `Your Living Sketchbook · ${name.trim() || "Friend"}`,
                "Your spending, drawn in flowers.",
                "Numbers in a bank app are easy to ignore. Here, every urge becomes a hand-drawn flower — so you can literally see your moods, your pauses, and your savings bloom side by side.",
              )}

              {/* Creative Botanical Keepsake Ticket */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="relative shrink-0 rounded-[26px] overflow-hidden bg-white"
                style={{
                  border: `1px solid ${INK_FAINT}`,
                  boxShadow: "0 14px 36px -12px rgba(28,46,42,0.08)",
                }}
              >
                {/* Top Dotted Sketchbook Stage — Live self-drawing flowers */}
                <div
                  className="relative px-5 pt-5 pb-4 overflow-hidden"
                  style={{
                    backgroundColor: "#FAF8F3",
                    backgroundImage: "radial-gradient(rgba(28,46,42,0.13) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                    backgroundPosition: "center center",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(28,46,42,0.45)",
                        fontWeight: 600,
                      }}
                    >
                      How your garden reads you
                    </span>
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-full"
                      style={{
                        fontFamily: BODY,
                        fontSize: 10,
                        lineHeight: 1,
                        background: "rgba(47,107,94,0.1)",
                        color: FOREST,
                        fontWeight: 600,
                      }}
                    >
                      1 urge = 1 drawing
                    </span>
                  </div>

                  {/* Three self-drawing specimen flowers */}
                  <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
                    {/* Specimen 1: Mood / Trigger */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14 overflow-visible">
                          <motion.path
                            d="M32 54 C32 42 31 34 32 26"
                            stroke="#2F6B5E"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                          <motion.path
                            d="M32 24 C22 14 14 24 26 30 C16 34 22 44 32 32 C42 44 48 34 38 30 C50 24 42 14 32 24 Z"
                            stroke="#C85A42"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(200,90,66,0.12)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.1, delay: 0.45, ease: "easeInOut" }}
                          />
                          <motion.circle
                            cx="32"
                            cy="28"
                            r="3"
                            fill="#F4A93B"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2, type: "spring" }}
                          />
                        </svg>
                      </div>
                      <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, color: INK, lineHeight: 1.2 }}>
                        Mood Color
                      </span>
                      <span style={{ fontFamily: BODY, fontSize: 10, color: INK_SOFT, marginTop: 1 }}>
                        Shows why you craved
                      </span>
                    </div>

                    {/* Specimen 2: Saved Bloom */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14 overflow-visible">
                          <motion.path
                            d="M32 55 C32 42 33 32 32 22 M32 42 C26 39 23 35 25 32 M32 38 C37 35 40 31 38 28"
                            stroke="#2F6B5E"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                          />
                          <motion.path
                            d="M32 12 C27 18 28 24 32 26 C36 24 37 18 32 12 Z M21 20 C22 26 27 28 31 27 C29 22 25 19 21 20 Z M43 20 C42 26 37 28 33 27 C35 22 39 19 43 20 Z"
                            stroke="#4DAA57"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(77,170,87,0.16)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.1, delay: 0.8, ease: "easeInOut" }}
                          />
                        </svg>
                      </div>
                      <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, color: "#286634", lineHeight: 1.2 }}>
                        Saved Urge
                      </span>
                      <span style={{ fontFamily: BODY, fontSize: 10, color: INK_SOFT, marginTop: 1 }}>
                        Funds your real goal
                      </span>
                    </div>

                    {/* Specimen 3: Honest Archive */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14 overflow-visible">
                          <motion.path
                            d="M32 54 C31 43 33 34 32 26"
                            stroke="#2F6B5E"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                          />
                          <motion.path
                            d="M32 27 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M32 27 m -5 0 a 5 5 0 1 1 10 0 a 5 5 0 1 1 -10 0"
                            stroke="#D49B35"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="rgba(212,155,53,0.14)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.1, delay: 1.05, ease: "easeInOut" }}
                          />
                        </svg>
                      </div>
                      <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, color: INK, lineHeight: 1.2 }}>
                        Pattern Map
                      </span>
                      <span style={{ fontFamily: BODY, fontSize: 10, color: INK_SOFT, marginTop: 1 }}>
                        Spots trigger days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Personalized Blueprint */}
                <div
                  className="px-5 py-4 bg-white"
                  style={{
                    borderTop: "1px dashed rgba(28,46,42,0.18)",
                  }}
                >
                  <p style={{ fontFamily: BODY, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK_SOFT }}>
                    Triggers you’ll catch in sketches
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {problemTitles().map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full"
                        style={{
                          fontFamily: BODY,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: INK,
                          background: "rgba(28,46,42,0.06)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>,
            "Enter my garden",
          )}
      </AnimatePresence>
    </div>
  );
}