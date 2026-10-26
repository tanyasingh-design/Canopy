import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Flower2 } from "lucide-react";

const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const MUTED = "rgba(28,46,42,0.42)";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

export function Success() {
  const navigate = useNavigate();
  const [savedAmount, setSavedAmount] = useState(0);
  const [boughtAnyway, setBoughtAnyway] = useState(false);
  const [emotion, setEmotion] = useState<any>(null);
  const [drawing, setDrawing] = useState<string | null>(null);

  useEffect(() => {
    const cost = localStorage.getItem("purchaseCost");
    const savedEmotion = localStorage.getItem("currentEmotion");
    const savedDrawing = localStorage.getItem("currentDrawing");
    const bought = localStorage.getItem("boughtAnyway");

    if (cost) setSavedAmount(parseFloat(cost));
    if (savedEmotion) setEmotion(JSON.parse(savedEmotion));
    if (savedDrawing) setDrawing(savedDrawing);
    if (bought) setBoughtAnyway(bought === "true");

    return () => {
      localStorage.removeItem("purchaseCost");
      localStorage.removeItem("drawingCompleted");
      localStorage.removeItem("currentDrawing");
      localStorage.removeItem("boughtAnyway");
      localStorage.removeItem("currentPhotos");
    };
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center px-6"
      style={{ fontFamily: BODY, background: BG }}
    >
      {/* Flower animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.7, times: [0, 0.65, 1], ease: "easeOut" }}
        className="mb-8 flex items-center justify-center"
        style={{ width: 140, height: 140 }}
      >
        {drawing ? (
          <img
            src={drawing}
            alt="your flower"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: boughtAnyway
                ? "grayscale(0.7) brightness(0.8) drop-shadow(0px 6px 18px rgba(28,46,42,0.18))"
                : `drop-shadow(0px 6px 20px ${emotion?.hex ? emotion.hex + "80" : GREEN + "80"})`,
            }}
          />
        ) : (
          <Flower2
            className="w-16 h-16"
            style={{ color: boughtAnyway ? MUTED : GREEN }}
            strokeWidth={1.5}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-center mb-10"
      >
        <h1
          style={{
            fontFamily: HEAD,
            fontSize: "28px",
            color: TEAL,
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          {boughtAnyway ? "Urge Composted" : "Life Force Reclaimed"}
        </h1>
        <p
          style={{
            fontFamily: HEAD,
            fontStyle: "italic",
            fontSize: "14px",
            color: MUTED,
            lineHeight: 1.6,
          }}
        >
          {boughtAnyway
            ? "Anterior insula pain acknowledged — awareness breaks mindless autopilot."
            : "Your urge was released and secured into your Locked Savings Pot."}
        </p>

        {!boughtAnyway && savedAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 rounded-2xl px-8 py-5 inline-block"
            style={{
              background: `${GREEN}10`,
              border: `1px solid ${GREEN}25`,
              boxShadow: `0 2px 12px ${GREEN}12`,
            }}
          >
            <p
              style={{
                fontFamily: BODY,
                fontSize: "10px",
                color: MUTED,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Locked Savings Pot
            </p>
            <p
              style={{
                fontFamily: HEAD,
                fontSize: "36px",
                color: GREEN,
                fontWeight: 400,
              }}
            >
              ₹{savedAmount.toLocaleString()}
            </p>
            <p
              style={{
                fontFamily: BODY,
                fontSize: "12px",
                color: TEAL,
                marginTop: "4px",
              }}
            >
              ⚡ +{(savedAmount / (parseFloat(localStorage.getItem("userHourlyWage") || "500") || 500)).toFixed(1)}h of life force preserved
            </p>
          </motion.div>
        )}

        {emotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: emotion.hex,
              }}
            />
            <p
              style={{
                fontFamily: BODY,
                fontSize: "12px",
                color: MUTED,
              }}
            >
              you felt {emotion.name?.toLowerCase()}
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => navigate("/garden")}
          className="w-full py-4 rounded-2xl transition-all active:scale-95"
          style={{
            background: GREEN,
            color: "#FAFAFA",
            fontFamily: BODY,
            fontSize: "14px",
            letterSpacing: "0.04em",
            boxShadow: `0 4px 16px ${GREEN}40`,
          }}
        >
          visit your garden
        </button>
      </motion.div>
    </div>
  );
}
