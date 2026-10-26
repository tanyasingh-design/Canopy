import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Zap, ArrowUpRight, ArrowDownRight, Edit2, Check, RefreshCw } from "lucide-react";

// ── Typography & Palette ──────────────────────────────────────────────────────
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";

const INK = "#1C2E2A";
const INK_SOFT = "rgba(28,46,42,0.62)";
const INK_FAINT = "rgba(28,46,42,0.12)";
const BG = "#FAFAFA";
const CARD = "#FFFFFF";
const BORDER = "rgba(28,46,42,0.08)";
const KEPT = "#2F6B5E"; // single calm accent for money kept
const SPENT = "#B5836A"; // muted clay for money spent
const EMPTY = "#EFEEEA";

// Emotion colours — used ONLY for mood visuals
const EMOTION_RGB: Record<string, [number, number, number]> = {
  Stressed: [192, 70, 58],
  Craving: [212, 134, 74],
  FOMO: [155, 114, 207],
  Bored: [212, 168, 83],
  Excited: [96, 190, 120],
  Intentional: [74, 154, 142],
  Happy: [229, 194, 83],
  Calm: [106, 181, 169],
  Neutral: [94, 148, 203],
  Anxious: [160, 115, 196],
};

function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex || typeof hex !== "string") return null;
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  return null;
}

function resolveEmotionRgb(emotion?: { name?: string; hex?: string } | string | null): [number, number, number] | null {
  if (!emotion) return null;
  const name = typeof emotion === "string" ? emotion : emotion.name || "";
  const hex = typeof emotion === "object" ? emotion.hex : undefined;

  const foundKey = Object.keys(EMOTION_RGB).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase()
  );
  if (foundKey) return EMOTION_RGB[foundKey];

  const fromHex = hexToRgb(hex);
  if (fromHex) return fromHex;

  return [106, 181, 169];
}

const rgbStr = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// ── Types ─────────────────────────────────────────────────────────────────────
type FlowerEntry = {
  id: number;
  emotion?: { name: string; hex?: string };
  amount?: number;
  laborHours?: number;
  buyingReason?: string;
  compostReason?: string;
  date: string;
  state?: "bloomed" | "wilted" | "parked";
  status?: "bought" | "let_go" | "parked";
  itemName?: string;
  category?: string;
  categories?: string[];
  whoFor?: string;
};

type DayData = {
  day: number;
  kept: number;
  spent: number;
  count: number;
  color: [number, number, number] | null;
  colors: [number, number, number][];
};

function categoryOf(f: FlowerEntry): string {
  if (Array.isArray(f.categories) && f.categories.length > 0) return f.categories[0];
  if (f.category) return f.category.split(",")[0].trim();
  return "Other";
}

function isSpent(f: FlowerEntry) {
  return f.state === "wilted" || f.status === "bought";
}

