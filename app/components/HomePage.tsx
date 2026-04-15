"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TOTAL_FRAMES = 5;
const SEQUENCE_SCROLL_HEIGHT = 3000;

const frames = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/sequence/frame-${String(i + 1).padStart(3, "0")}.png`
);

export default function HomePage() {
  const [frame, setFrame] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [pageHeight, setPageHeight] = useState(SEQUENCE_SCROLL_HEIGHT + 900);

  useEffect(() => {
    setPageHeight(SEQUENCE_SCROLL_HEIGHT + window.innerHeight);
    const t = setTimeout(() => setTextVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  // Scroll → frame index
  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / SEQUENCE_SCROLL_HEIGHT, 1);
      const next = Math.min(
        Math.floor(progress * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );
      setFrame(next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ height: pageHeight }}>

      {/* ── Full-screen sequence background ── */}
      <div className="fixed inset-0 bg-black overflow-hidden">
        {frames.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{
              opacity: i === frame ? 1 : 0,
              transition: "opacity 0.25s ease",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Top gradient so text stays readable */}
        <div
          className="absolute inset-x-0 top-0 h-64 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Text — centered, top ── */}
      <div className="fixed inset-x-0 top-0 flex justify-center pt-28 md:pt-32 pointer-events-none">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={
            textVisible
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: -16 }
          }
          transition={{ duration: 1.2 }}
        >
          {/* Line 1 – Kalnia Regular */}
          <p
            style={{
              fontFamily: "var(--font-kalnia), serif",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4.5vw, 5rem)",
              lineHeight: 1.1,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            It all starts with
          </p>

          {/* Line 2 – Kalnia Bold */}
          <p
            style={{
              fontFamily: "var(--font-kalnia), serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4.5vw, 5rem)",
              lineHeight: 1.1,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            a flash.
          </p>
        </motion.div>
      </div>

      {/* ── Scroll cue — fades after first frame change ── */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        animate={{ opacity: frame > 0 ? 0 : 0.5 }}
        transition={{ duration: 0.4 }}
      >
        <span
          style={{
            fontFamily: "var(--font-kalnia), serif",
            fontWeight: 400,
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          Scroll
        </span>
        <motion.svg
          width="16" height="22" viewBox="0 0 16 22"
          fill="none" stroke="white" strokeWidth="1.2"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <line x1="8" y1="0" x2="8" y2="16" />
          <polyline points="2,10 8,20 14,10" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
