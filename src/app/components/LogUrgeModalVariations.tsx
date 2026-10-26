import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  X,
  Play,
  Pause,
  Mic,
  MicOff,
} from "lucide-react";
import { useNavigate } from "react-router";
import imgPaperTexture from "../../imports/watercolor_paper_texture.jpeg";

// ─── Font tokens ───────────────────────────────────────────────────────────────
const SLAB = "'Fraunces', serif";
const MONO = "'Fraunces', serif";
const SPACE = "'Fraunces', serif";

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMOTIONS = [
  {
    name: "Stressed",
    hex: "#0B5D34",
    desc: "tense, overwhelmed",
    icon: "wave",
  },
  {
    name: "FOMO",
    hex: "#5B8FD4",
    desc: "missing out, anxious",
    icon: "burst",
  },
  {
    name: "Craving",
    hex: "#D4708A",
    desc: "desire, longing",
    icon: "flame",
  },
  {
    name: "Bored",
    hex: "#D97706",
    desc: "restless, flat",
    icon: "flatline",
  },
  {
    name: "Excited",
    hex: "#E07B39",
    desc: "hyped, impulsive",
    icon: "lightning",
  },
  {
    name: "Intentional",
    hex: "#4A7A6A",
    desc: "grounded, aware",
    icon: "compass",
  },
];

const FOR_OPTIONS = [
  { label: "Myself", icon: "self" },
  { label: "Someone else", icon: "other" },
  { label: "Future me", icon: "future" },
];

// ─── SVG icon system ──────────────────────────────────────────────────────────
function EmotionIcon({
  icon,
  color,
  size = 20,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const s = size;
  const sw = size < 18 ? 1.4 : 1.7;
  switch (icon) {
    case "wave":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M2 8 C4.5 5.5, 7.5 5.5, 10 8 C12.5 10.5, 15.5 10.5, 18 8 C20.5 5.5, 22 5.5, 22 5.5"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2 13 C4.5 10.5, 7.5 10.5, 10 13 C12.5 15.5, 15.5 15.5, 18 13 C20.5 10.5, 22 10.5, 22 10.5"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2 18 C4.5 15.5, 7.5 15.5, 10 18 C12.5 20.5, 15.5 20.5, 18 18"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "burst":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="6"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="18"
            x2="12"
            y2="22"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="12"
            x2="6"
            y2="12"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="18"
            y1="12"
            x2="22"
            y2="12"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="4.9"
            y1="4.9"
            x2="7.8"
            y2="7.8"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="16.2"
            y1="16.2"
            x2="19.1"
            y2="19.1"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="19.1"
            y1="4.9"
            x2="16.2"
            y2="7.8"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="7.8"
            y1="16.2"
            x2="4.9"
            y2="19.1"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "flame":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 22 C8 22, 5 19, 5 15 C5 11, 8 9, 9 7 C9 7, 9 10, 11 11 C11 8, 13 5, 13 3 C13 3, 19 7, 19 15 C19 19, 16 22, 12 22Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 22 C10.5 22, 9.5 20.5, 9.5 19 C9.5 17.5, 10.5 17, 12 16.5 C13.5 17, 14.5 17.5, 14.5 19 C14.5 20.5, 13.5 22, 12 22Z"
            stroke={color}
            strokeWidth={sw * 0.8}
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
      );
    case "flatline":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <line
            x1="3"
            y1="8"
            x2="21"
            y2="8"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="13"
            x2="21"
            y2="13"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="18"
            x2="14"
            y2="18"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "drop":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 3 C12 3, 5 12, 5 16.5 C5 20, 8.1 23, 12 23 C15.9 23, 19 20, 19 16.5 C19 12, 12 3, 12 3Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M9 18.5 C9.4 20.2, 10.5 21.5, 12 22"
            stroke={color}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
        </svg>
      );
    case "lightning":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M13 2 L6 13 H12 L11 22 L18 11 H12 Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case "compass":
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth={sw}
            fill="none"
          />
          <path
            d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12"
            stroke={color}
            strokeWidth={sw * 0.7}
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <path
            d="M12 12 L15 9"
            stroke={color}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6L5 9L10 3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Polaroid photo strip ─────────────────────────────────────────────────────
interface PolaroidPhoto {
  id: number;
  src: string;
  tilt: number;
}
function usePolaroids() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height *= MAX_SIZE / width));
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width *= MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          setPhotos((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              src: dataUrl,
              tilt: (Math.random() - 0.5) * 8,
            },
          ]);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }
  return {
    photos,
    fileInputRef,
    handleFiles,
    removePhoto: (id: number) =>
      setPhotos((p) => p.filter((x) => x.id !== id)),
    openPicker: () => fileInputRef.current?.click(),
  };
}

