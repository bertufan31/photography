"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage =
  | "intro"        // "Photography is my life" fading in
  | "camera"       // camera slides up, text pushed
  | "ejecting"     // polaroid coming out
  | "done";        // polaroid sitting below camera

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [showFlash, setShowFlash] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After intro, transition to camera stage
  useEffect(() => {
    timerRef.current = setTimeout(() => setStage("camera"), 1800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleShutter() {
    if (stage !== "camera") return;
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 600);
    setStage("ejecting");
    setTimeout(() => setStage("done"), 1300);
  }

  return (
    <main className="relative w-screen h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden select-none">

      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* ── INTRO TEXT ── */}
      <motion.h1
        key="headline"
        initial={{ opacity: 0 }}
        animate={{
          opacity: stage === "intro" ? 1 : 0,
          y: stage === "camera" || stage === "ejecting" || stage === "done" ? -160 : 0,
        }}
        transition={
          stage === "intro"
            ? { duration: 1.4, ease: "easeIn" }
            : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
        className="absolute text-white font-black tracking-tight leading-none text-center px-6"
        style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
      >
        Photography is my life.
      </motion.h1>

      {/* ── CAMERA + POLAROID STACK ── */}
      <motion.div
        key="camera-group"
        initial={{ y: "100vh" }}
        animate={{ y: stage === "camera" || stage === "ejecting" || stage === "done" ? 0 : "100vh" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute flex flex-col items-center"
        style={{ bottom: "5vh" }}
      >

        {/* Ejected polaroid */}
        <AnimatePresence>
          {(stage === "ejecting" || stage === "done") && (
            <motion.div
              key="polaroid"
              initial={{ y: 0, opacity: 0, rotate: -2 }}
              animate={{ y: 220, opacity: 1, rotate: -2 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-10"
              style={{ top: -20 }}
            >
              <PolaroidPhoto />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera body */}
        <div className="relative flex flex-col items-center">
          {/* Label above camera */}
          <AnimatePresence>
            {stage === "camera" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 flex flex-col items-center gap-2"
              >
                <p className="text-white/70 text-sm md:text-base font-light tracking-widest uppercase">
                  take a photo to peek inside
                </p>
                {/* Arrow pointing down to button */}
                <svg
                  width="24" height="36" viewBox="0 0 24 36"
                  className="text-red-400 animate-bounce"
                  fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <line x1="12" y1="0" x2="12" y2="28" />
                  <polyline points="4,20 12,32 20,20" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          <PolaroidCamera onShutter={handleShutter} interactive={stage === "camera"} />
        </div>
      </motion.div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Polaroid Camera SVG-style component
───────────────────────────────────────────── */
function PolaroidCamera({
  onShutter,
  interactive,
}: {
  onShutter: () => void;
  interactive: boolean;
}) {
  return (
    <div className="relative" style={{ width: 320, height: 220 }}>
      {/* Body */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #e8e0d4 0%, #d4c9b8 60%, #c0b49e 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      />

      {/* Film ejection slot at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-sm"
        style={{ width: 160, height: 10 }}
      />

      {/* Lens ring */}
      <div
        className="absolute rounded-full border-4 border-[#8a7a6a]"
        style={{
          width: 100, height: 100,
          top: 50, left: 50,
          background: "radial-gradient(circle at 35% 35%, #4a4a5a 0%, #1a1a2e 60%, #0d0d1a 100%)",
          boxShadow: "0 0 0 6px #6a5a4a, 0 8px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)",
        }}
      >
        {/* Lens glare */}
        <div
          className="absolute rounded-full bg-white/20"
          style={{ width: 28, height: 28, top: 12, left: 14 }}
        />
        <div
          className="absolute rounded-full bg-white/10"
          style={{ width: 12, height: 12, top: 30, left: 50 }}
        />
      </div>

      {/* Viewfinder */}
      <div
        className="absolute rounded-sm bg-black/60 border border-[#8a7a6a]"
        style={{ width: 34, height: 24, top: 18, left: 56 }}
      />

      {/* Flash unit */}
      <div
        className="absolute rounded-md"
        style={{
          width: 44, height: 32,
          top: 12, left: 180,
          background: "linear-gradient(135deg, #f0e8d8, #d8ccbc)",
          border: "2px solid #b0a090",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <div className="w-full h-full rounded-sm bg-white/30" />
      </div>

      {/* Brand strip */}
      <div
        className="absolute text-[#6a5a4a] font-bold tracking-widest uppercase"
        style={{ fontSize: 11, bottom: 48, left: 58 }}
      >
        OneShot
      </div>

      {/* Bottom panel — darker, holds shutter */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-2xl flex items-center justify-between px-6"
        style={{
          height: 48,
          background: "linear-gradient(180deg, #b8ad9e 0%, #a09080 100%)",
          borderTop: "1px solid #8a7a6a",
        }}
      >
        {/* Decorative lines */}
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1 h-4 rounded-full bg-[#8a7a6a]/50" />
          ))}
        </div>

        {/* Shutter button */}
        <button
          onClick={onShutter}
          disabled={!interactive}
          aria-label="Take photo"
          className={`relative rounded-full transition-all duration-150 focus:outline-none
            ${interactive ? "cursor-pointer active:scale-90" : "cursor-default"}`}
          style={{
            width: 36, height: 36,
            background: interactive
              ? "radial-gradient(circle at 40% 35%, #ff6b6b, #cc1111)"
              : "radial-gradient(circle at 40% 35%, #ff6b6b, #cc1111)",
            boxShadow: interactive
              ? "0 3px 10px rgba(200,0,0,0.6), 0 1px 0 rgba(255,255,255,0.3) inset"
              : "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {/* Glare */}
          <div
            className="absolute rounded-full bg-white/40"
            style={{ width: 10, height: 8, top: 5, left: 8 }}
          />
          {/* Pulse ring when interactive */}
          {interactive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
          )}
        </button>

        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1 h-4 rounded-full bg-[#8a7a6a]/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Polaroid Photo
───────────────────────────────────────────── */
function PolaroidPhoto() {
  return (
    <div
      className="bg-white shadow-2xl"
      style={{
        width: 160,
        padding: "10px 10px 30px 10px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
      }}
    >
      {/* Photo area — placeholder until real image is set */}
      <div
        className="w-full flex items-center justify-center bg-gradient-to-br from-stone-700 to-stone-900 overflow-hidden"
        style={{ height: 140 }}
      >
        {/* Swap src with photographer's real photo via CMS or /public */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photographer.jpg"
          alt="Photographer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Graceful fallback while photo isn't uploaded yet
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent && !parent.querySelector(".fallback-icon")) {
              const el = document.createElement("div");
              el.className = "fallback-icon flex flex-col items-center gap-1";
              el.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style="color:#888;font-size:10px;font-family:sans-serif">add photo</span>`;
              parent.appendChild(el);
            }
          }}
        />
      </div>
      {/* Polaroid caption strip */}
      <p
        className="text-center text-stone-500 mt-1"
        style={{ fontSize: 9, letterSpacing: "0.05em", fontFamily: "sans-serif" }}
      >
        © photographer
      </p>
    </div>
  );
}
