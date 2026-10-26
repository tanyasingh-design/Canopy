import { useNavigate } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const MUTED = "rgba(28,46,42,0.42)";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

export function Reflection() {
  const navigate = useNavigate();
  const [reflection, setReflection] = useState("");
  const [purchaseCost, setPurchaseCost] = useState(0);
  const urgeImages = JSON.parse(
    localStorage.getItem("urgeImages") || "[]",
  );

  useEffect(() => {
    const cost = localStorage.getItem("purchaseCost");
    if (cost) {
      setPurchaseCost(parseFloat(cost));
    }
  }, []);

  const handleSubmit = () => {
    if (!reflection.trim()) return;

    const garden = localStorage.getItem("gardenFlowers");
    const flowers = garden ? JSON.parse(garden) : [];

    const emotion = localStorage.getItem("currentEmotion");

    flowers.push({
      id: Date.now(),
      emotion: emotion ? JSON.parse(emotion) : null,
      amount: purchaseCost,
      date: new Date().toISOString(),
      state: "wilted",
      reflection: reflection,
      images: urgeImages,
    });

    localStorage.setItem(
      "gardenFlowers",
      JSON.stringify(flowers),
    );
    localStorage.removeItem("purchaseCost");
    localStorage.removeItem("currentEmotion");
    localStorage.removeItem("urgeImages");

    navigate("/garden");
  };
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: BG, fontFamily: BODY, color: TEAL }}
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            background: `${GREEN}15`,
            border: `1px solid ${GREEN}25`,
          }}
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: TEAL }}
          />
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
            The Upcycle
          </h1>
          <p
            style={{
              fontFamily: BODY,
              fontSize: "12px",
              color: MUTED,
            }}
          >
            Compassionate accountability
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "#FAFAFA",
              border: `1px solid ${GREEN}20`,
              boxShadow: `0 2px 12px ${GREEN}10`,
            }}
          >
            <p
              style={{
                fontFamily: BODY,
                fontSize: "12px",
                color: MUTED,
                marginBottom: "4px",
              }}
            >
              You spent
            </p>
            <p
              style={{
                fontFamily: HEAD,
                fontSize: "36px",
                color: GREEN,
                fontWeight: 400,
              }}
            >
              ${purchaseCost.toFixed(2)}
            </p>
          </div>

          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: `${GREEN}08`,
              border: `1px solid ${GREEN}18`,
            }}
          >
            <p
              style={{
                fontFamily: BODY,
                fontSize: "13px",
                color: TEAL,
                textAlign: "center",
                lineHeight: 1.7,
                opacity: 0.75,
              }}
            >
              A flower has wilted in your garden. But this isn't
              failure — it's compost. Growth comes from
              understanding what happened.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <label className="block mb-3">
            <span
              style={{
                fontFamily: BODY,
                fontSize: "14px",
                color: TEAL,
                display: "block",
                marginBottom: "6px",
              }}
            >
              What emotional need did this serve?
            </span>
            <span
              style={{
                fontFamily: BODY,
                fontSize: "11px",
                color: MUTED,
              }}
            >
              Not what you bought, but what you were seeking.
            </span>
          </label>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="I was seeking comfort after a stressful meeting..."
            rows={6}
            className="w-full resize-none outline-none rounded-2xl px-4 py-3"
            style={{
              fontFamily: BODY,
              fontSize: "13px",
              color: TEAL,
              background: `${GREEN}08`,
              border: `1px solid ${GREEN}20`,
              lineHeight: "1.7",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = `${GREEN}50`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `${GREEN}20`;
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={handleSubmit}
            disabled={!reflection.trim()}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: reflection.trim()
                ? GREEN
                : `${GREEN}50`,
              color: "#FAFAFA",
              fontFamily: BODY,
              fontSize: "13px",
              letterSpacing: "0.04em",
              boxShadow: reflection.trim()
                ? `0 4px 16px ${GREEN}40`
                : "none",
              cursor: reflection.trim()
                ? "pointer"
                : "not-allowed",
            }}
          >
            <span>Turn it into compost</span>
            <Send className="w-4 h-4" />
          </button>

          <p
            className="text-center mt-4"
            style={{
              fontFamily: BODY,
              fontSize: "11px",
              color: MUTED,
            }}
          >
            Your reflection helps future you recognize patterns
          </p>
        </motion.div>
      </div>
    </div>
  );
}