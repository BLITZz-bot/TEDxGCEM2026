// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
"use client";

/**
 * @component DevCredit
 *
 * Developer attribution footer element displayed across all pages.
 * Renders the "designed & developed by M M BHARATH" credit with a
 * popover that exposes LinkedIn and Gmail contact links on click.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DevCredit() {
  const [showDevLinks, setShowDevLinks] = useState(false);
  const devCreditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devCreditRef.current && !devCreditRef.current.contains(event.target as Node)) {
        setShowDevLinks(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={devCreditRef}
      className="mt-6 flex flex-col items-center justify-center gap-2 text-center z-10 relative"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono flex items-center justify-center gap-1.5 flex-wrap">
        designed &amp; developed by{" "}
        <span className="relative inline-block">
          <button
            onClick={() => setShowDevLinks(!showDevLinks)}
            className="text-white font-black cursor-pointer hover:text-white/80 transition-colors duration-150 focus:outline-none relative inline-flex items-center uppercase tracking-[0.2em]"
            aria-label="Show developer contact links"
          >
            M M BHARATH
          </button>
          <AnimatePresence>
            {showDevLinks && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3.5 py-2 bg-neutral-950/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.15em] z-50 whitespace-nowrap"
              >
                <a
                  href="https://www.linkedin.com/in/bharath-m-m-a9960b309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group px-1 py-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <div className="w-[1px] h-3.5 bg-white/10" />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=bharatha9483@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group px-1 py-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Gmail</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </span>
      </span>
    </div>
  );
}
