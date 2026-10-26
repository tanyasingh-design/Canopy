import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const MUTED = "rgba(28,46,42,0.42)";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

const emotions = [
  { name: "Cool Blue", label: "Stress / Anxiety", hex: "#60a5fa" },
  { name: "Warm Orange", label: "Excitement / FOMO", hex: "#fb923c" },
  { name: "Deep Purple", label: "Sadness / Low mood", hex: "#c084fc" },
  { name: "Soft Pink", label: "Comfort seeking", hex: "#f472b6" },
  { name: "Bright Yellow", label: "Boredom", hex: "#facc15" },
  { name: "Forest Green", label: "Grounded / Calm", hex: "#34d399" },
];

export function EmotionSelect() {
  const navigate = useNavigate();

  const handleEmotionSelect = (emotion: typeof emotions[0]) => {
    localStorage.setItem("currentEmotion", JSON.stringify(emotion));
    navigate("/draw");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: BG, fontFamily: BODY }}
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}25` }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: TEAL }} />
        </button>
        <div>
          <h1
            style={{
              fontFamily: HEAD,
              fontSize: "22px",
              color: TEAL,
              fontWeight: 400,
            }}
          >
            How are you feeling?
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "12px", color: MUTED }}>
            Name the state you're in
          </p>
        </div>
      </div>

      {/* Emotion Grid */}
      <div className="flex-1 px-6 py-8">
        <div className="space-y-3">
          {emotions.map((emotion, index) => (
            <motion.button
              key={emotion.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleEmotionSelect(emotion)}
              className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{
                background: "#FAFAFA",
                border: "1px solid rgba(28,46,42,0.08)",
                boxShadow: "0 1px 6px rgba(28,46,42,0.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex-shrink-0"
                style={{ background: `${emotion.hex}55`, border: `2px solid ${emotion.hex}80` }}
              />
              <div className="text-left flex-1">
                <p
                  style={{
                    fontFamily: HEAD,
                    fontSize: "16px",
                    color: TEAL,
                    fontWeight: 400,
                  }}
                >
                  {emotion.name}
                </p>
                <p style={{ fontFamily: BODY, fontSize: "12px", color: MUTED }}>
                  {emotion.label}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info footer */}
      <div
        className="p-6"
        style={{
          background: `${GREEN}08`,
          borderTop: `1px solid ${GREEN}18`,
        }}
      >
        <p
          style={{
            fontFamily: BODY,
            fontSize: "12px",
            color: GREEN,
            textAlign: "center",
          }}
        >
          Labeling your emotion can reduce craving by 30–50%
        </p>
      </div>
    </div>
  );
}
