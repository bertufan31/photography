"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Config ──────────────────────────────────────────────
const TOTAL_FRAMES = 5;
// How many px of scroll corresponds to the full sequence
const SEQUENCE_SCROLL_HEIGHT = 3000;

// ────────────────────────────────────────────────────────
export default function HomePage() {
  const [frame, setFrame] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [pageHeight, setPageHeight] = useState(SEQUENCE_SCROLL_HEIGHT + 900);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);

  // ── Load all frames ────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const num = String(i + 1).padStart(3, "0");
      img.src = `/sequence/frame-${num}.png`;
      img.onload = () => {
        loaded++;
        // Draw first frame as soon as it's ready
        if (i === 0) drawFrame(0, imgs);
        if (loaded === TOTAL_FRAMES) {
          imagesRef.current = imgs;
        }
      };
      imgs[i] = img;
    }
    imagesRef.current = imgs;

    // Set accurate page height after mount
    setPageHeight(SEQUENCE_SCROLL_HEIGHT + window.innerHeight);

    // Show text shortly after mount
    const t = setTimeout(() => setTextVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Draw a frame on canvas ──────────────────────────────
  function drawFrame(index: number, imgs?: HTMLImageElement[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sources = imgs ?? imagesRef.current;
    const img = sources[index];
    if (!img?.complete) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // ── Scroll → frame mapping ──────────────────────────────
  useEffect(() => {
    function onScroll() {
      const progress = Math.min(
        window.scrollY / SEQUENCE_SCROLL_HEIGHT,
        1
      );
      const newFrame = Math.min(
        Math.floor(progress * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );

      if (newFrame !== currentFrameRef.current) {
        currentFrameRef.current = newFrame;
        setFrame(newFrame);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(newFrame));
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Redraw on resize ───────────────────────────────────
  useEffect(() => {
    function onResize() {
      drawFrame(currentFrameRef.current);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    // Tall page enables scroll-driven sequence
    <div style={{ height: `${pageHeight}px` }}>

      {/* ── Fixed full-screen canvas ── */}
      <div className="fixed inset-0 bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
        {/* Subtle dark vignette so text stays legible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* ── Sticky text overlay ── */}
      <div className="fixed inset-0 flex items-end pointer-events-none">
        <motion.div
          className="px-10 pb-14 md:px-16 md:pb-20"
          initial={{ opacity: 0, y: 24 }}
          animate={textVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 1.1 }}
        >
          {/* Line 1 — Kalnia Regular */}
          <p
            style={{
              fontFamily: "var(--font-kalnia), serif",
              fontWeight: 400,
              fontSize: "clamp(2.2rem, 5vw, 4.8rem)",
              lineHeight: 1.08,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            It all starts with
          </p>

          {/* Line 2 — Kalnia Bold */}
          <p
            style={{
              fontFamily: "var(--font-kalnia), serif",
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 5vw, 4.8rem)",
              lineHeight: 1.08,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            a flash.
          </p>
        </motion.div>
      </div>

      {/* ── Scroll cue (visible only at top) ── */}
      <motion.div
        className="fixed bottom-8 right-10 flex flex-col items-center gap-1 pointer-events-none"
        animate={{ opacity: frame > 0 ? 0 : 0.4 }}
        transition={{ duration: 0.4 }}
      >
        <span
          style={{
            fontFamily: "var(--font-kalnia), serif",
            fontWeight: 400,
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          Scroll
        </span>
        <motion.svg
          width="16" height="24" viewBox="0 0 16 24"
          fill="none" stroke="white" strokeWidth="1.2"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <line x1="8" y1="0" x2="8" y2="18" />
          <polyline points="2,12 8,22 14,12" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
