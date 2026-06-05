"use client";

import React from "react";
import { motion } from "framer-motion";

const partners = [
  { name: "Global Tech Corp", level: "Platinum" },
  { name: "Future Systems", level: "Platinum" },
  { name: "Innovate AI", level: "Gold" },
  { name: "Eco Solutions", level: "Gold" },
  { name: "Creative Media", level: "Silver" },
  { name: "Urban Planning Co", level: "Silver" },
  { name: "NextGen Education", level: "Silver" },
  { name: "Digital Arts", level: "Silver" },
];

export default function Partners() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Support Network</h2>
        <h3 className="text-4xl md:text-6xl font-black italic">OUR PARTNERS</h3>
      </motion.div>

      <div className="space-y-20">
        <div>
          <h4 className="text-white/40 uppercase tracking-[0.3em] text-sm text-center mb-10">Platinum Partners</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partners.filter(p => p.level === "Platinum").map((partner, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="h-40 bg-ted-dark-gray/40 border border-white/5 rounded-3xl flex items-center justify-center p-8 grayscale hover:grayscale-0 transition-all duration-500 hover:border-ted-red/30"
              >
                <div className="text-2xl font-black text-white/20 tracking-tighter uppercase">{partner.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white/40 uppercase tracking-[0.3em] text-sm text-center mb-10">Gold Partners</h4>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
            {partners.filter(p => p.level === "Gold").map((partner, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="h-32 bg-ted-dark-gray/40 border border-white/5 rounded-3xl flex items-center justify-center p-8 grayscale hover:grayscale-0 transition-all duration-500 hover:border-ted-red/30"
              >
                <div className="text-xl font-black text-white/20 tracking-tighter uppercase">{partner.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white/40 uppercase tracking-[0.3em] text-sm text-center mb-10">Silver Partners</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.filter(p => p.level === "Silver").map((partner, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="h-24 bg-ted-dark-gray/40 border border-white/5 rounded-2xl flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 hover:border-ted-red/30"
              >
                <div className="text-xs font-black text-white/20 tracking-tighter uppercase text-center">{partner.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
