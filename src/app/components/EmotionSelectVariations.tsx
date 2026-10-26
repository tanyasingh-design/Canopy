import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

// ─── Shared emotion data ───────────────────────────────────────────────────────
const emotions = [
  {
    name: "Cool Blue",
    label: "Stress / Anxiety",
    hex: "#5B9BD5",
    soft: "#EAF2FB",
    icon: "wave",
  },
  {
    name: "Warm Orange",
    label: "Excitement / FOMO",
    hex: "#E8834A",
    soft: "#FDF0E8",
    icon: "spark",
  },
  {
    name: "Deep Purple",
    label: "Sadness / Low mood",
    hex: "#9B72CF",
    soft: "#F3EDF9",
    icon: "drop",
  },
  {
    name: "Soft Pink",
    label: "Comfort seeking",
    hex: "#E8759A",
    soft: "#FDE8EF",
    icon: "moon",
  },
  {
    name: "Bright Yellow",
    label: "Boredom",
    hex: "#D4A017",
    soft: "#FBF6E3",
    icon: "circle",
  },
  {
    name: "Forest Green",
    label: "Grounded / Calm",
    hex: "#5A9E6F",
    soft: "#EBF5EE",
    icon: "leaf",
  },
];

// ─── SVG Icons (change color via `color` prop) ─────────────────────────────────
function MoodSVG({ icon, color, size = 32 }: { icon: string; color: string; size?: number }) {
  const s = size;
  switch (icon) {
    case "wave":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <path
            d="M4 11 C7 8, 10 8, 13 11 C16 14, 19 14, 22 11 C25 8, 28 8, 31 11"
            stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"
          />
          <path
            d="M4 16 C7 13, 10 13, 13 16 C16 19, 19 19, 22 16 C25 13, 28 13, 31 16"
            stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"
          />
          <path
            d="M4 21 C7 18, 10 18, 13 21 C16 24, 19 24, 22 21 C25 18, 28 18, 31 21"
            stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"
          />
        </svg>
      );
    case "spark":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <path d="M16 4 L17.5 13 L26 14.5 L17.5 16 L16 25 L14.5 16 L6 14.5 L14.5 13 Z"
            stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          <circle cx="24" cy="8" r="1.5" fill={color} />
          <circle cx="8" cy="24" r="1.2" fill={color} />
          <circle cx="26" cy="24" r="1" fill={color} />
        </svg>
      );
    case "drop":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <path d="M16 5 C16 5, 8 16, 8 21 C8 25.4, 11.6 29, 16 29 C20.4 29, 24 25.4, 24 21 C24 16, 16 5, 16 5 Z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
          <path d="M12 23 C12.5 25, 14 26.5, 16 27" stroke={color} strokeWidth="1.4"
            strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <path d="M20 6 C15 6, 7 11, 7 18 C7 23.5, 11.5 28, 17 28 C22.5 28, 27 23.5, 27 18 C27 17, 26.8 16, 26.5 15 C24 17, 20.5 18, 17 17 C13.5 16, 11 13.5, 11 10 C11 8, 12 6.5, 13.5 5.5 C15.5 5.8, 18 5.5, 20 6 Z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
          <circle cx="22" cy="11" r="1.2" fill={color} />
          <circle cx="25" cy="7" r="0.8" fill={color} />
        </svg>
      );
    case "circle":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" stroke={color} strokeWidth="1.8" fill="none" />
          <path d="M11 20 Q16 17, 21 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="14" r="1.5" fill={color} />
          <circle cx="20" cy="14" r="1.5" fill={color} />
          <path d="M11 10 L9 7 M21 10 L23 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
          <path d="M16 28 C16 28, 16 18, 16 14 C16 10, 20 5, 26 5 C26 5, 26 16, 20 21 C17 23, 16 28, 16 28 Z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
          <path d="M16 14 C16 14, 12 10, 8 9 C8 9, 8 17, 13 21 C14.5 22, 16 25, 16 28"
            stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
          <path d="M16 28 L16 16" stroke={color} strokeWidth="1.3" strokeDasharray="2 3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Variation 1: Serif Journal ────────────────────────────────────────────────
