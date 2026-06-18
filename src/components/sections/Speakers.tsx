"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const speakers = [
  { id: 1, name: "Dr. Sarah Chen", topic: "The Future of AI Ethics", role: "AI Ethicist & Researcher", description: "Dr. Chen focuses on building standard guidelines for humane automated architectures.", size: "large" },
  { id: 2, name: "Marcus Thorne", topic: "Urban Rewilding & Architecture", role: "Environmental Designer", description: "Marcus creates bio-mimetic urban ecosystems that synthesize concrete layouts with local flora.", size: "small" },
  { id: 3, name: "Aisha Roberts", topic: "Quantum Storytelling", role: "Theoretical Physicist & Novelist", description: "Aisha bridges the complexity of quantum states with creative modern narratives.", size: "medium" },
  { id: 4, name: "Julian Voss", topic: "The Power of Ambient Silence", role: "Acoustic Architect", description: "Julian designs silent environments within industrial hubs to recover neurological focus.", size: "small" },
  { id: 5, name: "Elena Rodriguez", topic: "Bionic Infrastructure", role: "Bio-Materials Engineer", description: "Elena develops bionic shell systems capable of self-healing under local pressure changes.", size: "medium" },
  { id: 6, name: "Kenji Tanaka", topic: "Minimalist Mathematics", role: "Theoretical Topologist", description: "Kenji simplifies intricate geometric logic into elegant patterns for aesthetic coding.", size: "small" },
];

export default function Speakers() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16 text-center sm:text-left"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">The Visionaries</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-black">FEATURED SPEAKERS</h3>
      </motion.div>

      {/* Accordion Flex-based Grid */}
      <div className="flex flex-col lg:flex-row gap-4 h-[600px] w-full">
        {speakers.map((speaker, index) => {
          const isHovered = hoveredId === speaker.id || (hoveredId === null && index === 0);
          return (
            <motion.div
              key={speaker.id}
              onMouseEnter={() => setHoveredId(speaker.id)}
              onMouseLeave={() => setHoveredId(null)}
              animate={{
                flex: isHovered ? 2.5 : 1,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative rounded-[2.5rem] overflow-hidden bg-white border border-black/5 p-8 flex flex-col justify-between cursor-pointer group hover:border-ted-red/35 shadow-sm"
            >
              {/* Animated Glow Backdrop */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/90 z-1 transition-opacity duration-300"
              />
              <div 
                className={`absolute inset-0 bg-ted-red/[0.02] z-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
              />

              {/* Top Slot: Index / Role */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-ted-red font-mono font-black text-xl">0{speaker.id}</span>
                <span className="text-[9px] uppercase tracking-widest text-black/30 font-mono mt-1 group-hover:text-black/50 transition-colors">
                  {speaker.role.split(" & ")[0]}
                </span>
              </div>

              {/* Bottom Slot: Info Panel */}
              <div className="relative z-10">
                <h4 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-2 group-hover:text-ted-red transition-colors">
                  {speaker.name}
                </h4>
                
                {/* Expandable Info on Hover */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isHovered ? "auto" : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="text-ted-red text-sm font-bold tracking-tight mb-2">{speaker.topic}</p>
                  <p className="text-black/60 text-xs leading-relaxed max-w-sm mt-2">{speaker.description}</p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
