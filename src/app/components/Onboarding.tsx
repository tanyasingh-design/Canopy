import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { SunShapeSvg } from "./SunShapeSvg";

const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const INK = "#1C2E2A";
const SNOW_WHITE = "#FAFAFA";
const GREEN = "#4DAA57";
const FOREST = "#2F6B5E";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3Cfilter%3E%3Crect width='512' height='512' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`;

function TypewriterText({
  text,
  delay = 0,
  speed = 0.04,
}: {
  text: string;
  delay?: number;
  speed?: number;
}) {
  const characters = Array.from(text);
  return (
    <span>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.1,
            delay: delay + index * speed,
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

type HoldStep = "idle" | "pressing" | "bloomed";
type FlowStep = "holding" | "name" | "salary" | "problem" | "goal" | "grounding";

const vibrateVariants = {
  idle: { x: 0, y: 0 },
  pressing: {
    x: [-1.2, 1.2, -1, 1, -0.6, 0.6, 0],
    y: [0.8, -0.8, 1, -1, 0.6, -0.6, 0],
    transition: {
      duration: 0.1,
      repeat: Infinity,
      ease: "linear",
    },
  },
  bloomed: { x: 0, y: 0 },
};

function YellowLightBloom({
  active,
  blooming,
}: {
  active: boolean;
  blooming: boolean;
}) {
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
      {/* Expanding Sun Rays */}
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
        animate={
          blooming
            ? {
                opacity: [1, 0.8, 0],
                scale: [1.2, 2.5, 4],
                rotate: 120,
              }
            : active
              ? {
                  opacity: [0, 0.6, 1],
                  scale: [0.5, 1, 1.2],
                  rotate: 45,
                }
              : { opacity: 0, scale: 0.2, rotate: 0 }
        }
        transition={
          blooming
            ? { duration: 0.8, ease: "easeOut" }
            : active
              ? { duration: 2.2, ease: "linear" }
              : { duration: 0.35, ease: "easeOut" }
        }
      />

      {/* Inner vibrant yellow core light */}
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
        animate={
          blooming
            ? {
                opacity: [1, 1, 0.95],
                scale: [1.2, 2.6, 3.6],
              }
            : active
              ? {
                  opacity: [0.25, 0.75, 1],
                  scale: [0.55, 1.08, 1.25],
                }
              : { opacity: 0, scale: 0.3 }
        }
        transition={
          blooming
            ? { duration: 0.8, ease: "easeOut" }
            : active
              ? { duration: 2.2, ease: "easeInOut" }
              : { duration: 0.35, ease: "easeOut" }
        }
      />

      {/* Outer expansive warm ambient yellow glow */}
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
        animate={
          blooming
            ? {
                opacity: [0.8, 1, 0.95],
                scale: [1.15, 2.5, 3.5],
              }
            : active
              ? {
                  opacity: [0.15, 0.55, 0.85],
                  scale: [0.6, 1.1, 1.3],
                }
              : { opacity: 0, scale: 0.4 }
        }
        transition={
          blooming
            ? { duration: 0.8, ease: "easeOut" }
            : active
              ? { duration: 2.2, ease: "easeInOut" }
              : { duration: 0.35, ease: "easeOut" }
        }
      />
    </div>
  );
}

// Preset problems/struggles
const SPENDING_PROBLEMS = [
  {
    id: "late_night",
    icon: "🌙",
    title: "Late-night scrolling & shopping",
    desc: "Amazon, Blinkit, or fashion apps in bed when tired",
  },
  {
    id: "stress",
    icon: "😮‍💨",
    title: "Exhaustion & stress soothing",
    desc: "'Work was brutal today, I deserve this treat'",
  },
  {
    id: "discount",
    icon: "🏷️",
    title: "Sale & discount FOMO",
    desc: "'It's 40% off, I will regret not buying it right now'",
  },
  {
    id: "boredom",
    icon: "📦",
    title: "Boredom & dopamine taps",
    desc: "Ordering takeout or gadgets just to feel something arrive",
  },
  {
    id: "fantasy_self",
    icon: "🪴",
    title: "Fantasy self purchases",
    desc: "Buying gear, books, or clothes for an ideal life I don't live yet",
  },
  {
    id: "custom",
    icon: "✏️",
    title: "My own trigger...",
    desc: "Describe what causes impulse spending for you",
  },
];

// Preset personal goals
const PERSONAL_GOALS = [
  {
    id: "travel",
    icon: "✈️",
    title: "Dream travel & adventures",
    desc: "Exploring somewhere new with zero lingering financial guilt",
  },
  {
    id: "emergency",
    icon: "🛡️",
    title: "Peace of mind cushion",
    desc: "3 to 6 months of stress-free living expenses in savings",
  },
  {
    id: "home",
    icon: "🏡",
    title: "My own space & sanctuary",
    desc: "Moving out, renting comfortably, or upgrading home life",
  },
  {
    id: "freedom",
    icon: "🧘",
    title: "Financial freedom & working less",
    desc: "Investing early, escaping hustle burnout, buying back time",
  },
  {
    id: "milestone",
    icon: "🎯",
    title: "A meaningful milestone",
    desc: "Saving intentionally for one special life dream or craft",
  },
  {
    id: "custom",
    icon: "🌱",
    title: "A personal goal...",
    desc: "Write what you want your saved energy to grow into",
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [holdStep, setHoldStep] = useState<HoldStep>("idle");
  const [flowStep, setFlowStep] = useState<FlowStep>("holding");
  const [fontReady, setFontReady] = useState(false);

  // Form State
  const [name, setName] = useState(() => localStorage.getItem("userName") || "");
  const [salaryStr, setSalaryStr] = useState(() => localStorage.getItem("userMonthlySalary") || "50000");
  const [selectedProblem, setSelectedProblem] = useState<string>(() => localStorage.getItem("userSpendingProblemKey") || "late_night");
  const [customProblem, setCustomProblem] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string>(() => localStorage.getItem("userPersonalGoalKey") || "travel");
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        setFontReady(true);
      });
    } else {
      setFontReady(true);
    }
  }, []);

  useEffect(() => {
    // Only redirect if onboarded and not intentionally returning via re-run
    const params = new URLSearchParams(window.location.search);
    if (localStorage.getItem("canopy_onboarded") && !params.get("reboard")) {
      navigate("/garden", { replace: true });
    }
  }, [navigate]);

  const triggerHaptic = (pattern: number | number[]) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Non-supporting devices fail silently
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
    hapticIntervalRef.current = setInterval(() => {
      triggerHaptic(35);
    }, 90);
  };

  function handleHoldComplete() {
    stopHaptic();
    triggerHaptic([60, 40, 110]);
    setHoldStep("bloomed");

    // Luminous bloom flares, then gently opens the onboarding questions
    setTimeout(() => {
      setFlowStep("name");
    }, 700);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (holdStep !== "idle") return;
    setHoldStep("pressing");
    startHapticRhythm();
    timerRef.current = setTimeout(() => {
      handleHoldComplete();
    }, 2200); // 2.2s hold
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

  // Prevent context menu on long press
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const parsedSalary = Math.max(1, parseFloat(salaryStr) || 50000);
  const dailyWorkRate = Math.round(parsedSalary / 22);

  const getProblemText = () => {
    if (selectedProblem === "custom") {
      return customProblem.trim() || "Impulse spending";
    }
    const found = SPENDING_PROBLEMS.find((p) => p.id === selectedProblem);
    return found ? found.title : "Impulse spending";
  };

  const getGoalText = () => {
    if (selectedGoal === "custom") {
      return customGoal.trim() || "My personal dream";
    }
    const found = PERSONAL_GOALS.find((g) => g.id === selectedGoal);
    return found ? found.title : "Financial peace of mind";
  };

  function handleFinishOnboarding() {
    const resolvedName = name.trim() || "Friend";
    const resolvedProblem = getProblemText();
    const resolvedGoal = getGoalText();
    const hourlyWage = parsedSalary / 22 / 8;

    localStorage.setItem("userName", resolvedName);
    localStorage.setItem("userMonthlySalary", String(parsedSalary));
    localStorage.setItem("userHourlyWage", String(hourlyWage));
    localStorage.setItem("userSpendingProblem", resolvedProblem);
    localStorage.setItem("userSpendingProblemKey", selectedProblem);
    localStorage.setItem("userPersonalGoal", resolvedGoal);
    localStorage.setItem("userPersonalGoalKey", selectedGoal);
    localStorage.setItem("canopy_onboarded", "1");

    window.dispatchEvent(new Event("garden-updated"));
    triggerHaptic([40, 60, 90]);
    navigate("/garden");
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: SNOW_WHITE,
        touchAction: flowStep === "holding" ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Grain overlay */}
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

      {/* Radiant Full-screen Sun Bloom Overlay during transition */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: holdStep === "bloomed" && flowStep === "holding" ? 1 : 0 }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at center, #FFFFFF 20%, #FFFBEB 65%, #FEF3C7 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {/* ── HOLD TO ROOT INTRO SCREEN ── */}
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

            {/* Centre block */}
            <div className="flex flex-col items-center gap-8 px-8">
              <div className="flex flex-col items-center gap-6">
                <motion.h1
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
                  {fontReady && (
                    <TypewriterText text="Canopy" delay={0.15} speed={0.15} />
                  )}
                </motion.h1>

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
                        <TypewriterText
                          text="pause before you purchase."
                          delay={1.3}
                        />
                      </span>
                      <span style={{ display: "block" }}>
                        <TypewriterText
                          text="grow what matters instead."
                          delay={2.8}
                        />
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Bottom — tap cue */}
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
                  className="w-32 h-32 flex items-center justify-center relative focus:outline-none z-10 bg-transparent cursor-pointer select-none"
                >
                  <div className="absolute w-[300px] h-[300px] pointer-events-none flex items-center justify-center">
                    <YellowLightBloom
                      active={holdStep === "pressing"}
                      blooming={holdStep === "bloomed"}
                    />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={
                        holdStep === "bloomed"
                          ? {
                              rotate: 540,
                              scale: 1.35,
                              filter: "drop-shadow(0 0 24px rgba(245, 158, 11, 0.9))",
                            }
                          : holdStep === "pressing"
                            ? {
                                rotate: 360,
                                scale: 1.16,
                                filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))",
                              }
                            : {
                                rotate: 0,
                                scale: 1,
                                filter: "drop-shadow(0 0 0px rgba(0,0,0,0))",
                              }
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
                animate={{
                  opacity: holdStep === "pressing" ? 0.35 : 1,
                  scale: holdStep === "pressing" ? 0.94 : 1,
                }}
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

        {/* ── STEP 1: NAME ── */}
        {flowStep === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full h-full max-w-md mx-auto flex flex-col justify-between relative z-10 px-6 py-[max(env(safe-area-inset-top,0px),36px)] pb-[max(env(safe-area-inset-bottom,0px),30px)]"
          >
            {/* Header / progress */}
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: BODY, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,46,42,0.4)" }}>
                Step 1 of 4
              </span>
              <div className="flex gap-1.5">
                <span className="w-6 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
              </div>
            </div>

            {/* Center question */}
            <div className="flex flex-col gap-5 my-auto">
              <span className="text-3xl">🌱</span>
              <div>
                <h2 style={{ fontFamily: HEAD, fontSize: "clamp(28px, 7vw, 38px)", color: INK, lineHeight: 1.15 }}>
                  What should we call you?
                </h2>
                <p style={{ fontFamily: BODY, fontSize: 15, color: "rgba(28,46,42,0.6)", marginTop: 8, lineHeight: 1.5 }}>
                  A name to ground your canopy and make this garden your own.
                </p>
              </div>

              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) setFlowStep("salary");
                }}
                placeholder="e.g. Maya"
                className="w-full bg-white/80 border border-[rgba(28,46,42,0.15)] rounded-2xl px-5 py-4 text-2xl outline-none focus:border-[#1C2E2A] transition-all shadow-sm"
                style={{ fontFamily: HEAD, color: INK }}
              />
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setFlowStep("salary")}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  background: INK,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: SALARY ── */}
        {flowStep === "salary" && (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full h-full max-w-md mx-auto flex flex-col justify-between relative z-10 px-6 py-[max(env(safe-area-inset-top,0px),36px)] pb-[max(env(safe-area-inset-bottom,0px),30px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFlowStep("name")}
                className="p-2 -ml-2 rounded-full text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-6 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 my-auto">
              <span className="text-3xl">⏳</span>
              <div>
                <h2 style={{ fontFamily: HEAD, fontSize: "clamp(26px, 6.5vw, 36px)", color: INK, lineHeight: 1.15 }}>
                  What is your monthly salary?
                </h2>
                <p style={{ fontFamily: BODY, fontSize: 14.5, color: "rgba(28,46,42,0.6)", marginTop: 8, lineHeight: 1.5 }}>
                  We keep this completely private on your device. We use it to translate impulse urges into real days of your life.
                </p>
              </div>

              {/* Currency input */}
              <div className="relative flex items-center">
                <span
                  className="absolute left-5 text-2xl font-bold"
                  style={{ fontFamily: HEAD, color: "rgba(28,46,42,0.4)" }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  value={salaryStr}
                  onChange={(e) => setSalaryStr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setFlowStep("problem");
                  }}
                  className="w-full bg-white/80 border border-[rgba(28,46,42,0.15)] rounded-2xl pl-12 pr-5 py-4 text-2xl outline-none focus:border-[#1C2E2A] transition-all shadow-sm"
                  style={{ fontFamily: HEAD, color: INK }}
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2">
                {[30000, 50000, 75000, 100000, 150000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSalaryStr(String(val))}
                    className="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                    style={{
                      background: parsedSalary === val ? INK : "rgba(28,46,42,0.06)",
                      color: parsedSalary === val ? "#FAFAFA" : INK,
                      fontFamily: BODY,
                      border: `1px solid ${parsedSalary === val ? INK : "rgba(28,46,42,0.1)"}`,
                    }}
                  >
                    ₹{(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              {/* Work rate preview pill */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "rgba(47,107,94,0.08)", border: "1px solid rgba(47,107,94,0.18)" }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: FOREST, color: "#fff" }}>
                  <Sparkles size={14} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: BODY, fontSize: 13, color: INK, fontWeight: 500 }}>
                    ≈ ₹{dailyWorkRate.toLocaleString("en-IN")} earned for each day of work
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 11.5, color: "rgba(28,46,42,0.6)" }}>
                    Based on 22 working days (8 hours/day)
                  </span>
                </div>
              </div>
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setFlowStep("problem")}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  background: INK,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: SPENDING PROBLEM / REASON ── */}
        {flowStep === "problem" && (
          <motion.div
            key="problem"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full h-full max-w-md mx-auto flex flex-col justify-between relative z-10 px-6 py-[max(env(safe-area-inset-top,0px),36px)] pb-[max(env(safe-area-inset-bottom,0px),30px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFlowStep("salary")}
                className="p-2 -ml-2 rounded-full text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-6 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 my-auto overflow-y-auto max-h-[70vh] py-2 pr-1">
              <div>
                <span className="text-3xl">🛡️</span>
                <h2 style={{ fontFamily: HEAD, fontSize: "clamp(24px, 6vw, 34px)", color: INK, lineHeight: 1.15, marginTop: 4 }}>
                  What spending pattern hurts most?
                </h2>
                <p style={{ fontFamily: BODY, fontSize: 14, color: "rgba(28,46,42,0.6)", marginTop: 6, lineHeight: 1.45 }}>
                  The impulse habit you want Canopy to help you soften and reflect on.
                </p>
              </div>

              {/* Problem choices */}
              <div className="flex flex-col gap-2.5">
                {SPENDING_PROBLEMS.map((prob) => {
                  const isSelected = selectedProblem === prob.id;
                  return (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => setSelectedProblem(prob.id)}
                      className="text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer"
                      style={{
                        background: isSelected ? "rgba(47,107,94,0.12)" : "rgba(255,255,255,0.85)",
                        border: isSelected ? "1.5px solid #2F6B5E" : "1px solid rgba(28,46,42,0.1)",
                        boxShadow: isSelected ? "0 4px 14px rgba(47,107,94,0.12)" : "none",
                      }}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{prob.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p style={{ fontFamily: BODY, fontSize: 14.5, fontWeight: 600, color: INK }}>
                            {prob.title}
                          </p>
                          {isSelected && <Check size={16} className="text-[#2F6B5E]" />}
                        </div>
                        <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(28,46,42,0.6)", marginTop: 2 }}>
                          {prob.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedProblem === "custom" && (
                <input
                  type="text"
                  autoFocus
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="Describe your impulse trigger..."
                  className="w-full bg-white/90 border border-[rgba(28,46,42,0.2)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#1C2E2A] transition-all"
                  style={{ fontFamily: BODY, color: INK }}
                />
              )}
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setFlowStep("goal")}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  background: INK,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: PERSONAL GOAL ── */}
        {flowStep === "goal" && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full h-full max-w-md mx-auto flex flex-col justify-between relative z-10 px-6 py-[max(env(safe-area-inset-top,0px),36px)] pb-[max(env(safe-area-inset-bottom,0px),30px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFlowStep("problem")}
                className="p-2 -ml-2 rounded-full text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E2A]" />
                <span className="w-6 h-1.5 rounded-full bg-[#1C2E2A]" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 my-auto overflow-y-auto max-h-[70vh] py-2 pr-1">
              <div>
                <span className="text-3xl">🌱</span>
                <h2 style={{ fontFamily: HEAD, fontSize: "clamp(24px, 6vw, 34px)", color: INK, lineHeight: 1.15, marginTop: 4 }}>
                  What are you growing towards?
                </h2>
                <p style={{ fontFamily: BODY, fontSize: 14, color: "rgba(28,46,42,0.6)", marginTop: 6, lineHeight: 1.45 }}>
                  When you let an impulse go, where should that saved money and life force flow instead?
                </p>
              </div>

              {/* Goal choices */}
              <div className="flex flex-col gap-2.5">
                {PERSONAL_GOALS.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setSelectedGoal(goal.id)}
                      className="text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer"
                      style={{
                        background: isSelected ? "rgba(77,170,87,0.12)" : "rgba(255,255,255,0.85)",
                        border: isSelected ? "1.5px solid #4DAA57" : "1px solid rgba(28,46,42,0.1)",
                        boxShadow: isSelected ? "0 4px 14px rgba(77,170,87,0.12)" : "none",
                      }}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{goal.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p style={{ fontFamily: BODY, fontSize: 14.5, fontWeight: 600, color: INK }}>
                            {goal.title}
                          </p>
                          {isSelected && <Check size={16} className="text-[#4DAA57]" />}
                        </div>
                        <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(28,46,42,0.6)", marginTop: 2 }}>
                          {goal.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedGoal === "custom" && (
                <input
                  type="text"
                  autoFocus
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Describe your goal or dream..."
                  className="w-full bg-white/90 border border-[rgba(28,46,42,0.2)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#1C2E2A] transition-all"
                  style={{ fontFamily: BODY, color: INK }}
                />
              )}
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setFlowStep("grounding")}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  background: GREEN,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  boxShadow: "0 6px 20px rgba(77,170,87,0.35)",
                }}
              >
                <span>Complete Grounding</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: GROUNDING & COMMITMENT ── */}
        {flowStep === "grounding" && (
          <motion.div
            key="grounding"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full max-w-md mx-auto flex flex-col justify-between relative z-10 px-6 py-[max(env(safe-area-inset-top,0px),36px)] pb-[max(env(safe-area-inset-bottom,0px),30px)]"
          >
            <div />

            {/* Commitment Card */}
            <div className="flex flex-col items-center text-center gap-6 my-auto">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "#2F6B5E", color: "#FAFAFA" }}
              >
                <Sparkles size={28} />
              </div>

              <div>
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{ background: "rgba(47,107,94,0.12)", color: FOREST, fontFamily: BODY }}
                >
                  Welcome, {name.trim() || "Friend"}
                </span>
                <h2
                  style={{
                    fontFamily: HEAD,
                    fontSize: "clamp(30px, 8vw, 42px)",
                    color: INK,
                    marginTop: 12,
                    lineHeight: 1.1,
                  }}
                >
                  Your canopy is rooted.
                </h2>
              </div>

              {/* Intention summary pill box */}
              <div
                className="w-full rounded-3xl p-5 text-left flex flex-col gap-3.5"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(28,46,42,0.1)",
                  boxShadow: "0 12px 36px rgba(28,46,42,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p style={{ fontFamily: BODY, fontSize: 11.5, color: "rgba(28,46,42,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Breaking free from
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: INK }}>
                      {getProblemText()}
                    </p>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-[rgba(28,46,42,0.08)]" />

                <div className="flex items-start gap-3">
                  <span className="text-xl">🌱</span>
                  <div>
                    <p style={{ fontFamily: BODY, fontSize: 11.5, color: "rgba(28,46,42,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Growing your money towards
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: FOREST }}>
                      {getGoalText()}
                    </p>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-[rgba(28,46,42,0.08)]" />

                <div className="flex items-start gap-3">
                  <span className="text-xl">⏳</span>
                  <div>
                    <p style={{ fontFamily: BODY, fontSize: 11.5, color: "rgba(28,46,42,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Daily work calibration
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 14, color: INK }}>
                      ₹{parsedSalary.toLocaleString("en-IN")}/mo · ≈ ₹{dailyWorkRate.toLocaleString("en-IN")} per working day
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ fontFamily: BODY, fontSize: 13.5, color: "rgba(28,46,42,0.6)", lineHeight: 1.55, maxWidth: 320 }}>
                Whenever an impulse knocks, open Canopy. Draw for a few moments, feel the pause, and let your future self decide.
              </p>
            </div>

            {/* Enter Garden Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  background: INK,
                  color: "#FAFAFA",
                  fontFamily: BODY,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  boxShadow: "0 8px 24px rgba(28,46,42,0.25)",
                }}
              >
                <span>Enter Garden</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}