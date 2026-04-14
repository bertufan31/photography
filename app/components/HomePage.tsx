"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "intro" | "camera" | "ejecting" | "done";

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [showFlash, setShowFlash] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setStage("camera"), 1800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleShutter() {
    if (stage !== "camera") return;
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 550);
    setStage("ejecting");
    setTimeout(() => setStage("done"), 1400);
  }

  return (
    <main className="relative w-screen h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden select-none">
      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none fixed inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* ── INTRO TEXT ── */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{
          opacity: stage === "intro" ? 1 : 0,
          y: stage !== "intro" ? -200 : 0,
        }}
        transition={
          stage === "intro"
            ? { duration: 1.5, ease: "easeIn" }
            : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
        }
        className="absolute text-white font-black tracking-tight text-center px-6"
        style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
      >
        Photography is my life.
      </motion.h1>

      {/* ── CAMERA GROUP ── */}
      <motion.div
        initial={{ y: "110vh" }}
        animate={{ y: stage !== "intro" ? 0 : "110vh" }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="absolute flex flex-col items-center"
        style={{ bottom: "4vh" }}
      >
        {/* Hint label */}
        <AnimatePresence>
          {stage === "camera" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mb-3 flex flex-col items-center gap-1"
            >
              <p className="text-white/55 text-xs tracking-[0.22em] uppercase font-light">
                take a photo to peek inside
              </p>
              <motion.svg
                width="18" height="28" viewBox="0 0 18 28"
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                <line x1="9" y1="0" x2="9" y2="20" />
                <polyline points="3,14 9,26 15,14" />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Relative wrapper — camera body + ejected polaroid share the same stacking context */}
        <div className="relative">
          {/* Ejected polaroid — z-5 (behind camera z-10), slides out from film slot */}
          <AnimatePresence>
            {(stage === "ejecting" || stage === "done") && (
              <motion.div
                key="polaroid"
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: 248, zIndex: 5 }}
                initial={{ y: -215 }}
                animate={{ y: 8 }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <PolaroidPhoto />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow pointing at shutter button — overlays camera face */}
          <AnimatePresence>
            {stage === "camera" && (
              <motion.div
                className="absolute pointer-events-none flex flex-col items-center"
                style={{ left: 50, top: 142, zIndex: 20 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.svg
                  width="20" height="26" viewBox="0 0 20 26"
                  fill="none" stroke="rgba(255,100,100,0.85)" strokeWidth="1.8"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                >
                  <line x1="10" y1="0" x2="10" y2="18" />
                  <polyline points="3,12 10,24 17,12" />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera body — z-10, always on top of ejecting polaroid */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <PolaroidCamera onShutter={handleShutter} interactive={stage === "camera"} />
          </div>
        </div>
      </motion.div>
    </main>
  );
}

/* ─────────────────────────────────────────
   Polaroid Now — faithful recreation
───────────────────────────────────────── */
function PolaroidCamera({
  onShutter,
  interactive,
}: {
  onShutter: () => void;
  interactive: boolean;
}) {
  // Outer dims
  const W = 386;
  const H = 270;

  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      {/* ── Outer body: Polaroid Red ── */}
      <div
        className="absolute inset-0 rounded-[22px]"
        style={{
          background: "linear-gradient(160deg, #f01a2e 0%, #cc1020 100%)",
          boxShadow:
            "0 35px 90px rgba(0,0,0,0.85), 0 8px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      />

      {/* ── White face panel ── */}
      <div
        className="absolute rounded-[14px] bg-[#f9f8f7] overflow-hidden"
        style={{ top: 10, left: 10, right: 10, bottom: 44 }}
      >
        {/* Rainbow stripe */}
        <div className="absolute flex" style={{ top: 0, left: 0, right: 0, height: 8 }}>
          {["#e8192c","#FF7300","#FFD600","#00A84F","#0066B3","#7B2FA0"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {/* ── Flash unit (top-left) ── */}
        <div
          className="absolute rounded-xl overflow-hidden"
          style={{
            top: 18, left: 14, width: 116, height: 110,
            background: "linear-gradient(150deg, #d2d2d2 0%, #b0b0b0 100%)",
            border: "2.5px solid #bcbcbc",
            boxShadow:
              "inset 0 2px 5px rgba(255,255,255,0.75), inset 0 -2px 4px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 40%, transparent 65%)",
            }}
          />
          {/* Flash tube */}
          <div
            className="absolute rounded-sm"
            style={{
              bottom: 14, left: "50%", transform: "translateX(-50%)",
              width: 60, height: 7,
              background: "rgba(190,210,255,0.65)",
              border: "1px solid #a0a8c0",
              boxShadow: "0 0 6px rgba(180,200,255,0.4)",
            }}
          />
        </div>

        {/* ── Self-timer / mode button ── */}
        <div
          className="absolute rounded-full"
          style={{
            top: 18, right: 14, width: 24, height: 24,
            background: "linear-gradient(145deg, #e0e0e0, #c8c8c8)",
            border: "1.5px solid #b8b8b8",
            boxShadow: "inset 0 1px 3px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.12)",
          }}
        />

        {/* ── Lens assembly ── */}
        <LensAssembly />

        {/* ── Shutter button (red) ── */}
        <button
          onClick={onShutter}
          disabled={!interactive}
          aria-label="Take photo"
          className={`absolute rounded-full focus:outline-none transition-transform duration-100
            ${interactive ? "cursor-pointer active:scale-[0.88]" : "cursor-default"}`}
          style={{
            bottom: 16, left: 36, width: 52, height: 52,
            background: "radial-gradient(circle at 38% 30%, #ff5858 0%, #d40000 60%, #aa0000 100%)",
            boxShadow: interactive
              ? "0 5px 20px rgba(200,0,0,0.65), 0 2px 0 rgba(255,255,255,0.3) inset, 0 -2px 0 rgba(0,0,0,0.25) inset"
              : "0 3px 8px rgba(0,0,0,0.3)",
            border: "none",
          }}
        >
          {/* Glare */}
          <div
            className="absolute rounded-full bg-white/35"
            style={{ width: 16, height: 10, top: 9, left: 11 }}
          />
          {interactive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/25" />
          )}
        </button>

        {/* ── Green indicator LED ── */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: 36, left: 98, width: 7, height: 7,
            background: "#00cc55",
            boxShadow: "0 0 5px 2px rgba(0,200,80,0.5)",
          }}
        />

        {/* ── polaroid wordmark ── */}
        <div
          className="absolute font-bold italic text-[#e8192c]"
          style={{
            bottom: 12, left: 18, fontSize: 20,
            fontFamily: '"Georgia", "Times New Roman", serif',
            letterSpacing: "0.03em",
          }}
        >
          polaroid
        </div>
      </div>

      {/* ── Film ejection slot ── */}
      <div
        className="absolute bg-black rounded-sm"
        style={{
          bottom: 14, left: "50%", transform: "translateX(-50%)",
          width: 210, height: 11,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Lens — SVG with POLAROID AUTOFOCUS text ring
───────────────────────────────────────── */
function LensAssembly() {
  const S = 144; // svg size
  const cx = S / 2;

  return (
    <div
      className="absolute"
      style={{
        top: "50%", right: 24,
        transform: "translateY(-52%)",
        width: S, height: S,
        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.55))",
      }}
    >
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <defs>
          <radialGradient id="lensGlass" cx="36%" cy="33%" r="65%">
            <stop offset="0%" stopColor="#3d4f72" />
            <stop offset="40%" stopColor="#1c2b4a" />
            <stop offset="100%" stopColor="#040410" />
          </radialGradient>
          {/* text path — circle for label */}
          <path
            id="lensRing"
            d={`M ${cx},${cx} m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0`}
          />
        </defs>

        {/* Outermost black housing */}
        <circle cx={cx} cy={cx} r={cx - 1} fill="#141414" />

        {/* Thin highlight rim */}
        <circle cx={cx} cy={cx} r={cx - 1} fill="none" stroke="#333" strokeWidth="1" />

        {/* POLAROID · AUTOFOCUS · text ring */}
        <text
          fontSize="6.4"
          fill="#6a6a6a"
          letterSpacing="3.3"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="500"
        >
          <textPath href="#lensRing" startOffset="4%">
            POLAROID · AUTOFOCUS ·
          </textPath>
        </text>

        {/* Inner bezel */}
        <circle cx={cx} cy={cx} r="46" fill="#0e0e0e" />

        {/* Lens glass */}
        <circle cx={cx} cy={cx} r="40" fill="url(#lensGlass)" />

        {/* Concentric reflection rings */}
        <circle cx={cx} cy={cx} r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <circle cx={cx} cy={cx} r="27" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
        <circle cx={cx} cy={cx} r="20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {/* Primary glare */}
        <ellipse
          cx="50" cy="48"
          rx="12" ry="7.5"
          fill="rgba(255,255,255,0.22)"
          transform="rotate(-25 50 48)"
        />
        {/* Tiny secondary glare */}
        <ellipse
          cx="43" cy="57"
          rx="5" ry="3"
          fill="rgba(255,255,255,0.12)"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────
   Ejected Polaroid photo
───────────────────────────────────────── */
function PolaroidPhoto() {
  return (
    <div
      className="bg-white"
      style={{
        width: 168,
        padding: "10px 10px 34px 10px",
        boxShadow:
          "0 24px 70px rgba(0,0,0,0.9), 0 6px 18px rgba(0,0,0,0.6)",
      }}
    >
      {/* Photo area */}
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center"
        style={{ height: 148 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photographer.jpg"
          alt="Photographer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const p = e.currentTarget.parentElement;
            if (p && !p.querySelector(".fallback")) {
              const d = document.createElement("div");
              d.className = "fallback flex flex-col items-center gap-2";
              d.innerHTML = `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style="color:#777;font-size:10px;font-family:sans-serif;letter-spacing:0.06em">add photo</span>`;
              p.appendChild(d);
            }
          }}
        />
      </div>
      <p
        className="text-center text-stone-400 mt-1"
        style={{ fontSize: 9, letterSpacing: "0.06em", fontFamily: "sans-serif" }}
      >
        © photographer
      </p>
    </div>
  );
}
