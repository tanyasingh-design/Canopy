import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SunShapeSvg } from "./SunShapeSvg";

const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const INK = "#1C2E2A";
const SNOW_WHITE = "#FAFAFA";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`;

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

type Step = "idle" | "pressing" | "blooming";

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
  blooming: { x: 0, y: 0 },
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


export function Onboarding() {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [step, setStep] = useState<Step>("idle");
  const [fontReady, setFontReady] = useState(false);

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
    if (localStorage.getItem("canopy_onboarded")) {
      navigate("/garden", { replace: true });
    }
  }, [navigate]);

  const triggerHaptic = (pattern: number | number[]) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Non-supporting browsers/devices fail silently
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
    if (hasNavigated.current) return;
    stopHaptic();
    // Triumphant hold completion haptic pulse
    triggerHaptic([60, 40, 110]);
    setStep("blooming");

    // Luminous sun rays flare and flood the screen, then open the garden
    setTimeout(() => {
      hasNavigated.current = true;
      localStorage.setItem("canopy_onboarded", "1");
      navigate("/garden");
    }, 750);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (step !== "idle") return;
    setStep("pressing");
    startHapticRhythm();
    timerRef.current = setTimeout(() => {
      handleHoldComplete();
    }, 2200); // 2.2s hold
  }

  function handlePointerUp() {
    if (step === "pressing") {
      stopHaptic();
      setStep("idle");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  // Clean up timer and haptics on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
      triggerHaptic(0);
    };
  }, []);

  // Prevent context menu on long press on mobile
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: SNOW_WHITE,
        touchAction: "none",
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
          opacity: 0.2,
          mixBlendMode: "multiply",
        }}
      />

      {/* Radiant Full-screen Sun Bloom Overlay during transition */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === "blooming" ? 1 : 0 }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at center, #FFFFFF 20%, #FFFBEB 65%, #FEF3C7 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key="intro"
          className="w-full h-full flex flex-col items-center justify-between relative z-10 py-[max(env(safe-area-inset-top,0px),40px)]"
        >
          {/* Top spacer */}
          <div />

          {/* Centre block */}
          <div className="flex flex-col items-center gap-8 px-8">
            {/* Wordmark */}
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
              {/* Sun Button with Haptic Micro-shake */}
              <motion.button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
                variants={vibrateVariants}
                animate={step === "pressing" ? "pressing" : "idle"}
                className="w-32 h-32 flex items-center justify-center relative focus:outline-none z-10 bg-transparent cursor-pointer select-none"
              >
                {/* Sun Container & Warm Yellow Light Bloom */}
                <div className="absolute w-[300px] h-[300px] pointer-events-none flex items-center justify-center">
                  {/* Pure Yellow Light Radiance (No rays, triangles, or circles) */}
                  <YellowLightBloom
                    active={step === "pressing"}
                    blooming={step === "blooming"}
                  />

                  {/* Rotating & Glowing Sun Core */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={
                      step === "blooming"
                        ? {
                            rotate: 540,
                            scale: 1.35,
                            filter:
                              "drop-shadow(0 0 24px rgba(245, 158, 11, 0.9))",
                          }
                        : step === "pressing"
                          ? {
                              rotate: 360,
                              scale: 1.16,
                              filter:
                                "drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))",
                            }
                          : {
                              rotate: 0,
                              scale: 1,
                              filter: "drop-shadow(0 0 0px rgba(0,0,0,0))",
                            }
                    }
                    transition={
                      step === "blooming"
                        ? { duration: 0.8, ease: "easeOut" }
                        : step === "pressing"
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
                opacity: step === "pressing" ? 0.35 : 1,
                scale: step === "pressing" ? 0.94 : 1,
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
              {step === "blooming" ? "rooted" : "hold to root"}
            </motion.span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}