// ─── Voice note widget ────────────────────────────────────────────────────────
function VoiceWidget({
  voiceNote,
  setVoiceNote,
  accentColor,
}: {
  voiceNote: string;
  setVoiceNote: (v: string) => void;
  accentColor: string;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) =>
          chunksRef.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });
          const reader = new FileReader();
          reader.onload = (ev) =>
            setVoiceNote(ev.target?.result as string);
          reader.readAsDataURL(blob);
          stream.getTracks().forEach((t) => t.stop());
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Recording failed", e);
        alert("Microphone access denied or unavailable.");
      }
    }
  }

  function togglePlay() {
    if (!voiceNote) return;
    if (!audioRef.current)
      audioRef.current = new Audio(voiceNote);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }

  if (voiceNote) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-[4px] px-[8px] py-[7px] rounded-[14px] transition-all"
        style={{
          background: "rgba(60,50,40,0.06)",
          minWidth: 80,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: accentColor }}
          >
            {isPlaying ? (
              <Pause
                className="w-2.5 h-2.5 text-white"
                fill="white"
              />
            ) : (
              <Play
                className="w-2.5 h-2.5 text-white"
                fill="white"
              />
            )}
          </button>
          <button onClick={() => setVoiceNote("")}>
            <X className="w-3 h-3 text-[#1A2420] opacity-50" />
          </button>
        </div>
        <span
          style={{
            fontFamily: SPACE,
            fontSize: 7,
            textTransform: "none",
            color: "#1C2E2A",
            fontWeight: 500,
            lineHeight: "10.5px",
          }}
        >
          {isPlaying ? "Playing..." : "Voice note"}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleRecording}
      className="flex flex-col items-center justify-center gap-[4px] px-[13px] py-[7px] rounded-[14px] transition-all"
      style={{
        background: isRecording
          ? "rgba(192,70,58,0.1)"
          : "rgba(60,50,40,0.06)",
        minWidth: 80,
      }}
    >
      {isRecording ? (
        <MicOff
          className="w-[20px] h-[20px]"
          style={{ color: "#C0463A" }}
          strokeWidth={1.25}
        />
      ) : (
        <Mic
          className="w-[20px] h-[20px]"
          style={{ color: "#1C2E2A" }}
          strokeWidth={1.25}
        />
      )}
      <span
        style={{
          fontFamily: SPACE,
          fontSize: 7,
          textTransform: "none",
          color: isRecording ? "#C0463A" : "#1C2E2A",
          fontWeight: 500,
          lineHeight: "10.5px",
        }}
      >
        {isRecording ? "Stop record" : "Voice note"}
      </span>
    </button>
  );
}

// ─── Shared form state hook ───────────────────────────────────────────────────
function useFormState() {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  // Allow multiple selections for prototyping multi-select behavior seen in screenshot
  const [emotions, setEmotions] = useState<string[]>([
    "Stressed",
  ]);
  const [forOpt, setForOpt] = useState(FOR_OPTIONS[0].label);
  const [journal, setJournal] = useState("");
  const [voiceNote, setVoiceNote] = useState("");
  return {
    item,
    setItem,
    amount,
    setAmount,
    emotions,
    setEmotions,
    forOpt,
    setForOpt,
    journal,
    setJournal,
    voiceNote,
    setVoiceNote,
  };
}

// ─── Real week + cumulative entry helpers ────────────────────────────────
function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

let cachedWeekEntryLabel = "";
let cachedWeekEntryLabelTime = 0;
function getWeekEntryLabel(): string {
  const now = Date.now();
  if (now - cachedWeekEntryLabelTime < 2000 && cachedWeekEntryLabel) {
    return cachedWeekEntryLabel;
  }
  const week = getISOWeek(new Date());
  const bd = (() => { try { return JSON.parse(localStorage.getItem("bloomData") || "{}"); } catch { return {}; } })();
  const total: number = bd.totalEntries ?? ((() => { try { return JSON.parse(localStorage.getItem("gardenFlowers") || "[]").length; } catch { return 0; } })());
  cachedWeekEntryLabel = `Week ${week} — Entry No. ${total + 1}`;
  cachedWeekEntryLabelTime = now;
  return cachedWeekEntryLabel;
}

