"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Mail, 
  X 
} from "lucide-react";
import slImg from "../../../public/SLIMG.png";

// Local SVG social icons for maximum compatibility
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


// --- MANUAL SPEAKER BOX ADJUSTMENTS ---
// Adjust the width, height, and photo aspect ratio of the speaker cards here.
// You can use any valid CSS length values (e.g. "300px", "280px", "100%", "auto", etc.).
const BOX_SETTINGS = {
  width: "500px",       // Width of each speaker card
  height: "auto",       // Height of each speaker card ("auto" is recommended)
  aspectRatio: "1.5",   // Aspect ratio of the photo frame (e.g. "1.5" or "4/3" for landscape, "4/5" for portrait)
};

interface Speaker {
  id: string | number;
  name: string;
  designation?: string;
  bio: string;
  details: string;
  photo: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
}

interface DBSpeaker {
  id: string;
  name: string;
  designation: string;
  bio: string;
  details: string;
  image_url?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
}

interface SpeakersProps {
  settings?: {
    reveal_speakers?: boolean;
  } | null;
}

// Module-level in-memory cache for instant tab switching (0ms delay)
let globalSpeakersCache: Speaker[] | null = null;

export default function Speakers({ settings }: SpeakersProps) {
  
  const [speakers, setSpeakers] = useState<Speaker[]>(globalSpeakersCache || []);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    fetch("/api/speakers")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.speakers)) {
          const formatted = data.speakers.map((s: DBSpeaker) => ({
            id: s.id,
            name: s.name,
            designation: s.designation,
            bio: s.bio,
            details: s.details,
            photo: s.image_url || slImg.src,
            email: s.email,
            linkedin: s.linkedin,
            instagram: s.instagram
          }));
          globalSpeakersCache = formatted;
          setSpeakers(formatted);
        }
      })
      .catch((err) => console.error("Error loading dynamic speakers:", err));
  }, []);

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
        return;
      }
      const card = element.closest(".speaker-card");
      if (card) {
        const indexStr = card.getAttribute("data-index");
        if (indexStr !== null) {
          setHoveredCardIndex(parseInt(indexStr, 10));
          return;
        }
      }
      setHoveredCardIndex(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const selectedSpeakerRef = useRef<typeof selectedSpeaker>(null);
  useEffect(() => {
    selectedSpeakerRef.current = selectedSpeaker;
  }, [selectedSpeaker]);

  // Dynamically calculate the maximum width of the grid based on the card width + gap (32px / 2rem)
  const gridMaxWidth = `calc((${BOX_SETTINGS.width} * 2) + 2rem)`;

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 relative overflow-hidden select-none">

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="mb-20 flex flex-col justify-between items-start gap-4 border-b border-white/10 pb-12 text-left"
        >
          <span className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2">{"// THE LINEUP"}</span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase">
            FEATURED <span className="text-ted-red">SPEAKERS</span>
          </h2>
        </motion.div>

        {/* Speakers Grid - 2 per row, compact size, centered */}
        {settings?.reveal_speakers !== false ? (
          speakers.length > 0 ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-8 mx-auto"
              style={{ maxWidth: gridMaxWidth }}
            >
              {speakers.map((speaker, index) => {
                const isCardHovered = hoveredCardIndex === index;
                return (
                  <motion.div
                    key={speaker.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    onClick={() => setSelectedSpeaker(speaker)}
                    className={`group relative border rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none w-full mx-auto speaker-card backdrop-blur-md ${
                      isCardHovered
                        ? "border-ted-red/50 bg-white/[0.07] shadow-[0_0_25px_rgba(235,0,40,0.08)]"
                        : "border-white/15 bg-white/[0.04] hover:bg-white/[0.07] hover:border-ted-red/50"
                    }`}
                    style={{ maxWidth: BOX_SETTINGS.width, height: BOX_SETTINGS.height }}
                    data-index={index}
                  >
                    {/* Asymmetric Polaroid Frame Container (Portrait Aspect Ratio) */}
                    <div 
                      className="relative w-full mb-4"
                      style={{ aspectRatio: BOX_SETTINGS.aspectRatio }}
                    >
                      {/* Behind Shadow Layer */}
                      <div className={`absolute inset-0 bg-ted-red rounded-2xl transform transition-transform duration-300 ease-out z-0 ${
                        isCardHovered 
                          ? "translate-x-2.5 translate-y-2.5" 
                          : "translate-x-2.5 translate-y-2.5 md:translate-x-0 md:translate-y-0 md:group-hover:translate-x-2.5 md:group-hover:translate-y-2.5"
                      }`} />
                      
                      {/* Front Image Frame */}
                      <div className={`absolute inset-0 rounded-2xl overflow-hidden border bg-zinc-900 z-10 transition-[transform,border-color] duration-300 ease-out ${
                        isCardHovered
                          ? "border-ted-red/30 -translate-x-1 -translate-y-1"
                          : "border-white/15 group-hover:border-ted-red/30 -translate-x-1 -translate-y-1 md:translate-x-0 md:translate-y-0 md:group-hover:-translate-x-1 md:group-hover:-translate-y-1"
                      }`}>
                        <img 
                          src={speaker.photo} 
                          alt={speaker.name} 
                          className={`w-full h-full object-cover transition-[transform,filter] duration-300 ease-out transform-gpu [will-change:transform,filter] ${
                            isCardHovered
                              ? "grayscale-0 scale-105"
                              : "grayscale-0 md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-105"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Editorial Details Underneath */}
                    <div className="text-left mt-auto">
                      <h3 className={`text-xl sm:text-2xl font-black italic tracking-tight transition-colors duration-300 leading-tight ${
                        isCardHovered ? "text-ted-red" : "text-ted-red md:text-white md:group-hover:text-ted-red"
                      }`}>
                        {speaker.name}
                      </h3>
                      
                      {/* Designation */}
                      <p className={`text-[#A0A0A0] text-[11px] sm:text-xs font-medium tracking-wide mt-2.5 transition-all duration-300 ease-out ${
                        isCardHovered ? "opacity-100" : "opacity-65 group-hover:opacity-100"
                      }`}>
                        {speaker.designation}
                      </p>
                      
                      {/* Active hover dash line */}
                      <div className={`h-[2px] bg-ted-red mt-4 transition-[width] duration-300 ease-out ${
                        isCardHovered ? "w-12" : "w-12 md:w-0 md:group-hover:w-12"
                      }`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="border border-white/10 p-12 rounded-3xl bg-white/[0.02] text-center max-w-xl mx-auto space-y-2">
              <p className="text-white/60 font-mono text-xs uppercase tracking-widest">
                Speaker lineup to be announced soon
              </p>
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className="border-2 border-white/10 p-12 bg-black/40 text-center space-y-4 max-w-2xl mx-auto shadow-[6px_6px_0px_0px_#EB0028] relative overflow-hidden">
              <div className="absolute -top-[1.5px] -left-[1.5px] w-3 h-3 border-t-2 border-l-2 border-ted-red" />
              <div className="absolute -top-[1.5px] -right-[1.5px] w-3 h-3 border-t-2 border-r-2 border-ted-red" />
              <div className="absolute -bottom-[1.5px] -left-[1.5px] w-3 h-3 border-b-2 border-l-2 border-ted-red" />
              <div className="absolute -bottom-[1.5px] -right-[1.5px] w-3 h-3 border-b-2 border-r-2 border-ted-red" />
              
              <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white leading-tight">
                Speaker Lineup
              </h3>
              <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-ted-red leading-none">
                Coming Soon
              </h3>
              
              <div className="h-[1.5px] w-12 bg-ted-red/30 mx-auto my-2" />
              
              <p className="text-white/60 font-mono tracking-[0.2em] uppercase text-xs">
                STAY TUNED FOR REVEALS
              </p>
            </div>
          </motion.div>
        )}

      </div>

      {/* Cinematic Left & Right Split-Screen Overlay */}
      <AnimatePresence>
        {selectedSpeaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={() => setSelectedSpeaker(null)}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col md:flex-row cursor-pointer overflow-hidden"
          >
            {/* Close Button - Fixed in the top-right corner of the screen */}
            <button 
              onClick={() => setSelectedSpeaker(null)}
              className="fixed top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 z-50 border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Left Panel - Portrait & Info vignette */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[45%] h-[38dvh] md:h-full relative overflow-hidden bg-black flex flex-col justify-end p-6 md:p-8 cursor-default shrink-0 [will-change:transform]"
            >
              {/* Border Frame Overlay */}
              <div className="absolute inset-0 border-2 border-ted-red/40 pointer-events-none z-30 border-b-0 md:border-b-2 md:border-r-0" />

              {/* Giant Presenter Portrait */}
              <img 
                src={selectedSpeaker.photo} 
                alt={selectedSpeaker.name} 
                className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-90 saturate-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none z-10" />
              
              {/* Tech Metadata Tags */}
              <div className="relative z-20 font-mono text-[10px] text-ted-red tracking-widest uppercase flex flex-col gap-2">
                <span className="bg-ted-red/20 border border-ted-red/40 px-3 py-1 rounded w-fit">
                  [ TARGET: DETECTED ]
                </span>
                <span className="text-white/60">
                  {"// LIVE DOSSIER STREAM"}
                </span>
              </div>
            </motion.div>

            {/* Right Panel - Terminal Dashboard */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[55%] h-[62dvh] md:h-full bg-[#0a0a0a] flex flex-col justify-start md:justify-center p-6 sm:p-12 md:p-16 cursor-default relative overflow-y-auto shrink-0 [will-change:transform]"
            >
              {/* Border Frame Overlay */}
              <div className="absolute inset-0 border-2 border-ted-red/40 pointer-events-none z-30" />

              <div className="max-w-2xl w-full mx-auto space-y-4 md:space-y-8 text-left py-2 md:py-0">
                {/* Speaker's name in giant italic typography */}
                <div>
                  <span className="text-ted-red text-[10px] font-bold uppercase tracking-[0.2em] font-mono block mb-2">
                    {"// SPEAKER SPECS"}
                  </span>
                  <h3 className="text-3xl sm:text-5xl md:text-7xl font-black italic text-white tracking-tighter leading-none">
                    {selectedSpeaker.name}
                  </h3>
                  <p className="text-white/50 text-xs tracking-widest font-mono mt-2">
                    {selectedSpeaker.designation}
                  </p>
                </div>



                {/* Stylized biography quotes */}
                <div className="space-y-2">
                  <span className="text-white/30 text-[9px] uppercase font-mono tracking-widest block">Biography</span>
                  <p className="text-white/90 text-xs sm:text-base leading-relaxed italic font-light">
                    &ldquo;{selectedSpeaker.bio}&rdquo;
                  </p>
                </div>

                {/* Qualifications & background details */}
                <div className="space-y-2 border-t border-white/5 pt-4 md:pt-6">
                  <span className="text-white/30 text-[9px] uppercase font-mono tracking-widest block">Credentials & details</span>
                  <p className="text-white/60 text-[10px] sm:text-sm leading-relaxed font-light font-mono">
                    {selectedSpeaker.details}
                  </p>
                </div>

                {/* Full-width custom contact buttons */}
                <div className="flex flex-row gap-2 pt-2 w-full">
                  {selectedSpeaker.linkedin ? (
                    <a 
                      href={selectedSpeaker.linkedin} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 border border-white/10 hover:border-ted-red/40 bg-white/[0.02] hover:bg-ted-red/10 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] text-white"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-white/60" />
                      <span>LinkedIn</span>
                    </a>
                  ) : (
                    <div 
                      className="flex-1 py-2.5 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] text-white/20 cursor-not-allowed select-none"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-white/10" />
                      <span>LinkedIn</span>
                    </div>
                  )}
                  {selectedSpeaker.instagram ? (
                    <a 
                      href={selectedSpeaker.instagram} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 border border-white/10 hover:border-ted-red/40 bg-white/[0.02] hover:bg-ted-red/10 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] text-white"
                    >
                      <Instagram className="w-3.5 h-3.5 text-white/60" />
                      <span>Instagram</span>
                    </a>
                  ) : (
                    <div 
                      className="flex-1 py-2.5 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] text-white/20 cursor-not-allowed select-none"
                    >
                      <Instagram className="w-3.5 h-3.5 text-white/10" />
                      <span>Instagram</span>
                    </div>
                  )}
                  <a 
                    href={`mailto:${selectedSpeaker.email || "speakers@tedxgcem.com"}`} 
                    className="flex-1 py-2.5 border border-white/10 hover:border-ted-red/40 bg-white/[0.02] hover:bg-ted-red/10 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] text-white"
                  >
                    <Mail className="w-3.5 h-3.5 text-white/60" />
                    <span>Email PR</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
