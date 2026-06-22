"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Compass } from "lucide-react";

export default function EventDate() {
  return (
    <section className="pt-24 pb-8 px-6 relative text-white overflow-hidden font-sans select-none bg-black">
      {/* Editorial Vertical Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2"
            >
              
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight"
            >
              SAVE THE DATE
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.15 }}
            className="text-xs font-mono text-white/40 uppercase tracking-widest"
          >
            DATE & VENUE
          </motion.div>
        </div>

        {/* Timeline Catalyst Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* Left Block (Giant Date Display) - Spans 4 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="md:col-span-4 bg-black border-2 border-white p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 relative group cursor-default"
          >
            {/* Index code */}
         
            <div>
              <div className="w-10 h-10 rounded-none border border-white/10 flex items-center justify-center text-white/60 group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-all duration-300 mb-6">
                <Calendar size={18} className="stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-ted-red uppercase mb-1">THURSDAY</span>
                <span className="text-6xl md:text-7xl font-black font-mono tracking-tighter text-white leading-none">
                  OCT 15
                </span>
                <span className="text-xs font-mono text-white/40 tracking-[0.2em] uppercase mt-2">
                  YEAR 2026 // TIME: 09:00 AM
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] text-white/30 font-mono">
              <span>TIMEZONE: IST (GMT+5:30)</span>
              
            </div>
          </motion.div>

          {/* Right Block (Venue Details & Day Overview) - Spans 8 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-8 bg-zinc-950 border-2 border-white p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 group cursor-default"
          >
            {/* Index code */}
            

            <div>
              <div className="w-10 h-10 rounded-none border border-white/10 flex items-center justify-center text-white/60 group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-all duration-300 mb-6">
                <Compass size={18} className="stroke-[1.75]" />
              </div>
              <h3 className="text-xl md:text-2xl font-black italic uppercase text-white mb-4 leading-tight tracking-tight group-hover:text-ted-red transition-colors duration-300">
                THE BLUEPRINT OF THE DAY
              </h3>
              <p className="text-white/60 text-xs md:text-sm font-light leading-relaxed font-mono max-w-2xl">
                TEDxGCEM 2026 brings together thinkers, builders, and community pioneers under the theme &quot;RIPPLE&quot;. On this single day, the campus main auditorium transforms into a launchpad for ideas that challenge the baseline of conventional frameworks and spark new connections.
              </p>
            </div>

            {/* Logistics Grid */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-ted-red mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Main Auditorium</span>
                  <p className="text-[9px] font-mono text-white/40 leading-tight">Gopalan College of Engineering & Management, Bangalore</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={14} className="text-ted-red mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Full Event Day</span>
                  <p className="text-[9px] font-mono text-white/40 leading-tight">8 Curated Talks, Live Interactive Art, & Innovation Lounges</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
