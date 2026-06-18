"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const infoCards = [
  {
    id: "gcem",
    title: "TEDxGCEM 2026",
    subtitle: "Local Catalyst Platform",
    body: "TEDxGCEM is a locally organized, independent TEDx platform hosted at Gopalan College of Engineering and Management, Bengaluru. Under official license from TED, we convene developers, designers, artists, and engineers to spark creative ripples and community action.",
  },
  {
    id: "tedx",
    title: "What is TEDx?",
    subtitle: "Self-Organized Inspiration",
    body: "In the spirit of ideas worth spreading, TEDx is a global program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, live speakers and recorded talks combine to spark deep discussions and structural connections.",
  },
  {
    id: "ted",
    title: "About TED",
    subtitle: "Ideas Worth Spreading",
    body: "TED is a global nonprofit organization dedicated to sharing ideas, usually in the form of short, powerful talks. Covering sciences, arts, global issues, and technology, TED hosts leading thinkers and doers to inspire changes in communities around the world.",
  }
];

export default function About() {
  const [activeCard, setActiveCard] = useState("gcem");

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">Our Foundation</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-black">ABOUT THE PLATFORM</h3>
      </motion.div>

      {/* Interactive Segment Selection */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {infoCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveCard(card.id)}
            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeCard === card.id ? "bg-ted-red text-white shadow-lg shadow-ted-red/20" : "bg-black/5 text-black/50 hover:bg-black/10"
            }`}
          >
            {card.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Morphing Perspective Card */}
      <div className="relative h-[320px] md:h-[240px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {infoCards.filter(c => c.id === activeCard).map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-white border border-black/5 p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-center shadow-2xl backdrop-blur-md"
            >
              <span className="text-ted-red text-xs font-bold uppercase tracking-widest font-mono mb-2">{card.subtitle}</span>
              <h4 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-black">{card.title}</h4>
              <p className="text-black/70 leading-relaxed text-sm md:text-base">{card.body}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Organizers Team Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 text-center mb-16"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">The Architects</h2>
        <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-black">OUR ORGANIZING TEAM</h3>
      </motion.div>

      {/* Futuristic Hover-Tilt Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {[
          { name: "Rahul Sharma", role: "Licensee & Lead Organizer" },
          { name: "Priya Nair", role: "Co-Organizer & Curation Lead" },
          { name: "Amit Patel", role: "Production Lead" },
          { name: "Ananya Rao", role: "Marketing & PR Lead" },
          { name: "Vikram Sen", role: "Design Lead" },
          { name: "Neha Gupta", role: "Sponsorship Coordinator" },
          { name: "Siddharth Das", role: "Technical Lead" },
          { name: "Rohan Verma", role: "Volunteer Lead" },
        ].map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, rotateX: 5, rotateY: -5 }}
            className="group bg-white border border-black/5 p-6 rounded-[2rem] hover:border-ted-red/20 transition-all duration-300 shadow-sm"
          >
            <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center border border-black/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-black/10 group-hover:text-ted-red/40 transition-colors duration-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h4 className="text-md font-bold text-black tracking-tight">{member.name}</h4>
            <p className="text-[9px] uppercase tracking-widest text-black/30 font-mono mt-1">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