function VariantJournal({ onSelect }: { onSelect: (e: (typeof emotions)[0]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FAF7F2", fontFamily: "'Fraunces', serif" }}
    >
      <div className="px-7 pt-10 pb-6 flex items-start gap-4">
        <button onClick={() => navigate(-1)} style={{ marginTop: 3 }}>
          <ArrowLeft size={18} style={{ color: "#8C7B66" }} />
        </button>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.16em", color: "#B5A08A", textTransform: "uppercase", marginBottom: 4 }}>
            right now, i feel
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 300, color: "#3D3228", lineHeight: 1.1, fontStyle: "italic" }}>
            what's stirring inside?
          </h1>
        </div>
      </div>

      <div className="flex-1 px-7 pb-10 space-y-2">
        {emotions.map((e, i) => {
          const isSelected = selected === e.name;
          return (
            <motion.button
              key={e.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { setSelected(e.name); setTimeout(() => onSelect(e), 400); }}
              className="w-full flex items-center gap-5 py-4"
              style={{
                borderBottom: "1px solid",
                borderColor: isSelected ? e.hex : "rgba(180,160,130,0.18)",
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 40,
                  borderRadius: 2,
                  background: isSelected ? e.hex : "rgba(180,160,130,0.25)",
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              />
              <div style={{ flexShrink: 0 }}>
                <MoodSVG icon={e.icon} color={isSelected ? e.hex : "#C4B09A"} size={28} />
              </div>
              <div className="text-left flex-1">
                <p style={{
                  fontSize: 20,
                  fontWeight: 300,
                  color: isSelected ? e.hex : "#3D3228",
                  fontStyle: "italic",
                  transition: "color 0.3s",
                }}>
                  {e.name}
                </p>
                <p style={{ fontSize: 12, color: "#B5A08A", letterSpacing: "0.04em", marginTop: 1, fontFamily: "'Fraunces', serif", fontStyle: "normal", fontWeight: 300 }}>
                  {e.label}
                </p>
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: e.hex, flexShrink: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="px-7 pb-8">
        <p style={{ fontSize: 12, color: "#C4B09A", fontStyle: "italic", letterSpacing: "0.04em" }}>
          "naming what you feel is the first act of care."
        </p>
      </div>
    </div>
  );
}

// ─── Variation 2: Grid Cards ──────────────────────────────────────────────────
function VariantGrid({ onSelect }: { onSelect: (e: (typeof emotions)[0]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F5F3EF", fontFamily: "'Fraunces', serif" }}
    >
      <div className="px-6 pt-10 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={18} style={{ color: "#9A8E82" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#2A2520", letterSpacing: "-0.02em" }}>
            how are you feeling?
          </h1>
          <p style={{ fontSize: 12, color: "#9A8E82", marginTop: 2 }}>tap to choose your state</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {emotions.map((e, i) => {
            const isSelected = selected === e.name;
            return (
              <motion.button
                key={e.name}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelected(e.name); setTimeout(() => onSelect(e), 400); }}
                className="rounded-3xl p-5 flex flex-col items-start gap-3 text-left transition-all"
                style={{
                  background: isSelected ? e.hex : "#FFFFFF",
                  boxShadow: isSelected
                    ? `0 8px 28px ${e.hex}40`
                    : "0 1px 6px rgba(0,0,0,0.06)",
                  border: "1px solid",
                  borderColor: isSelected ? e.hex : "rgba(0,0,0,0.06)",
                  transition: "all 0.3s",
                  minHeight: 140,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isSelected ? "rgba(255,255,255,0.25)" : e.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoodSVG icon={e.icon} color={isSelected ? "#fff" : e.hex} size={24} />
                </div>
                <div>
                  <p style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: isSelected ? "#fff" : "#2A2520",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}>
                    {e.name}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: isSelected ? "rgba(255,255,255,0.7)" : "#9A8E82",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}>
                    {e.label}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Variation 3: Typographic Flow ────────────────────────────────────────────
function VariantTypo({ onSelect }: { onSelect: (e: (typeof emotions)[0]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#FFFCF7", fontFamily: "'Fraunces', serif" }}
    >
      {/* Colored stripe top */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected}
            initial={{ height: 0 }}
            animate={{ height: 6 }}
            exit={{ height: 0 }}
            style={{ background: emotions.find(e => e.name === selected)?.hex ?? "transparent" }}
          />
        )}
      </AnimatePresence>

      <div className="px-8 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={18} style={{ color: "#B0A090" }} />
        </button>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#B0A090", textTransform: "uppercase" }}>
          name the feeling
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-1">
        {emotions.map((e, i) => {
          const isSelected = selected === e.name;
          return (
            <motion.button
              key={e.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => { setSelected(e.name); setTimeout(() => onSelect(e), 450); }}
              className="flex items-center gap-4 py-3 text-left w-full group"
            >
              <div
                style={{
                  flexShrink: 0,
                  opacity: isSelected ? 1 : 0.35,
                  transition: "opacity 0.3s",
                }}
              >
                <MoodSVG icon={e.icon} color={isSelected ? e.hex : "#8A7A6A"} size={22} />
              </div>
              <div className="flex-1">
                <span style={{
                  fontSize: isSelected ? 36 : 30,
                  fontWeight: 400,
                  color: isSelected ? e.hex : "#2E2620",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  fontStyle: isSelected ? "italic" : "normal",
                  transition: "all 0.3s",
                }}>
                  {e.name}
                </span>
              </div>
              <span style={{
                fontSize: 11,
                color: isSelected ? e.hex : "transparent",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "'Fraunces', serif",
                fontStyle: "normal",
                transition: "color 0.3s",
                flexShrink: 0,
              }}>
                select
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="px-8 pb-8">
        <div style={{ height: 1, background: "rgba(180,155,120,0.2)", marginBottom: 16 }} />
        <p style={{ fontSize: 11, color: "#C4B09A", letterSpacing: "0.04em", fontFamily: "'Fraunces', serif" }}>
          labeling emotion reduces craving by up to 50%
        </p>
      </div>
    </div>
  );
}

// ─── Variation 4: Botanical Pills ─────────────────────────────────────────────
function VariantBotanical({ onSelect }: { onSelect: (e: (typeof emotions)[0]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F0EDE6", fontFamily: "'Fraunces', serif" }}
    >
      <div className="px-6 pt-10 pb-8 flex items-start gap-4">
        <button onClick={() => navigate(-1)} style={{ marginTop: 4 }}>
          <ArrowLeft size={18} style={{ color: "#9C8B75" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "#2A251E", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            What are you<br />
            <span style={{ fontStyle: "italic", color: "#7C6A55" }}>carrying right now?</span>
          </h1>
          <p style={{ fontSize: 12, color: "#A69880", marginTop: 8, fontFamily: "'Fraunces', serif", fontWeight: 300, letterSpacing: "0.02em" }}>
            Choose the feeling that fits closest
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10">
        <div className="space-y-3">
          {emotions.map((e, i) => {
            const isSelected = selected === e.name;
            return (
              <motion.button
                key={e.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setSelected(e.name); setTimeout(() => onSelect(e), 400); }}
                className="w-full rounded-2xl flex items-center gap-4 transition-all"
                style={{
                  padding: "14px 18px",
                  background: isSelected ? e.hex : "rgba(255,252,248,0.8)",
                  border: "1px solid",
                  borderColor: isSelected ? e.hex : "rgba(180,160,130,0.25)",
                  boxShadow: isSelected ? `0 6px 24px ${e.hex}35` : "none",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: isSelected ? "rgba(255,255,255,0.22)" : e.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MoodSVG icon={e.icon} color={isSelected ? "#fff" : e.hex} size={26} />
                </div>
                <div className="text-left flex-1">
                  <p style={{
                    fontSize: 17,
                    fontWeight: 400,
                    color: isSelected ? "#fff" : "#2A251E",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}>
                    {e.name}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: isSelected ? "rgba(255,255,255,0.72)" : "#A69880",
                    marginTop: 2,
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                  }}>
                    {e.label}
                  </p>
                </div>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "1.5px solid",
                  borderColor: isSelected ? "rgba(255,255,255,0.6)" : "rgba(180,160,130,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s",
                }}>
                  {isSelected && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Variation 5: Minimal Dot ─────────────────────────────────────────────────
function VariantMinimal({ onSelect }: { onSelect: (e: (typeof emotions)[0]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeColor = selected
    ? emotions.find(e => e.name === selected)?.hex
    : undefined;

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      style={{
        background: activeColor ? `${activeColor}12` : "#FAFAF8",
        fontFamily: "'Fraunces', serif",
        transition: "background 0.5s",
      }}
    >
      <div className="px-6 pt-10 pb-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={18} style={{ color: activeColor ?? "#A09285" }} />
        </button>
        <p style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          color: activeColor ?? "#A09285",
          textTransform: "uppercase",
          transition: "color 0.4s",
        }}>
          mood check
        </p>
        <div style={{ width: 18 }} />
      </div>

      <div className="px-8 mb-8">
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: activeColor ?? "#1E1A16",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          transition: "color 0.4s",
        }}>
          {selected
            ? emotions.find(e => e.name === selected)?.label ?? "feeling..."
            : "what are you\nfeeling?"}
        </h1>
      </div>

      <div className="flex-1 px-8 pb-10">
        <div className="grid grid-cols-3 gap-4">
          {emotions.map((e, i) => {
            const isSelected = selected === e.name;
            const isHovered = hovered === e.name;
            return (
              <motion.button
                key={e.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setSelected(isSelected ? null : e.name); if (!isSelected) setTimeout(() => onSelect(e), 450); }}
                onMouseEnter={() => setHovered(e.name)}
                onMouseLeave={() => setHovered(null)}
                className="flex flex-col items-center gap-2.5 py-5 rounded-2xl transition-all"
                style={{
                  background: isSelected ? e.hex : isHovered ? `${e.hex}18` : "rgba(255,255,255,0.6)",
                  border: "1.5px solid",
                  borderColor: isSelected ? e.hex : `${e.hex}30`,
                  boxShadow: isSelected ? `0 8px 24px ${e.hex}38` : "none",
                  transition: "all 0.3s",
                }}
              >
                <MoodSVG icon={e.icon} color={isSelected ? "#fff" : e.hex} size={28} />
                <div>
                  <p style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isSelected ? "#fff" : "#2A2520",
                    textAlign: "center",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}>
                    {e.name.split(" ")[0]}
                  </p>
                  <p style={{
                    fontSize: 9,
                    color: isSelected ? "rgba(255,255,255,0.65)" : "#A09285",
                    textAlign: "center",
                    marginTop: 2,
                    letterSpacing: "0.02em",
                  }}>
                    {e.name.split(" ").slice(1).join(" ")}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-1">
          <div style={{ width: 32, height: 1, background: activeColor ? `${activeColor}60` : "rgba(180,160,130,0.25)" }} />
          <p style={{
            fontSize: 11,
            color: activeColor ?? "#B0A090",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 4,
            transition: "color 0.4s",
          }}>
            {selected ? "feeling selected" : "choose one"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Wrapper with variant switcher ────────────────────────────────────────
const VARIANTS = [
  { label: "Journal", id: "journal" },
  { label: "Cards", id: "grid" },
  { label: "Type", id: "typo" },
  { label: "Botanical", id: "botanical" },
  { label: "Minimal", id: "minimal" },
];

export function EmotionSelectVariations() {
  const navigate = useNavigate();
  const [activeVariant, setActiveVariant] = useState("journal");

  const handleSelect = (emotion: (typeof emotions)[0]) => {
    localStorage.setItem("currentEmotion", JSON.stringify(emotion));
    navigate("/draw");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F4EE" }}>
      {/* Variant picker tab bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-1 px-4 py-3 overflow-x-auto"
        style={{
          background: "rgba(247,244,238,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(180,160,130,0.16)",
        }}
      >
        <span style={{ fontSize: 10, color: "#B0A090", letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 6, whiteSpace: "nowrap", fontFamily: "'Fraunces', serif" }}>
          variant:
        </span>
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVariant(v.id)}
            className="px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
            style={{
              background: activeVariant === v.id ? "#3D3228" : "transparent",
              color: activeVariant === v.id ? "#FAF7F2" : "#9A8E82",
              fontSize: 12,
              fontFamily: "'Fraunces', serif",
              letterSpacing: "0.02em",
              border: "1px solid",
              borderColor: activeVariant === v.id ? "#3D3228" : "rgba(180,160,130,0.3)",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Variant content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVariant}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeVariant === "journal" && <VariantJournal onSelect={handleSelect} />}
            {activeVariant === "grid" && <VariantGrid onSelect={handleSelect} />}
            {activeVariant === "typo" && <VariantTypo onSelect={handleSelect} />}
            {activeVariant === "botanical" && <VariantBotanical onSelect={handleSelect} />}
            {activeVariant === "minimal" && <VariantMinimal onSelect={handleSelect} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
