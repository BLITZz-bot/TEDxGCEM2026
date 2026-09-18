"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, User, ChevronDown, ChevronUp, Radio } from "lucide-react";
import type { EventSettings } from "@/lib/settings-service";
import { getEventYear } from "@/lib/utils";

interface ScheduleItem {
  time: string;
  event: string;
  type: "session" | "break";
  location: string;
  speaker: string;
  desc: string;
}

const schedule: ScheduleItem[] = [
  { 
    time: "08:30 AM to 09:30 AM", 
    event: "Registrations", 
    type: "break",
    location: "Registration Desk",
    speaker: "All Attendees",
    desc: "Collect your custom access passes, badges, and curated welcome kits."
  },
  { 
    time: "09:30 AM", 
    event: "Welcome", 
    type: "session",
    location: "Main Auditorium",
    speaker: "TEDx Committee",
    desc: "Welcome address to kick off the event."
  },
  { 
    time: "", 
    event: "Indu Antony", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Indu Antony",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "Sunil Subrahmanyam Yadavalli", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Sunil Subrahmanyam Yadavalli",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "A MELODY ACROSS GENERATIONS", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Dr. Shruthi Harsha & Master H. Shri Krishna",
    desc: "Performance by Dr. Shruthi Harsha & Master H. Shri Krishna."
  },
  { 
    time: "10:45 AM to 11:15 AM", 
    event: "Break & Networking", 
    type: "break",
    location: "Main Auditorium",
    speaker: "All Attendees",
    desc: "Take a short break, grab some refreshments, and network with fellow attendees."
  },
  { 
    time: "11:15 AM", 
    event: "Sagar Simha", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Sagar Simha",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "Performance by Sagar Simha", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Sagar Simha",
    desc: "Special Performance"
  },
  { 
    time: "", 
    event: "Suman Balakrishna", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Suman Balakrishna",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "Surya Keerthi", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Surya Keerthi",
    desc: "Speaker Session"
  },
  { 
    time: "12:45 PM to 02:00 PM", 
    event: "Lunch & Networking", 
    type: "break",
    location: "Dining Area",
    speaker: "All Attendees",
    desc: "A catered lunch break designed to match attendees with shared fields and interests in collaborative hubs."
  },
  { 
    time: "02:00 PM", 
    event: "Dr. Nalini Chandraiah", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Dr. Nalini Chandraiah",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "Performance by Pavan Bhat", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Pavan Bhat",
    desc: "Special Performance"
  },
  { 
    time: "", 
    event: "Janani BM", 
    type: "session",
    location: "Main Auditorium",
    speaker: "Janani BM",
    desc: "Speaker Session"
  },
  { 
    time: "", 
    event: "Vote of Thanks", 
    type: "session",
    location: "Main Auditorium",
    speaker: "TEDx Committee",
    desc: "Closing remarks and vote of thanks."
  },
  { 
    time: "03:15 PM to 04:00 PM", 
    event: "Networking & Close With Goodie Bag", 
    type: "break",
    location: "Main Auditorium",
    speaker: "All Attendees",
    desc: "Final networking session to reflect on the day's ideas. Don't forget to collect your goodie bag before departing!"
  },
];

interface ScheduleProps {
  settings?: EventSettings | null;
}

