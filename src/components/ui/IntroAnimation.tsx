"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface IntroAnimationProps {
  onComplete?: () => void;
  onStartSplit?: () => void;
}

export default function IntroAnimation({ onComplete, onStartSplit }: IntroAnimationProps) {
  const [triggerSplit, setTriggerSplit] = useState(false);

  const handleSkip = useCallback(() => {
    localStorage.setItem("tedx_intro_seen", "true");
    onComplete?.();
  }, [onComplete]);

  // Set up animation timeouts and keyboard listener
  useEffect(() => {
    // 1. Start split animation after 1.8s (1.0s zoom-in + 0.8s hold including impact)
    const splitTimer = setTimeout(() => {
      setTriggerSplit(true);
      onStartSplit?.();
    }, 1800);

    // 2. Unmount intro completely after 3.6s (1.8s split trigger + 1.8s slide transition)
    const completeTimer = setTimeout(() => {
      localStorage.setItem("tedx_intro_seen", "true");
      onComplete?.();
    }, 3600);

    // 3. Escape key listener to skip intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(completeTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onStartSplit, onComplete, handleSkip]);

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[99999] select-none overflow-hidden bg-transparent cursor-pointer"
    >
      {/* Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-6 right-6 z-[99999] px-4 py-2 border border-white/10 bg-black/40 text-white/50 hover:text-white hover:border-white transition-all duration-200 font-mono text-[10px] tracking-widest uppercase cursor-pointer"
      >
        Skip Intro [ESC]
      </button>

      {/* Left Shutter Panel */}
      <motion.div
        initial={{ x: "0vw" }}
        animate={triggerSplit ? { x: "-100vw" } : { x: "0vw" }}
        transition={{ duration: 1.8, ease: [0.85, 0, 0.15, 1] }}
        style={{ clipPath: "inset(0 50% 0 0)" }}
        className="absolute inset-0 bg-black"
      >
        {/* Full screen viewport container to maintain text centering */}
        <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 8, filter: "blur(40px)", opacity: 0 }}
            animate={{
              scale: [8, 1, 1.15, 0.92, 1],
              filter: ["blur(40px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
              opacity: [0, 1, 1, 1, 1]
            }}
            transition={{
              duration: 1.4,
              times: [0, 0.71, 0.81, 0.91, 1.0],
              ease: ["easeOut", "easeOut", "easeInOut", "easeOut"]
            }}
            className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase text-center select-none"
          >
            <span className="text-ted-red inline-block pr-1">TEDx</span>
            <span className="text-white inline-block pl-1">GCEM</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Shutter Panel */}
      <motion.div
        initial={{ x: "0vw" }}
        animate={triggerSplit ? { x: "100vw" } : { x: "0vw" }}
        transition={{ duration: 1.8, ease: [0.85, 0, 0.15, 1] }}
        style={{ clipPath: "inset(0 0 0 50%)" }}
        className="absolute inset-0 bg-black"
      >
        {/* Full screen viewport container to maintain text centering */}
        <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 8, filter: "blur(40px)", opacity: 0 }}
            animate={{
              scale: [8, 1, 1.15, 0.92, 1],
              filter: ["blur(40px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
              opacity: [0, 1, 1, 1, 1]
            }}
            transition={{
              duration: 1.4,
              times: [0, 0.71, 0.81, 0.91, 1.0],
              ease: ["easeOut", "easeOut", "easeInOut", "easeOut"]
            }}
            className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase text-center select-none"
          >
            <span className="text-ted-red inline-block pr-1">TEDx</span>
            <span className="text-white inline-block pl-1">GCEM</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
