import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import { LogUrgeSheet } from "./LogUrgeSheet";
import svgPaths from "../../imports/BloomAppVersionOne-1/svg-b5lehgk6zh";
import imgLayout from "../../imports/BloomAppVersionOne-1/aa992c3db22f73c70df4b47718d61625898f5816.png";

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const isGarden =
    location.pathname === "/" ||
    location.pathname === "/garden";
  const isProfile = location.pathname === "/profile";
  const isDrawing =
    location.pathname === "/draw" ||
    location.pathname === "/plant";

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <LogUrgeSheet onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
      <div
        className="min-h-screen flex flex-col relative items-center"
        style={{
          background: "#FAFAFA",
          fontFamily: "'Fraunces', serif",
        }}
      >
        {/* Grain overlay — sits above everything, pointer-events none */}
        <div
          className="fixed inset-0 pointer-events-none z-[100]"
          style={{
            backgroundImage: `url(${imgLayout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: 0.2,
            mixBlendMode: "multiply",
          }}
        />

        {/* Main content */}
        <div
          className="flex-1 relative z-10 pb-28 overflow-hidden w-full"
          style={{ maxWidth: 480 }}
        >
          {children}
        </div>

        {/* Floating pill nav — hidden on drawing screen */}
        <div
          className={`fixed bottom-6 z-20 flex justify-between px-4 w-full pointer-events-none${isDrawing ? " hidden" : ""}`}
          style={{ maxWidth: 480 }}
        >
          <div className="pointer-events-auto relative rounded-full shrink-0">
            <div
              aria-hidden
              className="absolute bg-[rgba(250,250,250,0.92)] inset-0 pointer-events-none rounded-full backdrop-blur-[20px]"
            />
            <div
              aria-hidden
              className="absolute border border-[rgba(28,46,42,0.12)] border-solid inset-0 pointer-events-none rounded-full shadow-[0px_8px_32px_0px_rgba(28,46,42,0.12)]"
            />
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center p-[9px] relative size-full">
              <button
                id="nav-garden-btn"
                onClick={() => navigate("/garden")}
                className="relative rounded-full shrink-0 transition-all active:scale-95"
                style={{
                  background: isGarden
                    ? "rgba(28,46,42,0.1)"
                    : "transparent",
                }}
              >
                <div className="flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
                  <div className="relative shrink-0 w-5 h-5">
                    <svg
                      className="absolute block inset-0 size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d={svgPaths.p8c26000}
                        stroke={
                          isGarden
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                      <path
                        d={svgPaths.p2ae4ac00}
                        stroke={
                          isGarden
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                      <path
                        d="M10 8.33V18.33"
                        stroke={
                          isGarden
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                      <path
                        d={svgPaths.p25454380}
                        stroke={
                          isGarden
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                      <path
                        d={svgPaths.p28242c00}
                        stroke={
                          isGarden
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "13.5px",
                      color: isGarden
                        ? "#1C2E2A"
                        : "rgba(28,46,42,0.55)",
                      fontFamily: "'Fraunces', serif",
                      letterSpacing: "0.01em",
                      fontWeight: isGarden ? 600 : 500,
                    }}
                  >
                    Garden
                  </span>
                </div>
              </button>

              <button
                id="nav-profile-btn"
                onClick={() => navigate("/profile")}
                className="relative rounded-full shrink-0 transition-all active:scale-95"
                style={{
                  background: isProfile
                    ? "rgba(28,46,42,0.1)"
                    : "transparent",
                }}
              >
                <div className="flex gap-[8px] items-center px-[16px] py-[10px] relative size-full">
                  <div className="relative shrink-0 w-5 h-5">
                    <svg
                      className="absolute block inset-0 size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d={svgPaths.p3011a580}
                        stroke={
                          isProfile
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                      <path
                        d={svgPaths.p194f4900}
                        stroke={
                          isProfile
                            ? "#1C2E2A"
                            : "rgba(28,46,42,0.45)"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.25"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "13.5px",
                      color: isProfile
                        ? "#1C2E2A"
                        : "rgba(28,46,42,0.55)",
                      fontFamily: "'Fraunces', serif",
                      letterSpacing: "0.01em",
                      fontWeight: isProfile ? 600 : 500,
                    }}
                  >
                    Profile
                  </span>
                </div>
              </button>
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0px_1px_0px_0px_rgba(250,250,250,0.55)]" />
          </div>

          <div className="pointer-events-auto flex items-center gap-[12px] h-full">
            {!isProfile && (
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("trigger-snapshot"),
                  )
                }
                className="flex items-center justify-center w-12 h-12 rounded-full transition-transform active:scale-95"
                style={{
                  background: "#FAFAFA",
                  color: "#1C2E2A",
                  boxShadow:
                    "0px 6px 5px rgba(28,46,42,0.15), 0px 0px 0px rgba(28,46,42,0.08)",
                }}
                title="Garden Snapshot"
              >
                <div className="relative shrink-0 w-5 h-5">
                  <svg
                    className="absolute block inset-0 size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d={svgPaths.p12fb4d80}
                      stroke="#1C2E2A"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.67"
                    />
                    <path
                      d={svgPaths.p2917e780}
                      stroke="#1C2E2A"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.67"
                    />
                  </svg>
                </div>
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center w-[54px] h-[54px] rounded-full transition-transform active:scale-95 hover:scale-105"
              style={{
                background: "#4DAA57",
                boxShadow:
                  "0px 6px 20px 0px rgba(77,170,87,0.35), 0px 0px 0px 0px rgba(255,255,255,0.4)",
              }}
            >
              <div className="relative shrink-0 w-6 h-6">
                <svg
                  className="absolute block inset-0 size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 12H19"
                    stroke="#FAFAFA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M12 5V19"
                    stroke="#FAFAFA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}