export default function Schedule({ settings }: ScheduleProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "session" | "break">("all");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [hoveredFilterId, setHoveredFilterId] = useState<string | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      checkHoveredElement(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      checkHoveredElement(mousePosRef.current.x, mousePosRef.current.y);
    };

    const checkHoveredElement = (clientX: number, clientY: number) => {
      if (clientX < 0 || clientY < 0) return;
      const element = document.elementFromPoint(clientX, clientY);
      if (!element) {
        setHoveredCardIndex(null);
        setHoveredFilterId(null);
        return;
      }

      // Check card
      const card = element.closest(".schedule-card");
      if (card) {
        const indexStr = card.getAttribute("data-index");
        if (indexStr !== null) {
          setHoveredCardIndex(parseInt(indexStr, 10));
          setHoveredFilterId(null);
          return;
        }
      }

      // Check filter button
      const button = element.closest(".schedule-filter-btn");
      if (button) {
        const filterId = button.getAttribute("data-filter-id");
        if (filterId) {
          setHoveredFilterId(filterId);
          setHoveredCardIndex(null);
          return;
        }
      }

      setHoveredCardIndex(null);
      setHoveredFilterId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const filteredSchedule = schedule.map(item => ({
    ...item,
    desc: item.desc.replace("TEDxGCEM 2026", `TEDxGCEM ${getEventYear(settings?.event_date)}`)
  })).filter(item => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const filters = [
    { id: "all", label: "ALL EVENTS" },
    { id: "session", label: "TALKS & SPEAKERS" },
    { id: "break", label: "BREAKS & NETWORKING" },
  ] as const;

  return (
    <section className="relative min-h-screen pt-20 md:pt-32 pb-24 px-6 select-none text-white overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="mb-20 flex flex-col justify-between items-start gap-4 border-b border-white/10 pb-12 text-left"
        >
          <span className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2">{"// CHRONOLOGY"}</span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase">
            EVENT <span className="text-ted-red">SCHEDULE</span>
          </h2>
          <div className="h-[1.5px] w-20 bg-ted-red" />
        </motion.div>

        {settings?.reveal_schedule ? (
          <>
            {/* Cyber-Brutalist Tabs */}
            <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 mb-16 w-full">
              {filters.map((f) => {
                const isActive = activeFilter === f.id;
                const isBtnHovered = hoveredFilterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id);
                      setExpandedSession(null);
                    }}
                    className={`w-full md:w-auto px-1 md:px-5 py-2.5 md:py-3 text-center font-mono text-[8px] xs:text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all duration-300 border cursor-pointer rounded-none schedule-filter-btn shrink-0 ${
                      isActive 
                        ? "bg-ted-red border-ted-red text-white font-black" 
                        : `bg-transparent text-white ${
                            isBtnHovered 
                              ? "border-ted-red/40" 
                              : "border-white/10 hover:border-ted-red/40"
                          }`
                    }`}
                    data-filter-id={f.id}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Timeline List */}
            <div className="relative border-l border-white/10 ml-4 md:ml-32 pl-6 md:pl-12 space-y-12">
              
              {/* Animated laser pulse flowing down the timeline path */}
              <div className="absolute left-[-0.5px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-ted-red/20 to-transparent pointer-events-none hidden md:block overflow-hidden">
                <motion.div 
                  animate={{ y: ["-10vh", "100vh"] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                  className="w-full h-32 bg-gradient-to-b from-transparent via-ted-red to-transparent"
                />
              </div>

              <AnimatePresence mode="popLayout">
                {filteredSchedule.map((item, index) => {
                  const isExpanded = expandedSession === index;
                  const isCardHovered = hoveredCardIndex === index;
                  
                  return (
                    <motion.div
                      key={item.event}
                      layout
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      onClick={() => setExpandedSession(isExpanded ? null : index)}
                      className={`relative group border p-5 sm:p-6 flex flex-col gap-4 items-start justify-between cursor-pointer w-full [will-change:transform] schedule-card backdrop-blur-md transition-all duration-300 ${
                        isCardHovered 
                          ? "border-ted-red/40 bg-white/[0.07] shadow-[0_0_20px_rgba(235,0,40,0.06)]" 
                          : "border-ted-red/40 md:border-white/10 md:hover:border-ted-red/40 bg-white/[0.04] hover:bg-white/[0.07]"
                      }`}
                      data-index={index}
                    >
                      {/* Tech Corner Bracket Accents */}
                      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l transition-colors pointer-events-none ${
                        isCardHovered ? "border-ted-red/40" : "border-ted-red/40 md:border-white/10 md:group-hover:border-ted-red/40"
                      }`} />
                      <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r transition-colors pointer-events-none ${
                        isCardHovered ? "border-ted-red/40" : "border-ted-red/40 md:border-white/10 md:group-hover:border-ted-red/40"
                      }`} />
                      <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l transition-colors pointer-events-none ${
                        isCardHovered ? "border-ted-red/40" : "border-ted-red/40 md:border-white/10 md:group-hover:border-ted-red/40"
                      }`} />
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r transition-colors pointer-events-none ${
                        isCardHovered ? "border-ted-red/40" : "border-ted-red/40 md:border-white/10 md:group-hover:border-ted-red/40"
                      }`} />

                      {/* Subtle Hover Red Scanline Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-ted-red/[0.015] to-transparent transition-transform duration-1000 ease-out pointer-events-none overflow-hidden ${
                        isCardHovered ? "translate-y-[100%]" : "translate-y-[-100%] group-hover:translate-y-[100%]"
                      }`} />

                      {/* Timeline Diamond Node */}
                      <div className={`absolute left-[-31px] md:left-[-54px] top-7 w-2.5 h-2.5 rotate-45 border z-10 transition-all duration-300 ${
                        isCardHovered 
                          ? "border-ted-red bg-ted-red" 
                          : "border-ted-red bg-ted-red md:bg-black md:border-white/30 md:group-hover:border-ted-red md:group-hover:bg-ted-red"
                      } ${item.type === "session" ? "shadow-[0_0_8px_rgba(235,0,40,0.5)] border-ted-red" : ""}`} />

                      {/* Left Side Time Block (Monospace, desktop absolute position) */}
                      {item.time && (
                        <div className={`absolute left-[-152px] top-4 w-28 text-right pr-6 hidden md:flex flex-col items-end justify-start gap-1 font-mono text-base font-black tracking-tight transition-colors duration-300 ${
                          isCardHovered ? "text-ted-red" : "text-white group-hover:text-ted-red"
                        }`}>
                          <div className="flex items-center gap-1">
                            <span>{item.time.split(" to ")[0].split(" ")[0]}</span>
                            <span className={`text-[10px] uppercase transition-colors duration-300 ${
                              isCardHovered ? "text-ted-red/60" : "text-white group-hover:text-ted-red/60"
                            }`}>{item.time.split(" to ")[0].split(" ")[1]}</span>
                          </div>
                          {item.time.includes(" to ") && (
                            <>
                              <div className="text-white/40 text-xs pr-4">-</div>
                              <div className="flex items-center gap-1">
                                <span>{item.time.split(" to ")[1].split(" ")[0]}</span>
                                <span className={`text-[10px] uppercase transition-colors duration-300 ${
                                  isCardHovered ? "text-ted-red/60" : "text-white group-hover:text-ted-red/60"
                                }`}>{item.time.split(" to ")[1].split(" ")[1]}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Card Main Info */}
                      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 text-left">
                          {/* Mobile Only Time Label */}
                          {item.time && (
                            <div className="flex md:hidden items-center gap-1.5 font-mono text-xs font-bold text-white">
                              <Clock className="w-3.5 h-3.5 text-white" />
                              <span>{item.time}</span>
                            </div>
                          )}

                          <h4 className={`text-lg sm:text-xl font-bold tracking-tight uppercase transition-colors duration-300 ${
                            isCardHovered ? "text-ted-red" : "text-white group-hover:text-ted-red"
                          }`}>
                            {item.event}
                          </h4>

                          {/* Meta tags */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-white uppercase tracking-widest pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-white md:text-ted-red" />
                              <span>{item.location}</span>
                            </span>
                            {item.type === "session" && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-white" />
                                <span className="text-white">{item.speaker}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right HUD status indicator and chevron toggle */}
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                          <span className="font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5 text-white">
                            <Radio className={`w-2.5 h-2.5 ${item.type === "session" ? "text-ted-red animate-pulse" : "text-white"}`} />
                            <span>{item.type === "session" ? "[ LIVE_SESSION ]" : "[ COFFE_BREAK ]"}</span>
                          </span>
                          <div className={`flex items-center gap-1 transition-colors text-[9px] uppercase font-mono tracking-wider ${
                            isCardHovered ? "text-ted-red" : "text-white group-hover:text-ted-red"
                          }`}>
                            <span>{isExpanded ? "Less" : "Info"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>

                      {/* Smooth Expandable Description panel */}
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden w-full text-left"
                      >
                        <div className="border-t border-white/5 mt-4 pt-4 flex flex-col gap-3">
                          <span className="text-white text-[8px] font-mono uppercase tracking-widest">[ BRIEF_STATEMENT ]</span>
                          <p className="text-white text-xs sm:text-sm leading-relaxed font-light font-mono max-w-3xl">
                            {item.desc}
                          </p>
                        </div>
                      </motion.div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-10 md:p-16 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-xl rounded-bl-xl shadow-2xl flex flex-col items-center text-center max-w-3xl mx-auto mt-12 relative overflow-hidden"
          >
            {/* Tech Corner Accent brackets */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/20" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/20" />
            
            {/* Pulsing indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[10px] uppercase tracking-widest font-black font-mono mb-8 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-ted-red" />
              Chronology Locked
            </div>

            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight uppercase text-white mb-6">
              THE JOURNEY <br />
              TAKES <span className="text-ted-red">SHAPE SOON</span>
            </h3>

            <div className="h-[1.5px] w-20 bg-ted-red mb-6" />

            <p className="text-white/60 text-sm md:text-base font-light leading-relaxed max-w-xl font-mono">
              We are currently finalizing the sequence of paradigm-shifting ideas and talks. The official event chronology will unlock upon the official date announcement.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
