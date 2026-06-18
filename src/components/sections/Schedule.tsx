"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Tag } from "lucide-react";

const schedule = [
  { id: 1, time: "09:00 AM", event: "Registration & Coffee", type: "break", location: "Grand Lobby", tags: ["Welcome", "Networking"] },
  { id: 2, time: "10:00 AM", event: "Opening Ceremony", type: "session", location: "Main Stage", tags: ["Ceremony", "Intro"] },
  { id: 3, time: "10:30 AM", event: "Session 1: Digital Frontier", type: "session", location: "Main Stage", tags: ["AI", "Future Tech"] },
  { id: 4, time: "12:00 PM", event: "Networking Lunch", type: "break", location: "Exhibition Hall", tags: ["Food", "Social"] },
  { id: 5, time: "01:30 PM", event: "Session 2: Sustaining Humanity", type: "session", location: "Main Stage", tags: ["Ecology", "Bionics"] },
  { id: 6, time: "03:00 PM", event: "Afternoon High Tea", type: "break", location: "Exhibition Hall", tags: ["Social", "Tea"] },
  { id: 7, time: "04:00 PM", event: "Session 3: To the Stars", type: "session", location: "Main Stage", tags: ["Space", "Physics"] },
  { id: 8, time: "05:30 PM", event: "Closing Remarks", type: "session", location: "Main Stage", tags: ["Ceremony", "Outro"] },
];

export default function Schedule() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">Event Flow</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter">THE ROADMAP</h3>
      </motion.div>

      {/* Centralized Roadmap Track */}
      <div className="relative w-full">
        {/* Vertical Central Line (Hidden on Mobile) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/5 hidden md:block" />

        {/* Timeline roadmap nodes */}
        <div className="space-y-12 relative">
          {schedule.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const isSelected = selectedId === item.id;
            
            return (
              <div 
                key={item.id} 
                className={`flex flex-col md:flex-row items-center w-full justify-between ${
                  isLeft ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Node Card Container */}
                <div className="w-full md:w-[45%]">
                  <motion.div
                    layout
                    onClick={() => setSelectedId(isSelected ? null : item.id)}
                    whileHover={{ y: -5, borderColor: "rgba(235, 0, 40, 0.2)" }}
                    className="bg-ted-dark-gray border border-white/5 p-6 rounded-[2rem] cursor-pointer relative overflow-hidden transition-all duration-300 shadow-xl"
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-ted-red font-mono font-black text-xl flex items-center gap-1.5">
                          <Clock size={16} />
                          {item.time}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">
                          {item.location}
                        </span>
                      </div>

                      <h4 className={`text-xl font-bold tracking-tight ${
                        item.type === "break" ? "text-white/45" : "text-white"
                      }`}>
                        {item.event}
                      </h4>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center"
                          >
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                              <Tag size={10} className="text-ted-red" />
                              Tags:
                            </span>
                            {item.tags.map(t => (
                              <span key={t} className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                                {t}
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Central Point (Hidden on Mobile) */}
                <div className="relative w-8 h-8 hidden md:flex items-center justify-center z-10">
                  <motion.div 
                    animate={{
                      scale: isSelected ? 1.3 : 1,
                      backgroundColor: isSelected ? "#EB0028" : "#222222",
                      boxShadow: isSelected ? "0 0 15px #EB0028" : "0 0 0px rgba(0,0,0,0)"
                    }}
                    className="w-3.5 h-3.5 rounded-full border border-black" 
                  />
                </div>

                {/* Invisible spacer to balance grid */}
                <div className="w-full md:w-[45%] hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
