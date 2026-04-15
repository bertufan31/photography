"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type TextPhase = "idle" | "animating" | "complete";

export default function HomePage() {
  const [phase, setPhase] = useState<TextPhase>("idle");
  const [scrollY, setScrollY] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);

  // Auto-start animation
  useEffect(() => {
    const timer = setTimeout(() => setPhase("animating"), 500);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll for PNG sequence
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrollY(scrollTop);
      // Map scroll position to frame (adjust divisor based on total frames)
      const newFrame = Math.min(Math.floor(scrollTop / 50), 49); // assuming 50 total frames
      setFrameIndex(newFrame);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text words to animate
  const words = ["It", "all", "starts", "with", "a", "flash"];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <main className="relative w-screen h-screen overflow-x-hidden">
      {/* PNG Sequence Background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
        <img
          src={`/sequence/frame-${String(frameIndex + 1).padStart(3, "0")}.png`}
          alt="Sequence frame"
          className="w-full h-full object-cover opacity-40"
          onError={() => {
            /* Fallback for missing frames */
          }}
        />
      </div>

      {/* Animated Text */}
      <div className="flex items-center justify-center h-screen w-screen">
        <motion.div
          className="text-center px-6"
          variants={containerVariants}
          initial="hidden"
          animate={phase === "animating" ? "visible" : "hidden"}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="text-6xl md:text-7xl font-black text-white tracking-tight"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm flex flex-col items-center gap-2">
        <span>Scroll to explore</span>
        <motion.svg
          width="20" height="30" viewBox="0 0 20 30"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="3,15 10,27 17,15" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </motion.svg>
      </div>

      {/* Extended scroll area for full sequence */}
      <div style={{ height: "5000px" }} />
    </main>
  );
}
