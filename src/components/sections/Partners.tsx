"use client";

import React from "react";
import { motion } from "framer-motion";

const row1 = [
  { name: "Global Tech Corp", level: "Platinum" },
  { name: "Future Systems", level: "Platinum" },
  { name: "Innovate AI", level: "Gold" },
  { name: "Eco Solutions", level: "Gold" },
];

const row2 = [
  { name: "Creative Media", level: "Silver" },
  { name: "Urban Planning Co", level: "Silver" },
  { name: "NextGen Education", level: "Silver" },
  { name: "Digital Arts", level: "Silver" },
];

export default function Partners() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">Support Network</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter">OUR PARTNERS</h3>
      </motion.div>

      {/* Infinite Scrolling Marquees */}
      <div className="space-y-10 relative z-10 w-full max-w-full">
        {/* Row 1: Leftwards sliding */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex gap-6 animate-[marquee_30s_linear_infinite] w-max">
            {[...row1, ...row1, ...row1].map((partner, i) => (
              <div
                key={i}
                className="w-[280px] h-32 bg-ted-dark-gray border border-white/5 rounded-[2rem] flex items-center justify-center p-6 hover:border-ted-red/20 transition-colors duration-300"
              >
                <div className="text-lg font-black text-white/20 tracking-tight uppercase select-none group-hover:text-white/40">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Rightwards sliding */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex gap-6 animate-[marquee_30s_linear_infinite_reverse] w-max">
            {[...row2, ...row2, ...row2].map((partner, i) => (
              <div
                key={i}
                className="w-[280px] h-32 bg-ted-dark-gray border border-white/5 rounded-[2rem] flex items-center justify-center p-6 hover:border-ted-red/20 transition-colors duration-300"
              >
                <div className="text-lg font-black text-white/20 tracking-tight uppercase select-none group-hover:text-white/40">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
