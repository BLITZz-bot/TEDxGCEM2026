"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, User, ChevronDown, ChevronUp, Radio } from "lucide-react";

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
    time: "09:00 AM", 
    event: "Registration & Morning Coffee", 
    type: "break",
    location: "Lounge // Grid_C",
    speaker: "All Attendees",
    desc: "Collect your custom access passes, badges, and curated welcome kits. Connect with fellow attendees over fresh hot brews before the main event."
  },
  { 
    time: "10:00 AM", 
    event: "Opening Ceremony", 
    type: "session",
    location: "Main Auditorium // Grid_A",
    speaker: "TEDx Committee",
    desc: "An immersive sensory and visual introduction to the core themes of TEDxGCEM 2026. Setting the blueprint for the day's ideas."
  },
  { 
    time: "10:30 AM", 
    event: "The Digital Frontier", 
    type: "session",
    location: "Main Auditorium // Grid_A",
    speaker: "Dr. Sarah Chen",
    desc: "A deep dive into AI ethics, algorithmic accountability, and the upcoming landscape of human-AI collaborative systems."
  },
  { 
    time: "12:00 PM", 
    event: "Networking Lunch", 
    type: "break",
    location: "Bistro Area // Grid_D",
    speaker: "Community Space",
    desc: "A catered lunch break designed to match attendees with shared research fields and interests in modular collaborative hubs."
  },
  { 
    time: "01:30 PM", 
    event: "Urban Rewilding & Bionic Architecture", 
    type: "session",
    location: "Main Auditorium // Grid_A",
    speaker: "Marcus Thorne & Elena Rodriguez",
    desc: "Co-designing carbon-neutral vertical forests, bio-mimetic skyscrapers, and self-regulating structural building materials for the next century."
  },
  { 
    time: "03:00 PM", 
    event: "Afternoon Tea & Unwind", 
    type: "break",
    location: "Lounge // Grid_C",
    speaker: "All Attendees",
    desc: "Take a break, recharge, and explore the interactive bionic material exhibits in the foyer."
  },
  { 
    time: "04:00 PM", 
    event: "Quantum Storytelling & Mathematics", 
    type: "session",
    location: "Main Auditorium // Grid_A",
    speaker: "Aisha Roberts & Kenji Tanaka",
    desc: "Bridging the boundaries between topological network algorithms, quantum probability mechanics, and next-gen digital interactive narratives."
  },
  { 
    time: "05:30 PM", 
    event: "Closing Remarks & Panel", 
    type: "session",
    location: "Main Auditorium // Grid_A",
    speaker: "All Speakers",
    desc: "Synthesis of the concepts discussed throughout the day. Final Q&A session with the full featured speakers panel."
  },
];

export default function Schedule() {
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

  const filteredSchedule = schedule.filter(item => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const filters = [
    { id: "all", label: "ALL EVENTS" },
    { id: "session", label: "TALKS & PANELS" },
    { id: "break", label: "BREAKS & NETWORKS" }
  ];

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
        </motion.div>

        {/* Cyber-Brutalist Tabs */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 mb-16 w-full">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            const isBtnHovered = hoveredFilterId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id as any);
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
              const originalIndex = schedule.findIndex(s => s.event === item.event);
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
                  <div className={`absolute left-[-152px] top-6 w-28 text-right pr-6 hidden md:flex items-center justify-end gap-2 font-mono text-base font-black tracking-tight transition-colors duration-300 ${
                    isCardHovered ? "text-ted-red" : "text-white group-hover:text-ted-red"
                  }`}>
                    <span>{item.time.split(" ")[0]}</span>
                    <span className={`text-[10px] uppercase transition-colors duration-300 ${
                      isCardHovered ? "text-ted-red/60" : "text-white group-hover:text-ted-red/60"
                    }`}>{item.time.split(" ")[1]}</span>
                  </div>

                  {/* Card Main Info */}
                  <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 text-left">
                      {/* Mobile Only Time Label */}
                      <div className="flex md:hidden items-center gap-1.5 font-mono text-xs font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-white" />
                        <span>{item.time}</span>
                      </div>

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
      </div>
    </section>
  );
}