// ─── Variant: LEDGER ────────────────────────────────────────────────────
function VariantLedger({
  onSubmit,
  onClose,
  polaroids,
}: {
  onSubmit: (s: ReturnType<typeof useFormState>) => void;
  onClose: () => void;
  polaroids: ReturnType<typeof usePolaroids>;
}) {
  const state = useFormState();
  const {
    item,
    setItem,
    amount,
    setAmount,
    emotions,
    setEmotions,
    forOpt,
    setForOpt,
    journal,
    setJournal,
    voiceNote,
    setVoiceNote,
  } = state;
  const primaryEmotion =
    emotions.length > 0
      ? EMOTIONS.find((e) => e.name === emotions[0])
      : EMOTIONS[0];
  const BG = "#FAFAF7";
  const INK = "#1A2420";
  const RULE = "rgba(11,93,52,0.15)";
  const MUTED = "#1C2E2A";

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-auto max-h-[85vh] relative rounded-[inherit] overflow-hidden w-full">
      {/* Watercolor paper texture — solid background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0 rounded-[inherit] overflow-hidden">
        <img
          src={imgPaperTexture}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 1 }}
        />
        {/* Subtle warm tint so ink colors read well against paper */}
        <div className="absolute inset-0" style={{ background: "rgba(252,250,245,0.18)" }} />
      </div>

      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-14 pb-1 relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 8,
              letterSpacing: "1.6px",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {getWeekEntryLabel()}
          </p>
          <h2
            style={{
              fontFamily: SLAB,
              fontSize: 26,
              fontWeight: 400,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.39px",
            }}
          >
            {today}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full mt-1 flex-shrink-0"
          style={{
            background: "rgba(60,50,40,0.07)",
            border: `1px solid ${RULE}`,
          }}
        >
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 relative z-10">
        {/* Photos — only shown when photos exist */}
        {polaroids.photos.length > 0 && (
          <div
            className="pb-4"
            style={{ borderBottom: `1px solid ${RULE}` }}
          >
            <div
              className="flex flex-wrap items-end pt-3 pb-2"
              style={{ paddingBottom: 16 }}
            >
              {polaroids.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative flex-shrink-0"
                  style={{
                    transform: `rotate(${photo.tilt}deg)`,
                    filter:
                      "drop-shadow(0 3px 8px rgba(40,30,20,0.18))",
                    marginLeft: index > 0 ? -12 : 0,
                    zIndex: index,
                  }}
                >
                  <div
                    style={{
                      background: "#FFFDF8",
                      padding: "6px 6px 18px 6px",
                      borderRadius: "2px",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                    }}
                  >
                    <img
                      src={photo.src}
                      alt=""
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      polaroids.removePhoto(photo.id)
                    }
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: INK }}
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <input
          ref={polaroids.fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={polaroids.handleFiles}
        />

        {/* I want to buy */}
        <div
          className="relative pt-[12px] pb-[12px]"
          style={{ borderBottom: `1px solid ${RULE}` }}
        >
          <div className="pr-[100px]">
            <p
              style={{
                fontFamily: SPACE,
                fontSize: 8,
                letterSpacing: "1.28px",
                color: MUTED,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              i want to buy
            </p>
            <input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="new headphones…"
              className="w-full bg-transparent outline-none placeholder:text-[#1a242080]"
              style={{
                fontFamily: SLAB,
                fontSize: 20,
                color: INK,
                lineHeight: "1.3",
              }}
            />
          </div>
          <button
            onClick={polaroids.openPicker}
            className="absolute right-0 top-[16px] flex flex-col items-center justify-center gap-[4px] px-[13px] py-[7px] rounded-[14px] transition-all"
            style={{
              background: "rgba(60,50,40,0.06)",
              minWidth: 80,
            }}
          >
            <Camera
              className="w-[20px] h-[20px]"
              style={{ color: MUTED }}
              strokeWidth={1.25}
            />
            <span
              style={{
                fontFamily: SPACE,
                fontSize: 7,
                textTransform: "none",
                color: MUTED,
                fontWeight: 500,
                lineHeight: "10.5px",
              }}
            >
              Upload image
            </span>
          </button>
        </div>

        {/* It costs */}
        <div
          className="pt-4 pb-2"
          style={{ borderBottom: `1px solid ${RULE}` }}
        >
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 8,
              letterSpacing: "1.28px",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            it costs
          </p>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: SLAB,
                fontSize: 20,
                color: MUTED,
              }}
            >
              $
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              type="number"
              className="flex-1 bg-transparent outline-none placeholder:text-[#1a242080]"
              style={{
                fontFamily: SLAB,
                fontSize: 20,
                color: INK,
              }}
            />
          </div>
        </div>

        {/* What's stirring */}
        <div
          className="pt-4 pb-4"
          style={{ borderBottom: `1px solid ${RULE}` }}
        >
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 8,
              letterSpacing: "1.28px",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            what's stirring?
          </p>

          <div className="grid grid-cols-3 gap-y-[6px] gap-x-2">
            {EMOTIONS.map((e) => {
              const active = emotions.includes(e.name);
              return (
                <button
                  key={e.name}
                  onClick={() => {
                    if (active)
                      setEmotions(
                        emotions.filter((em) => em !== e.name),
                      );
                    else setEmotions([...emotions, e.name]);
                  }}
                  className="flex items-center gap-2 py-1.5"
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-[3px] transition-colors"
                    style={{
                      width: 14,
                      height: 14,
                      background: active
                        ? e.hex
                        : "transparent",
                      border: active
                        ? "none"
                        : `1px solid rgba(107,96,88,0.3)`,
                    }}
                  >
                    {active && <CheckIcon />}
                  </div>
                  <EmotionIcon
                    icon={e.icon}
                    color={active ? e.hex : "#6b6058"}
                    size={14}
                  />
                  <span
                    style={{
                      fontFamily: SPACE,
                      fontSize: 10,
                      letterSpacing: "0.225px",
                      fontWeight: active ? 600 : 500,
                      color: active ? e.hex : "#6b6058",
                      lineHeight: "12px",
                    }}
                  >
                    {e.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buying for */}
        <div
          className="pt-4 pb-4"
          style={{ borderBottom: `1px solid ${RULE}` }}
        >
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 8,
              letterSpacing: "1.28px",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            buying for
          </p>
          <div className="flex gap-2">
            {FOR_OPTIONS.map((opt) => {
              const active = forOpt === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => setForOpt(opt.label)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-[12px] transition-all"
                  style={{
                    background: active ? INK : "transparent",
                    border: `1px solid ${active ? INK : "rgba(26,36,32,0.15)"}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SPACE,
                      fontSize: 9,
                      letterSpacing: "0.4px",
                      color: active ? BG : "rgba(26,36,32,0.6)",
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="pt-4 pb-2">
          <p
            style={{
              fontFamily: SPACE,
              fontSize: 8,
              letterSpacing: "1.28px",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            what's on your mind?
          </p>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="write freely here…"
            rows={2}
            className="w-full bg-transparent outline-none resize-none placeholder:text-[#1a242080]"
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: INK,
              lineHeight: 1.75,
            }}
          />
        </div>
      </div>

      <div
        className="flex-shrink-0 px-6 pb-4 pt-0 relative z-10"
        style={{ background: "transparent" }}
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSubmit(state)}
          disabled={!item || !amount}
          className="w-full py-[16px] rounded-[20px] flex items-center justify-between px-6 transition-opacity"
          style={{
            background: (item && amount) ? "rgba(26,36,32,0.9)" : "rgba(26,36,32,0.4)",
            opacity: (item && amount) ? 1 : 0.6,
          }}
        >
          <span
            style={{
              fontFamily: SPACE,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "#fcfcfc",
            }}
          >
            log it
          </span>
          <div
            className="w-[10px] h-[10px] rounded-[5px]"
            style={{
              background: primaryEmotion?.hex || "#5b8fd4",
              boxShadow: `0 0 12px ${primaryEmotion?.hex || "#5b8fd4"}`,
            }}
          />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function LogUrgeModalVariations({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const polaroids = usePolaroids();

  function handleSubmit(
    state: ReturnType<typeof useFormState>,
  ) {
    if (!state.item) return;
    const primary =
      state.emotions.length > 0
        ? EMOTIONS.find((e) => e.name === state.emotions[0])
        : EMOTIONS[0];
    localStorage.setItem(
      "currentEmotion",
      JSON.stringify(primary ?? EMOTIONS[0]),
    );
    localStorage.setItem("purchaseCost", state.amount || "0");
    localStorage.setItem("urgeItem", state.item);
    localStorage.setItem("currentWhoFor", state.forOpt);
    if (state.journal)
      localStorage.setItem("currentJournal", state.journal);
    localStorage.removeItem("currentVoiceNote");
    if (polaroids.photos.length > 0) {
      localStorage.setItem(
        "currentPhotos",
        JSON.stringify(polaroids.photos.map((p) => p.src)),
      );
    } else {
      localStorage.removeItem("currentPhotos");
    }
    onClose();
    navigate("/draw");
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{
          background: "rgba(26,22,14,0.55)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 pt-16 pointer-events-none">
        <motion.div
          key="sheet"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 34,
            stiffness: 360,
          }}
          className="pointer-events-auto relative flex justify-center w-full"
          style={{ maxWidth: 460 }}
        >
          {/* Main Modal Container */}
          <div
            className="w-full relative rounded-[12px] overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(26,22,14,0.28), 0 0 0 1px rgba(26,22,14,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <VariantLedger
              onSubmit={handleSubmit}
              onClose={onClose}
              polaroids={polaroids}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}