function isSameWeek(d1: Date, d2: Date) {
  const one = new Date(d1);
  const two = new Date(d2);
  one.setHours(0, 0, 0, 0);
  two.setHours(0, 0, 0, 0);
  const day1 = (one.getDay() + 6) % 7;
  const day2 = (two.getDay() + 6) % 7;
  const monday1 = new Date(one.getTime() - day1 * 86400000);
  const monday2 = new Date(two.getTime() - day2 * 86400000);
  return monday1.getTime() === monday2.getTime();
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString()}`;

// ── Card shell ────────────────────────────────────────────────────────────────
function Card({ children, pad = 20 }: { children: React.ReactNode; pad?: number }) {
  return (
    <div
      className="w-full rounded-3xl"
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 2px 12px rgba(28,46,42,0.04)",
        padding: pad,
      }}
    >
      {children}
    </div>
  );
}

function Title({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 style={{ fontFamily: HEAD, fontSize: 24, color: INK, letterSpacing: "0.4px", lineHeight: 1.1 }}>
        {children}
      </h2>
      {hint && (
        <p style={{ fontFamily: BODY, fontSize: 15, color: INK_SOFT, marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

// ── Mood gradient ─────────────────────────────────────────────────────────────
function MoodGradient({
  days,
  year,
  month,
}: {
  days: DayData[];
  year: number;
  month: number;
}) {
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayNum =
    today.getMonth() === month && today.getFullYear() === year ? today.getDate() : -1;

  function dayBg(d: DayData) {
    if (d.colors.length === 0) return "transparent";
    const cs = d.colors.length === 1 ? [d.colors[0], d.colors[0].map((v) => Math.min(255, v + 40))] : d.colors;
    return `linear-gradient(135deg, ${cs.map((c) => rgbStr(c, 0.95)).join(", ")})`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="grid grid-cols-7 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center"
              style={{ fontFamily: HEAD, fontSize: 15, color: INK_SOFT }}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {days.map((d) => {
            const has = d.colors.length > 0;
            return (
              <div key={d.day} className="flex items-center justify-center">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    background: dayBg(d),
                    color: has ? "#fff" : d.day === todayNum ? INK : INK_FAINT,
                    border: !has && d.day === todayNum ? `1.5px solid ${INK}` : "none",
                    fontFamily: HEAD,
                    fontSize: 19,
                    letterSpacing: "0.3px",
                    textShadow: has ? "0 1px 2px rgba(0,0,0,0.25)" : "none",
                  }}
                >
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Daily bars ────────────────────────────────────────────────────────────────
function DailyBars({ days }: { days: DayData[] }) {
  const max = Math.max(1, ...days.map((d) => d.kept + d.spent));
  const H = 130;
  const hasData = days.some((d) => d.kept + d.spent > 0);

  if (!hasData) {
    return (
      <p style={{ fontFamily: BODY, fontSize: 16, color: INK_SOFT, padding: "24px 0", textAlign: "center" }}>
        Nothing logged this month yet.
      </p>
    );
  }

  return (
    <div>
      <div className="grid items-end gap-[3px]" style={{ height: H, gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const keptH = (d.kept / max) * H;
          const spentH = (d.spent / max) * H;
          return (
            <div key={d.day} className="flex-1 flex flex-col justify-end" style={{ height: H }}>
              {d.spent > 0 && (
                <div style={{ height: Math.max(3, spentH), background: SPENT, borderRadius: "3px 3px 0 0" }} />
              )}
              {d.kept > 0 && (
                <div
                  style={{
                    height: Math.max(3, keptH),
                    background: KEPT,
                    borderRadius: d.spent > 0 ? 0 : "3px 3px 0 0",
                  }}
                />
              )}
              {d.kept + d.spent === 0 && <div style={{ height: 2, background: INK_FAINT }} />}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2" style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT }}>
        <span>1</span>
        <span>{Math.ceil(days.length / 2)}</span>
        <span>{days.length}</span>
      </div>
      <div className="flex gap-5 mt-4" style={{ fontFamily: BODY, fontSize: 15, color: INK }}>
        <span className="flex items-center gap-2">
          <i style={{ width: 12, height: 12, borderRadius: 4, background: KEPT, display: "inline-block" }} />
          Let go
        </span>
        <span className="flex items-center gap-2">
          <i style={{ width: 12, height: 12, borderRadius: 4, background: SPENT, display: "inline-block" }} />
          Bought
        </span>
      </div>
    </div>
  );
}

// ── Main Profile Component ─────────────────────────────────────────────────────
export function Profile() {
  const [allFlowers, setAllFlowers] = useState<FlowerEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [confirmReset, setConfirmReset] = useState(false);

  // Hourly Wage settings
  const [hourlyWage, setHourlyWage] = useState<number>(() => {
    return parseFloat(localStorage.getItem("userHourlyWage") || "500") || 500;
  });
  const [isEditingWage, setIsEditingWage] = useState(false);
  const [tempWage, setTempWage] = useState(String(hourlyWage));

  function loadFlowers() {
    try {
      const raw = localStorage.getItem("gardenFlowers");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setAllFlowers(parsed);
      }
    } catch {}
  }

  useEffect(() => {
    loadFlowers();
    window.addEventListener("garden-updated", loadFlowers);
    return () => window.removeEventListener("garden-updated", loadFlowers);
  }, []);

  function saveWage() {
    const parsed = Math.max(1, parseFloat(tempWage) || 500);
    setHourlyWage(parsed);
    localStorage.setItem("userHourlyWage", String(parsed));
    setIsEditingWage(false);
  }

  const amt = (f: FlowerEntry) => Number(f.amount) || 0;
  const now = new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const atCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setSelectedDate(d);
  }

  const monthFlowers = useMemo(
    () =>
      allFlowers.filter((f) => {
        const d = new Date(f.date);
        return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
      }),
    [allFlowers, month, year],
  );

  const stats = useMemo(() => {
    let kept = 0, spent = 0, keptN = 0, spentN = 0, planned = 0;
    monthFlowers.forEach((f) => {
      const a = amt(f);
      const emName = typeof f.emotion === "string" ? f.emotion : f.emotion?.name;
      if (emName?.toLowerCase() === "intentional") planned++;
      if (isSpent(f)) { spent += a; spentN++; }
      else { kept += a; keptN++; }
    });
    const total = monthFlowers.length;
    return { kept, spent, keptN, spentN, total, plannedPct: total ? Math.round((planned / total) * 100) : 0 };
  }, [monthFlowers]);

  const monthKeptHours = Math.round((stats.kept / hourlyWage) * 10) / 10;
  const monthSpentHours = Math.round((stats.spent / hourlyWage) * 10) / 10;

  // Weekly Labor Bar Calculations
  const thisWeekFlowers = useMemo(() => {
    const today = new Date();
    return allFlowers.filter((f) => {
      const d = new Date(f.date);
      return !isNaN(d.getTime()) && isSameWeek(d, today);
    });
  }, [allFlowers]);

  const weekKeptAmt = useMemo(
    () => thisWeekFlowers.filter((f) => !isSpent(f)).reduce((sum, f) => sum + amt(f), 0),
    [thisWeekFlowers]
  );
  const weekSpentAmt = useMemo(
    () => thisWeekFlowers.filter(isSpent).reduce((sum, f) => sum + amt(f), 0),
    [thisWeekFlowers]
  );

  const weekKeptHours = Math.round((weekKeptAmt / hourlyWage) * 10) / 10;
  const weekSpentHours = Math.round((weekSpentAmt / hourlyWage) * 10) / 10;
  const weekTotalHours = weekKeptHours + weekSpentHours || 0.01;
  const weekKeptPct = Math.min(100, Math.round((weekKeptHours / weekTotalHours) * 100));

  const days: DayData[] = useMemo(() => {
    const n = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => {
      const dayNum = i + 1;
      const df = monthFlowers.filter((f) => new Date(f.date).getDate() === dayNum);
      let kept = 0, spent = 0;
      const sum = [0, 0, 0];
      let w = 0;
      const dayColors: [number, number, number][] = [];
      df.forEach((f) => {
        const a = amt(f);
        if (isSpent(f)) spent += a;
        else kept += a;
        const c = resolveEmotionRgb(f.emotion);
        if (c) {
          sum[0] += c[0];
          sum[1] += c[1];
          sum[2] += c[2];
          w++;
          if (!dayColors.some((x) => x[0] === c[0] && x[1] === c[1] && x[2] === c[2])) dayColors.push(c);
        }
      });
      return {
        day: dayNum,
        kept,
        spent,
        count: df.length,
        colors: dayColors,
        color: w ? ([Math.round(sum[0] / w), Math.round(sum[1] / w), Math.round(sum[2] / w)] as [number, number, number]) : null,
      };
    });
  }, [monthFlowers, year, month]);

  const moodMix = useMemo(() => {
    const counts: Record<string, { count: number; rgb: [number, number, number] }> = {};
    monthFlowers.forEach((f) => {
      const e = typeof f.emotion === "string" ? f.emotion : f.emotion?.name || "Other";
      const rgb = resolveEmotionRgb(f.emotion) || [106, 181, 169];
      if (!counts[e]) counts[e] = { count: 0, rgb };
      counts[e].count += 1;
    });
    const total = Object.values(counts).reduce((s, c) => s + c.count, 0);
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        rgb: data.rgb,
        pct: total ? Math.round((data.count / total) * 100) : 0,
      }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [monthFlowers]);

  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    monthFlowers.forEach((f) => {
      const c = categoryOf(f);
      map[c] = (map[c] || 0) + amt(f);
    });
    const list = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const top = list[0]?.[1] || 1;
    return list.map(([name, total]) => ({ name, total, w: (total / top) * 100 }));
  }, [monthFlowers]);

  const monthLabel = selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const barTotal = stats.kept + stats.spent || 1;

  const timeBuckets = useMemo(() => {
    const b = [
      { label: "Morning", range: "5am–12pm", count: 0, amount: 0 },
      { label: "Afternoon", range: "12–5pm", count: 0, amount: 0 },
      { label: "Evening", range: "5–9pm", count: 0, amount: 0 },
      { label: "Late night", range: "9pm–5am", count: 0, amount: 0 },
    ];
    monthFlowers.forEach((f) => {
      const h = new Date(f.date).getHours();
      const i = h >= 5 && h < 12 ? 0 : h >= 12 && h < 17 ? 1 : h >= 17 && h < 21 ? 2 : 3;
      b[i].count++;
      b[i].amount += amt(f);
    });
    return b;
  }, [monthFlowers]);
  const peakTime = [...timeBuckets].sort((a, b) => b.count - a.count)[0];
  const maxTime = Math.max(1, ...timeBuckets.map((t) => t.count));
  const monthTotal = topCategories.reduce((s, c) => s + c.total, 0) || 1;

  function exportData() {
    const blob = new Blob([JSON.stringify(allFlowers, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bloom-canopy-data.json";
    a.click();
  }

  function resetData() {
    ["gardenFlowers", "bloomData"].forEach((k) => localStorage.removeItem(k));
    setAllFlowers([]);
    setConfirmReset(false);
  }

  const arrowBtn = "w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-transform disabled:opacity-20";

  return (
    <div className="min-h-screen flex flex-col w-full pb-36" style={{ background: BG, color: INK }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-5 flex items-center justify-between">
        <h1 style={{ fontFamily: HEAD, fontSize: 38, lineHeight: 1, color: INK, letterSpacing: "0.5px" }}>
          Profile
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftMonth(-1)} className={arrowBtn} style={{ background: "rgba(28,46,42,0.06)" }} aria-label="Previous month">
            <ChevronLeft size={20} color={INK} />
          </button>
          <span style={{ fontFamily: HEAD, fontSize: 18, minWidth: 124, textAlign: "center", color: INK }}>
            {monthLabel}
          </span>
          <button onClick={() => shiftMonth(1)} disabled={atCurrentMonth} className={arrowBtn} style={{ background: "rgba(28,46,42,0.06)" }} aria-label="Next month">
            <ChevronRight size={20} color={INK} />
          </button>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* 1 · Summary hero (money + Life-Energy Reframe) */}
        <Card pad={24}>
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: BODY, fontSize: 16, color: INK_SOFT }}>Let go this month</p>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{
                background: "rgba(47,107,94,0.12)",
                color: KEPT,
                fontFamily: BODY,
              }}
            >
              <Zap size={12} />
              {monthKeptHours}h life force saved
            </span>
          </div>

          <p style={{ fontFamily: HEAD, fontSize: 56, lineHeight: 1.05, color: KEPT, marginTop: 4 }}>
            {fmt(stats.kept)}
          </p>
          <p style={{ fontFamily: BODY, fontSize: 15, color: INK, marginTop: 4 }}>
            {stats.total} urges paused · {stats.plannedPct}% planned
          </p>

          <div className="flex w-full rounded-full overflow-hidden mt-5" style={{ height: 10, background: EMPTY }}>
            <div style={{ width: `${(stats.kept / barTotal) * 100}%`, background: KEPT }} />
            <div style={{ width: `${(stats.spent / barTotal) * 100}%`, background: SPENT }} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="p-3.5 rounded-2xl" style={{ background: "rgba(47,107,94,0.05)", border: "1px solid rgba(47,107,94,0.12)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: KEPT, fontFamily: BODY }}>
                  <ArrowUpRight size={14} /> Let go
                </span>
                <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: KEPT }}>
                  +{monthKeptHours}h
                </span>
              </div>
              <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.kept)}</p>
              <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.keptN} impulses diverted</p>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: "rgba(181,131,106,0.08)", border: "1px solid rgba(181,131,106,0.15)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SPENT, fontFamily: BODY }}>
                  <ArrowDownRight size={14} /> Bought
                </span>
                <span className="text-[11px] opacity-75" style={{ fontFamily: BODY, color: SPENT }}>
                  -{monthSpentHours}h
                </span>
              </div>
              <p style={{ fontFamily: HEAD, fontSize: 24, color: INK, marginTop: 4 }}>{fmt(stats.spent)}</p>
              <p style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>{stats.spentN} impulses purchased</p>
            </div>
          </div>
        </Card>

        {/* 2 · The Weekly Labor Bar (Life-Energy Conversion) */}
        <Card pad={22}>
          <div className="flex items-center justify-between mb-1">
            <Title hint="Hours of this week's work saved vs spent on micro-indulgences">
              Weekly labor bar
            </Title>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(28,46,42,0.06)",
                color: INK,
                fontFamily: BODY,
              }}
            >
              @ ₹{hourlyWage}/hr
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 28, color: KEPT }}>
                {weekKeptHours}h
              </span>
              <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                life force preserved
              </span>
            </div>
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 20, color: SPENT }}>
                {weekSpentHours}h
              </span>
              <span style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginLeft: 6 }}>
                traded away
              </span>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="w-full rounded-full overflow-hidden flex" style={{ height: 16, background: EMPTY }}>
            {weekKeptHours > 0 && (
              <div
                className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                style={{
                  width: `${weekKeptPct}%`,
                  background: KEPT,
                  fontFamily: HEAD,
                }}
              >
                {weekKeptPct > 15 ? `${weekKeptPct}%` : ""}
              </div>
            )}
            {weekSpentHours > 0 && (
              <div
                className="h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                style={{
                  width: `${100 - weekKeptPct}%`,
                  background: SPENT,
                  fontFamily: HEAD,
                }}
              >
                {(100 - weekKeptPct) > 15 ? `${100 - weekKeptPct}%` : ""}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(28,46,42,0.06)]" style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT }}>
            <span>This week: {fmt(weekKeptAmt)} saved</span>
            <span>{fmt(weekSpentAmt)} spent</span>
          </div>

          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "rgba(28,46,42,0.55)", lineHeight: 1.5, marginTop: 10 }}>
            {weekKeptHours >= weekSpentHours
              ? "You are successfully preserving your life force. Every paused impulse protects hours of your future time."
              : "Micro-indulgences took more labor hours than saved this week. Use the somatic drawing pause to re-engage System 2 logical evaluation."}
          </p>
        </Card>

        {/* 3 · Mood gradient */}
        <Card>
          <Title hint="Each day is coloured by what you felt">Mood this month</Title>
          <MoodGradient days={days} year={year} month={month} />
          {moodMix.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-3 mt-6">
              {moodMix.map((m) => (
                <span key={m.name} className="flex items-center gap-2" style={{ fontFamily: BODY, fontSize: 16, color: INK }}>
                  <i style={{ width: 14, height: 14, borderRadius: 5, background: rgbStr(m.rgb), display: "inline-block" }} />
                  {m.name} {m.pct}%
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* 4 · Daily money */}
        <Card>
          <Title hint="What you let go vs bought, day by day">Daily money</Title>
          <DailyBars days={days} />
        </Card>

        {/* 5 · Top categories */}
        {topCategories.length > 0 && (
          <Card>
            <Title>Top categories</Title>
            <div className="flex flex-col gap-5">
              {topCategories.map((c) => (
                <div key={c.name}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontFamily: BODY, fontSize: 17, color: INK }}>{c.name}</span>
                    <span style={{ fontFamily: HEAD, fontSize: 20, color: INK }}>{fmt(c.total)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: 8, background: EMPTY }}>
                    <div className="h-full rounded-full" style={{ width: `${c.w}%`, background: INK }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 6 · Patterns: when and what */}
        {stats.total > 0 && (
          <Card>
            <Title hint={`You want things most in the ${peakTime.label.toLowerCase()} (${peakTime.range})`}>When it happens</Title>
            <div className="flex flex-col gap-4">
              {timeBuckets.map((t) => (
                <div key={t.label}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontFamily: BODY, fontSize: 17, color: INK }}>
                      {t.label} <span style={{ fontSize: 14, color: INK_SOFT }}>{t.range}</span>
                    </span>
                    <span style={{ fontFamily: HEAD, fontSize: 18, color: INK }}>{t.count} · {fmt(t.amount)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: 8, background: EMPTY }}>
                    <div className="h-full rounded-full" style={{ width: `${(t.count / maxTime) * 100}%`, background: t === peakTime ? INK : "rgba(28,46,42,0.3)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 flex flex-col gap-3" style={{ borderTop: `1px solid ${BORDER}`, fontFamily: BODY, fontSize: 17, lineHeight: 1.5, color: INK }}>
              {topCategories[0] && (
                <p>
                  <strong>{topCategories[0].name}</strong> is where most goes: {fmt(topCategories[0].total)} ({Math.round((topCategories[0].total / monthTotal) * 100)}% of this month).
                </p>
              )}
              {moodMix[0] && (
                <p>
                  <strong>{moodMix[0].name}</strong> is your most common trigger ({moodMix[0].pct}% of moments).
                </p>
              )}
            </div>
          </Card>
        )}

        {/* 7 · Hourly Wage & Settings */}
        <Card>
          <Title hint="Calibrate your take-home rate for life-energy calculations">Hourly wage & settings</Title>
          <div className="flex flex-col gap-3.5">
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: EMPTY }}
            >
              <div>
                <p style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT }}>Take-home hourly wage</p>
                {isEditingWage ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontFamily: HEAD, fontSize: 20, color: INK }}>₹</span>
                    <input
                      type="number"
                      value={tempWage}
                      onChange={(e) => setTempWage(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg text-sm bg-white border border-gray-300 outline-none"
                      style={{ fontFamily: HEAD, fontSize: 18 }}
                      autoFocus
                    />
                    <button
                      onClick={saveWage}
                      className="p-1.5 rounded-lg text-white"
                      style={{ background: KEPT }}
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontFamily: HEAD, fontSize: 22, color: INK, marginTop: 2 }}>
                    ₹{hourlyWage}/hr
                  </p>
                )}
              </div>
              {!isEditingWage && (
                <button
                  onClick={() => {
                    setTempWage(String(hourlyWage));
                    setIsEditingWage(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  style={{
                    background: CARD,
                    color: INK,
                    fontFamily: BODY,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Edit2 size={12} />
                  Change wage
                </button>
              )}
            </div>

            <button onClick={exportData} className="w-full text-left rounded-2xl px-4 py-3" style={{ background: EMPTY, fontFamily: BODY, fontSize: 16, color: INK }}>
              Export my data
            </button>
            <button onClick={() => setConfirmReset(true)} className="w-full text-left rounded-2xl px-4 py-3" style={{ background: EMPTY, fontFamily: BODY, fontSize: 16, color: SPENT }}>
              Reset all data
            </button>
          </div>
        </Card>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: "rgba(28,46,42,0.45)" }} onClick={() => setConfirmReset(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: BG }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: HEAD, fontSize: 26, color: INK }}>Reset all data?</h3>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: INK_SOFT, marginTop: 8 }}>
              Every logged want, mood, reflection, and garden flower will be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 rounded-2xl" style={{ fontFamily: HEAD, fontSize: 17, color: INK, background: EMPTY }}>
                Cancel
              </button>
              <button onClick={resetData} className="flex-1 py-3 rounded-2xl" style={{ fontFamily: HEAD, fontSize: 17, color: "#FAFAFA", background: SPENT }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
