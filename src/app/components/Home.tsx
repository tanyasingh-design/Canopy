import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Flower2 } from "lucide-react";

const BG = "#FAFAFA";
const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const MUTED = "rgba(28,46,42,0.42)";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function WeekCalendar() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun

  // Build the current week starting from Sunday
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    return d;
  });

  // Mock: days with activity (had a bloom ritual)
  const activeDays = new Set([1, 3, 5].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    return d.toDateString();
  }));

  return (
    <div className="px-6 pt-2 pb-4">
      {/* Month label */}
      <p
        style={{
          fontFamily: HEAD,
          fontSize: "11px",
          letterSpacing: "0.12em",
          color: MUTED,
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>

      {/* Week strip */}
      <div className="flex justify-between">
        {weekDates.map((date, i) => {
          const isToday = date.toDateString() === today.toDateString();
          const hasActivity = activeDays.has(date.toDateString());
          const isPast = date < today && !isToday;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: isToday ? GREEN : MUTED,
                  textTransform: "uppercase",
                }}
              >
                {DAYS[date.getDay()]}
              </span>

              <div
                className="flex flex-col items-center justify-center rounded-full transition-all"
                style={{
                  width: 32,
                  height: 32,
                  background: isToday
                    ? GREEN
                    : "transparent",
                  boxShadow: isToday ? `0 2px 10px ${GREEN}60` : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: BODY,
                    fontSize: "13px",
                    color: isToday ? "#FAFAFA" : isPast ? MUTED : TEAL,
                    fontWeight: isToday ? 500 : 400,
                  }}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Dot for activity */}
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: hasActivity ? GREEN : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [bloomData, setBloomData] = useState({
    totalSaved: 247,
    flowersGrown: 12,
    currentStreak: 4,
  });

  useEffect(() => {
    const saved = localStorage.getItem("bloomData");
    if (saved) {
      setBloomData(JSON.parse(saved));
    }
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : "good evening";

  return (
    <div className="flex flex-col min-h-full" style={{ background: BG }}>
      {/* Top bar with greeting + savings */}
      <div className="px-6 pt-10 pb-2 flex items-start justify-between">
        <div>
          <p
            style={{
              fontFamily: BODY,
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: MUTED,
              textTransform: "lowercase",
              marginBottom: "2px",
            }}
          >
            {greeting}
          </p>
          <h1
            style={{
              fontFamily: HEAD,
              fontSize: "26px",
              color: TEAL,
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            bloom
          </h1>
        </div>

        {/* Savings pill */}
        <div
          className="flex flex-col items-end"
          style={{ paddingTop: "4px" }}
        >
          <span
            style={{
              fontFamily: HEAD,
              fontSize: "20px",
              color: GREEN,
              fontWeight: 400,
            }}
          >
            ${bloomData.totalSaved}
          </span>
          <span
            style={{
              fontFamily: BODY,
              fontSize: "10px",
              color: MUTED,
              letterSpacing: "0.06em",
            }}
          >
            saved
          </span>
        </div>
      </div>

      {/* Calendar */}
      <WeekCalendar />

      {/* Divider */}
      <div
        className="mx-6"
        style={{ height: "1px", background: "rgba(28,46,42,0.1)" }}
      />

      {/* Center bloom area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 py-10">
        {/* Soft tagline */}
        <div className="text-center">
          <p
            style={{
              fontFamily: HEAD,
              fontStyle: "italic",
              fontSize: "15px",
              color: MUTED,
              lineHeight: 1.6,
            }}
          >
            feeling the urge to buy?
          </p>
          <p
            style={{
              fontFamily: BODY,
              fontSize: "12px",
              color: MUTED,
              letterSpacing: "0.04em",
              marginTop: "4px",
            }}
          >
            take 60 seconds to bloom instead
          </p>
        </div>

        {/* Main bloom button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/emotion")}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 160,
            height: 160,
            background: `${GREEN}18`,
            boxShadow: `0 8px 32px ${GREEN}28, inset 0 1px 0 rgba(255,255,255,0.8)`,
            border: `1px solid ${GREEN}30`,
          }}
        >
          {/* Inner ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 12,
              background: `${GREEN}12`,
              border: `1px solid ${GREEN}20`,
            }}
          />
          <div className="relative flex flex-col items-center gap-2 z-10">
            <Flower2
              className="w-10 h-10"
              style={{ color: GREEN }}
              strokeWidth={1.5}
            />
            <span
              style={{
                fontFamily: BODY,
                fontSize: "11px",
                color: GREEN,
                letterSpacing: "0.1em",
                textTransform: "lowercase",
              }}
            >
              begin ritual
            </span>
          </div>
        </motion.button>

        {/* Stats row */}
        <div className="flex gap-8 pt-2">
          <div className="text-center">
            <p
              style={{
                fontFamily: HEAD,
                fontSize: "22px",
                color: TEAL,
                fontWeight: 400,
              }}
            >
              {bloomData.flowersGrown}
            </p>
            <p
              style={{
                fontFamily: BODY,
                fontSize: "10px",
                color: MUTED,
                letterSpacing: "0.06em",
              }}
            >
              flowers
            </p>
          </div>

          <div
            style={{
              width: "1px",
              background: "rgba(28,46,42,0.12)",
              alignSelf: "stretch",
            }}
          />

          <div className="text-center">
            <p
              style={{
                fontFamily: HEAD,
                fontSize: "22px",
                color: TEAL,
                fontWeight: 400,
              }}
            >
              {bloomData.currentStreak}
            </p>
            <p
              style={{
                fontFamily: BODY,
                fontSize: "10px",
                color: MUTED,
                letterSpacing: "0.06em",
              }}
            >
              day streak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
