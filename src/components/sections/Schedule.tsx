"use client";

import React from "react";
import { motion } from "framer-motion";

const schedule = [
  { time: "09:00 AM", event: "Registration & Morning Coffee", type: "break" },
  { time: "10:00 AM", event: "Opening Ceremony", type: "session" },
  { time: "10:30 AM", event: "Session 1: The Digital Frontier", type: "session" },
  { time: "12:00 PM", event: "Networking Lunch", type: "break" },
  { time: "01:30 PM", event: "Session 2: Sustaining Humanity", type: "session" },
  { time: "03:00 PM", event: "Afternoon Tea", type: "break" },
  { time: "04:00 PM", event: "Session 3: To the Stars", type: "session" },
  { time: "05:30 PM", event: "Closing Remarks", type: "session" },
];

export default function Schedule() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Event Flow</h2>
        <h3 className="text-4xl md:text-6xl font-black italic">SCHEDULE</h3>
      </motion.div>

      <div className="relative border-l border-white/10 ml-4 md:ml-0">
        {schedule.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-12 ml-8 relative"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 border-black ${
              item.type === "session" ? "bg-ted-red shadow-[0_0_10px_rgba(235,0,40,0.8)]" : "bg-white/40"
            }`} />
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
              <span className="text-ted-red font-mono font-bold tracking-tighter text-xl whitespace-nowrap">
                {item.time}
              </span>
              <div className="bg-ted-dark-gray/50 border border-white/5 p-6 rounded-2xl flex-grow group hover:border-white/20 transition-all">
                <h4 className={`text-xl font-bold ${item.type === "break" ? "text-white/40" : "text-white"}`}>
                  {item.event}
                </h4>
                <p className="text-sm text-white/30 mt-1 uppercase tracking-widest">
                  {item.type === "session" ? "Main Stage" : "Lounge Area"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
