"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Users, Mic2, Target } from "lucide-react";
import { EventSettings } from "@/lib/settings-service";
import { getEventYear } from "@/lib/utils";

interface HighlightsProps {
  settings?: EventSettings | null;
}

export default function Highlights({ settings }: HighlightsProps) {
  const items = [
    {
      num: "01",
      icon: Lightbulb,
      title: "Ideas Worth Spreading",
      desc: "Showcasing innovative ideas that challenge conventional thinking and inspire action.",
    },
    {
      num: "02",
      icon: Users,
      title: "Community Connection",
      desc: "Bringing together diverse perspectives and fostering meaningful conversations.",
    },
    {
      num: "03",
      icon: Mic2,
      title: "Inspiring Talks",
      desc: "Curated presentations that educate, entertain, and inspire the audience.",
    },
    {
      num: "04",
      icon: Target,
      title: "Local Impact",
      desc: "Creating a platform for local voices to share global ideas with our community.",
    },
  ];

  return (
    <section className="py-24 px-6 relative text-white overflow-hidden font-sans select-none bg-black">
      {/* Editorial Vertical Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2"
            >
              {"What Makes TEDx Special?"}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight"
            >
              CORE VALUES
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.15 }}
            className="text-xs font-mono text-white/40 uppercase tracking-widest"
          >
            TEDxGCEM {getEventYear(settings?.event_date)}
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, idx) => {
            const IconComponent = item.icon;
            
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-black border-2 border-white p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 relative group cursor-pointer"
              >
                {/* Tech Code Index corner */}
                <div className="absolute top-4 right-6 text-[10px] font-mono text-white/30 group-hover:text-ted-red transition-colors duration-300">
                  {"// "}{item.num}
                </div>

                <div>
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-none border border-white/10 flex items-center justify-center text-white/60 group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-all duration-300 mb-8">
                    <IconComponent size={22} className="stroke-[1.75]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-black italic uppercase text-white mb-4 leading-tight tracking-tight group-hover:text-ted-red transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-xs md:text-sm font-light leading-relaxed font-mono">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
