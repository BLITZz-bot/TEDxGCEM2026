"use client";

import React from "react";
import { motion } from "framer-motion";

const speakers = [
  { id: 1, name: "Dr. Sarah Chen", topic: "The Future of AI Ethics", size: "large" },
  { id: 2, name: "Marcus Thorne", topic: "Urban Rewilding", size: "small" },
  { id: 3, name: "Aisha Roberts", topic: "Quantum Storytelling", size: "medium" },
  { id: 4, name: "Julian Voss", topic: "The Sound of Silence", size: "small" },
  { id: 5, name: "Elena Rodriguez", topic: "Bionic Architecture", size: "medium" },
  { id: 6, name: "Kenji Tanaka", topic: "Minimalist Mathematics", size: "small" },
];

export default function Speakers() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-12 text-center sm:text-left"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">The Lineup</h2>
        <h3 className="text-4xl md:text-6xl font-black italic">FEATURED SPEAKERS</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {speakers.map((speaker, index) => (
          <motion.div
            key={speaker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-ted-dark-gray flex flex-col justify-end p-8 transition-all hover:border-ted-red/50 ${
              speaker.size === "large" ? "md:col-span-2 md:row-span-2" : 
              speaker.size === "medium" ? "md:col-span-1 md:row-span-2" : "md:col-span-1 md:row-span-1"
            }`}
          >
            {/* Background Gradient/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
            
            {/* Animated hover background */}
            <div className="absolute inset-0 bg-ted-red opacity-0 group-hover:opacity-5 transition-opacity duration-500 z-0" />

            <div className="relative z-10">
              <span className="text-ted-red text-sm font-bold uppercase tracking-tighter block mb-1">Speaker</span>
              <h4 className="text-2xl font-bold mb-1">{speaker.name}</h4>
              <p className="text-white/60 text-sm group-hover:text-white transition-colors">{speaker.topic}</p>
            </div>
            
            {/* Corner Icon */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                <span className="text-ted-red text-xs">→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
