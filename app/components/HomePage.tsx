"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// ── Update this when more frames are added ──────────────
const TOTAL_FRAMES = 8;
const SCROLL_HEIGHT = 7000;

const FRAME_PATHS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/sequence/frame-${String(i + 1).padStart(3, "0")}.png`
);

// Word config: enter/exitAt are scroll progress (0–1)
// Staggered so each word arrives and leaves one by one
const WORDS = [
  { text: "It",     bold: false, enter: 0.02, exitAt: 0.58 },
  { text: "all",    bold: false, enter: 0.05, exitAt: 0.61 },
  { text: "starts", bold: false, enter: 0.08, exitAt: 0.64 },
  { text: "with",   bold: false, enter: 0.11, exitAt: 0.67 },
  { text: "a",      bold: true,  enter: 0.14, exitAt: 0.70 },
  { text: "flash.", bold: true,  enter: 0.17, exitAt: 0.73 },
];

// ── Single word with scroll-driven enter/exit ───────────
function AnimatedWord({
  text,
  bold,
  enter,
  exitAt,
  scrollYProgress,
}: {
  text: string;
  bold: boolean;
  enter: number;
  exitAt: number;
  scrollYProgress: MotionValue<number>;
}) {
  const GAP = 0.03;

  const opacity = useTransform(
    scrollYProgress,
    [enter, enter + GAP, exitAt, exitAt + GAP],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [enter, enter + GAP, exitAt, exitAt + GAP],
    [28, 0, 0, -28]
  );

  return (
    <motion.span
      style={{
        opacity,
        y,
        display: "inline-block",
        fontWeight: bold ? 700 : 400,
      }}
    >
      {text}
    </motion.span>
  );
}

// ── Main page ────────────────────────────────────────────
export default function HomePage() {
  const [frame, setFrame] = useState(0);
  const [pageHeight, setPageHeight] = useState(SCROLL_HEIGHT + 900);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setPageHeight(SCROLL_HEIGHT + window.innerHeight);
  }, []);

  // Drive frame index from scroll position
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      const next = Math.min(
        Math.floor(p * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );
      setFrame(next);
    });
    return unsub;
  }, [scrollYProgress]);

  const line1 = WORDS.slice(0, 4); // "It all starts with"
  const line2 = WORDS.slice(4);    // "a flash."

  return (
    <div style={{ height: pageHeight }}>

      {/* ── Image sequence ── */}
      <div className="fixed inset-0 bg-black overflow-hidden">
        {FRAME_PATHS.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{
              opacity: i === frame ? 1 : 0,
              transition: "opacity 0.8s ease",
              pointerEvents: "none",
            }}
          />
        ))}
        {/* Top vignette keeps text readable */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "45%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Text — word-by-word scroll animation ── */}
      <div className="fixed inset-x-0 top-0 flex justify-center pointer-events-none"
        style={{ paddingTop: "clamp(3.5rem, 8vh, 7rem)" }}
      >
        <div
          className="text-center"
          style={{
            fontFamily: "var(--font-kalnia), serif",
            fontSize: "clamp(2.4rem, 5vw, 5.5rem)",
            lineHeight: 1.12,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          {/* Line 1: "It all starts with" */}
          <div className="flex justify-center gap-[0.22em]">
            {line1.map((w) => (
              <AnimatedWord
                key={w.text}
                {...w}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Line 2: "a flash." */}
          <div className="flex justify-center gap-[0.22em]">
            {line2.map((w) => (
              <AnimatedWord
                key={w.text}
                {...w}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator — bottom right ── */}
      <div
        className="fixed bottom-10 right-10 flex flex-col items-center gap-3 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <span
          style={{
            fontFamily: "var(--font-kalnia), serif",
            fontWeight: 400,
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Scroll
        </span>

        {/* 2px line: white → transparent, sweeps downward on loop */}
        <div
          style={{
            width: 2,
            height: 80,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              width: 2,
              height: 80,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
            }}
            animate={{ y: [-80, 80] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
