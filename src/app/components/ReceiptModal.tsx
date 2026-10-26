import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Flower } from "../types";
import { VoicePlayer } from "./Garden";

const TEAL = "#1C2E2A";
const GREEN = "#4DAA57";
const RED = "#D94539";
const HEAD = "'Passion One', sans-serif";
const BODY = "'Fraunces', serif";
const RULE = "#A3A3A3";

interface ReceiptModalProps {
  selectedFlower: Flower;
  onClose: () => void;
  onDelete: (id: any) => void;
  entryNumber?: number;
}

export function ReceiptModal({
  selectedFlower,
  onClose,
  onDelete,
  entryNumber,
}: ReceiptModalProps) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const paperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSaveTicket = async () => {
    if (!paperRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const pixelRatio = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
      const filter = (node: HTMLElement) => {
        if (node?.id === 'receipt-actions' || node?.id === 'receipt-close-x') {
          return false;
        }
        return true;
      };

      const opts = { cacheBust: true, pixelRatio, filter };
      
      const el = paperRef.current;
      
      // Preload images to prevent Safari from dropping them
      const images = Array.from(el.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              const done = () => resolve();
              const timeout = setTimeout(done, 4000);
              const finish = async () => {
                try {
                  if ((img as any).decode) await img.decode();
                } catch {}
                clearTimeout(timeout);
                done();
              };
              if (img.complete && img.naturalWidth > 0) {
                finish();
              } else {
                img.onload = finish;
                img.onerror = () => {
                  clearTimeout(timeout);
                  done();
                };
              }
            })
        )
      );

      // Wait a few frames for layout to completely settle
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 50)); // tiny explicit delay for mobile Safari

      // Render multiple times for Safari iOS cache quirk
      await toPng(el, opts);
      await toPng(el, opts);
      const dataUrl = await toPng(el, opts);
      
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate receipt image", err);
    } finally {
      setSaving(false);
    }
  };

  const shareOrDownload = async (dataUrl: string, filename: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Canopy',
        });
        return;
      }
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error("Share failed", err);
      if ((err as Error).name !== 'AbortError') {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.click();
      }
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    shareOrDownload(previewUrl, `canopy-receipt-${selectedFlower.id}.png`);
  };

  const zigzagClipPaper = useMemo(() => {
    const pts: string[] = ["0% 0%", "100% 0%"];
    const TEETH = 34;
    for (let i = TEETH; i >= 0; i--) {
      const xPct = ((i / TEETH) * 100).toFixed(2);
      const yVal = i % 2 === 0 ? "100%" : "calc(100% - 6px)";
      pts.push(`${xPct}% ${yVal}`);
    }
    return `polygon(${pts.join(", ")})`;
  }, []);


  const dateObj = new Date(selectedFlower.date);
  const dateStr = dateObj
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
    
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isBloomed = selectedFlower.state === "bloomed";

  // Authentic barcode pattern modeled directly after reference image
  const barcodeBars = useMemo(
    () => [
      // 1. Tall bar at start
      { w: 2.5, tall: true },
      // Group 1: 6 short bars
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },

      // 2. Tall bar
      { w: 2, tall: true },
      // Group 2: 7 short bars
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 3, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },

      // 3. Tall bar
      { w: 1.5, tall: true },
      // Group 3: 6 short bars
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },

      // 4. Tall bar
      { w: 2, tall: true },
      // Group 4: 8 short bars
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },

      // 5. Tall bar
      { w: 2, tall: true },
      // Group 5: 6 short bars
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 3, tall: false },
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },

      // 6. Tall bar (Center)
      { w: 2.5, tall: true },
      // Group 6: 7 short bars
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },

      // 7. Tall bar
      { w: 2, tall: true },
      // Group 7: 8 short bars
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 3, tall: false },
      { w: 1, tall: false },
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },

      // 8. Tall bar
      { w: 1.5, tall: true },
      // Group 8: 6 short bars
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },

      // 9. Tall bar
      { w: 2, tall: true },
      // Group 9: 7 short bars
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 3, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },

      // 10. Tall bar
      { w: 2, tall: true },
      // Group 10: 6 short bars
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },

      // 11. Tall bar
      { w: 2, tall: true },
      // Group 11: 7 short bars
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1, tall: false },
      { w: 2.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },

      // 12. Tall bar (Near right)
      { w: 2, tall: true },
      // Ending: 5 short bars — ending with a small one!
      { w: 1, tall: false },
      { w: 2, tall: false },
      { w: 1.5, tall: false },
      { w: 1, tall: false },
      { w: 1.5, tall: false },
    ],
    []
  );

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
    } else {
      pointerDownPos.current = null;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerDownPos.current && e.target === e.currentTarget) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x);
      const dy = Math.abs(e.clientY - pointerDownPos.current.y);
      if (dx < 6 && dy < 6) {
        onClose();
      }
    }
    pointerDownPos.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="fixed inset-0 z-[101] overflow-y-auto no-scrollbar flex flex-col items-center py-10 px-4"
      style={{
        background: "rgba(0,0,0,0.85)",
        overscrollBehaviorY: "contain",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        fontFamily: BODY,
      }}
    >
      {/* Center column holding paper */}
      <div 
        className="w-full max-w-[420px] flex flex-col items-center shrink-0 relative my-auto"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <motion.div
          key={`receipt-${selectedFlower.id}`}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1], // snappy slide-down printing motion
          }}
          className="relative w-full flex flex-col pointer-events-auto"
          style={{
            filter: "drop-shadow(0 20px 48px rgba(0,0,0,0.32)) drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
          }}
        >
          <div
            ref={paperRef}
            className="relative w-full flex flex-col"
            style={{
              background: "#F9F8F5",
              clipPath: zigzagClipPaper,
              WebkitClipPath: zigzagClipPaper,
              paddingBottom: "24px",
              minHeight: "400px",
              outline: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top header inside paper */}
            <div className="flex items-center justify-between pt-5 px-6 pb-2">
              <div className="flex items-center gap-2">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                <span
                  style={{
                    fontFamily: HEAD,
                    fontSize: 13,
                    letterSpacing: "0.2em",
                    color: "rgba(28,46,42,0.45)",
                  }}
                >
                  CANOPY RECEIPT{entryNumber !== undefined ? ` : ${String(entryNumber).padStart(3, '0')}` : ""}
                </span>
              </div>
              <button 
                id="receipt-close-x"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 active:scale-90"
                style={{ background: "rgba(28,46,42,0.06)" }}
              >
                <X className="w-3.5 h-3.5" style={{ color: TEAL }} />
              </button>
            </div>

            {/* CONTENT INSIDE PAPER */}
            <div className="pt-4 px-6 pb-4">
              
              {/* Optional Drawing */}
              {selectedFlower.drawing && (
                <div className="flex justify-center mb-8">
                  <img
                    src={selectedFlower.drawing}
                    alt="flower drawing"
                    style={{
                      maxHeight: 120,
                      objectFit: "contain",
                      filter: isBloomed
                        ? "drop-shadow(0px 6px 18px rgba(77,170,87,0.25))"
                        : "grayscale(1) brightness(0.65) drop-shadow(0px 6px 16px rgba(32,70,84,0.15))",
                    }}
                  />
                </div>
              )}

              {/* CURRENT STATE & STAMP */}
              <div className="flex justify-between items-start mb-4 relative">
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(28,46,42,0.45)",
                      letterSpacing: "0.15em",
                      marginBottom: 4,
                    }}
                  >
                    CURRENT STATE
                  </p>
                  <p
                    style={{
                      fontFamily: HEAD,
                      fontSize: 36,
                      color: TEAL,
                      lineHeight: 1,
                    }}
                  >
                    {selectedFlower.emotion?.name || "Unknown"}
                  </p>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 6,
                    transform: isBloomed ? "rotate(-6deg)" : "rotate(6deg)",
                    border: `1.5px solid ${isBloomed ? GREEN : RED}`,
                    color: isBloomed ? GREEN : RED,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontFamily: HEAD,
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.9,
                  }}
                >
                  {isBloomed ? "MINDFUL" : "GUILTY"}
                </div>
              </div>

              <div style={{ borderBottom: `1px dashed ${RULE}`, margin: "16px 0" }} />

              {/* Date & Time */}
              <div className="flex justify-between items-center mb-4">
                <p
                  style={{
                    fontFamily: HEAD,
                    fontSize: 14,
                    color: TEAL,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {dateStr}
                </p>
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 13,
                    color: "rgba(28,46,42,0.5)",
                  }}
                >
                  {timeStr}
                </p>
              </div>

              {/* Subject */}
              {(selectedFlower.itemName || selectedFlower.whoFor) && (
                <div className="mb-4">
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(28,46,42,0.45)",
                      letterSpacing: "0.15em",
                      marginBottom: 6,
                    }}
                  >
                    SUBJECT
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: 16, color: TEAL }}>
                    {[selectedFlower.itemName, selectedFlower.whoFor]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>
              )}

              {/* Itemized Details (Journal) */}
              {selectedFlower.journal && (
                <div className="mb-4">
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(28,46,42,0.45)",
                      letterSpacing: "0.15em",
                      marginBottom: 6,
                    }}
                  >
                    ITEMIZED DETAILS
                  </p>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 16,
                      color: TEAL,
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedFlower.journal}
                  </p>
                </div>
              )}

              {/* Item Images */}
              {selectedFlower.photos &&
                selectedFlower.photos.filter((src) => !brokenImages[src]).length > 0 && (
                <div className="mb-4">
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(28,46,42,0.45)",
                      letterSpacing: "0.15em",
                      marginBottom: 6,
                    }}
                  >
                    ITEM IMAGE
                  </p>
                  <div className="flex gap-3">
                    {selectedFlower.photos
                      .filter((src) => !brokenImages[src])
                      .map((src, i) => (
                      <div
                        key={i}
                        className="bg-white border p-1 rounded"
                        style={{ borderColor: "rgba(0,0,0,0.1)" }}
                      >
                        <img
                          src={src}
                          alt="Item"
                          className="w-16 h-16 object-cover rounded"
                          onError={() =>
                            setBrokenImages((prev) => ({
                              ...prev,
                              [src]: true,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Note */}
              {selectedFlower.voiceNote && (
                <div className="mb-4">
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(28,46,42,0.45)",
                      letterSpacing: "0.15em",
                      marginBottom: 6,
                    }}
                  >
                    VOICE NOTE
                  </p>
                  <VoicePlayer src={selectedFlower.voiceNote} />
                </div>
              )}

              <div style={{ borderBottom: `1px dashed ${RULE}`, margin: "16px 0" }} />

              {/* TOTAL AMOUNT */}
              {selectedFlower.amount > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p
                      style={{
                        fontSize: 10,
                        color: "rgba(28,46,42,0.45)",
                        letterSpacing: "0.15em",
                      }}
                    >
                      TOTAL AMOUNT
                    </p>
                    <p style={{ fontFamily: HEAD, fontSize: 32, color: TEAL }}>
                      ₹{selectedFlower.amount.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ borderBottom: `1px dashed ${RULE}`, margin: "16px 0" }} />
                </>
              )}

              {/* Barcode and Branding */}
              <div className="flex flex-col items-center mt-6 mb-4">
                {/* Full-width uneven barcode */}
                <div
                  className="w-full flex items-end justify-between h-[44px] mb-3.5 px-[10px] overflow-hidden"
                >
                  {barcodeBars.map((bar, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${bar.w}px`,
                        height: bar.tall ? "44px" : "29px",
                        backgroundColor: "#9EA29F",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                <p
                  style={{
                    fontFamily: HEAD,
                    fontStyle: "italic",
                    fontSize: 14,
                    color: "rgba(28,46,42,0.7)",
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  Thank you for checking in with yourself.
                </p>
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "rgba(28,46,42,0.45)",
                    textAlign: "center",
                  }}
                >
                  CANOPY · PAUSE BEFORE YOU PURCHASE
                </p>
              </div>

              {/* Actions */}
              <div id="receipt-actions" className="flex items-center gap-2.5 w-full mt-5">
                <button
                  onClick={() => onDelete(selectedFlower.id)}
                  className="w-[44px] h-[44px] shrink-0 flex items-center justify-center rounded-[8px] transition-transform active:scale-95"
                  style={{
                    background: "#FAF9F5",
                    border: "1px solid #DCD7CE",
                    color: "#78807A",
                  }}
                >
                  <Trash2 strokeWidth={1.5} className="w-[18px] h-[18px]" />
                </button>

                {selectedFlower.drawing && (
                  <button
                    onClick={() => {
                      shareOrDownload(selectedFlower.drawing!, `flower-${selectedFlower.id}.png`);
                    }}
                    className="flex-1 h-[44px] flex items-center justify-center rounded-[8px] transition-transform active:scale-95"
                    style={{
                      background: "#FAF9F5",
                      border: "1px solid #DCD7CE",
                      color: "#1C2E2A",
                      fontFamily: HEAD,
                      fontSize: 14.5,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SAVE SKETCH
                  </button>
                )}

                <button
                  onClick={handleSaveTicket}
                  disabled={saving}
                  className="flex-1 h-[44px] flex items-center justify-center rounded-[8px] transition-transform active:scale-95"
                  style={{
                    background: TEAL,
                    color: "#FFFFFF",
                    fontFamily: HEAD,
                    fontSize: 14.5,
                    letterSpacing: "0.08em",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "SAVING..." : "SAVE TICKET"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Safari-safe Preview Overlay */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6"
          style={{ background: "rgba(28,46,42,0.9)", backdropFilter: "blur(10px)" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-[380px] w-full"
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="self-end mb-3 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: "rgba(250,250,250,0.2)" }}
            >
              <X className="w-5 h-5" style={{ color: "#FFF" }} />
            </button>
            <img 
              src={previewUrl} 
              alt="Receipt Preview" 
              className="w-full rounded-xl mb-4 shadow-2xl"
              style={{ maxHeight: "70vh", objectFit: "contain", background: "#F9F8F5" }}
            />
            <button
              onClick={handleDownload}
              className="w-full py-4 rounded-xl flex items-center justify-center transition-transform active:scale-95"
              style={{ 
                background: GREEN, 
                color: "#FFFFFF", 
                fontFamily: HEAD, 
                fontSize: 16, 
                letterSpacing: "0.08em" 
              }}
            >
              SHARE / SAVE
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
