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
import slImg from "../../../public/SLIMG.webp";

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
  onModalToggle?: (isOpen: boolean) => void;
}

// Module-level in-memory cache for instant tab switching (0ms delay)
let globalSpeakersCache: Speaker[] | null = null;

export default function Speakers({ settings, onModalToggle }: SpeakersProps) {
  
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
    onModalToggle?.(Boolean(selectedSpeaker));
    if (selectedSpeaker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedSpeaker, onModalToggle]);

  useEffect(() => {
    if (!selectedSpeaker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedSpeaker(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSpeaker]);

  useEffect(() => {
    return () => {
      onModalToggle?.(false);
      document.body.style.overflow = "";
    };
  }, [onModalToggle]);

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
          <div className="h-[1.5px] w-20 bg-ted-red" />
        </motion.div>

        {/* Speakers Grid - 2 per row, compact size, centered */}
        {settings?.reveal_speakers !== false ? (
          speakers.length > 0 ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-8 mx-auto items-start"
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
                    style={{ maxWidth: BOX_SETTINGS.width, height: "auto" }}
                    data-index={index}
                  >
                    {/* Fluid Image Frame Container - Auto-adjusts to image height */}
                    <div className="relative w-full mb-4">
                      {/* Behind Shadow Layer - Hugs exact dynamic image height */}
                      <div className={`absolute inset-0 bg-ted-red rounded-2xl transform transition-transform duration-300 ease-out z-0 ${
                        isCardHovered 
                          ? "translate-x-2.5 translate-y-2.5" 
                          : "translate-x-2.5 translate-y-2.5 md:translate-x-0 md:translate-y-0 md:group-hover:translate-x-2.5 md:group-hover:translate-y-2.5"
                      }`} />
                      
                      {/* Front Image Frame - Fits image tightly with zero letterboxing */}
                      <div className={`relative rounded-2xl overflow-hidden border bg-zinc-950 z-10 transition-[transform,border-color] duration-300 ease-out ${
                        isCardHovered
                          ? "border-ted-red/30 -translate-x-1 -translate-y-1"
                          : "border-white/15 group-hover:border-ted-red/30 -translate-x-1 -translate-y-1 md:translate-x-0 md:translate-y-0 md:group-hover:-translate-x-1 md:group-hover:-translate-y-1"
                      }`}>
                        <img 
                          src={speaker.photo} 
                          alt={speaker.name} 
                          className={`w-full h-auto block object-contain transition-[transform,filter] duration-300 ease-out transform-gpu [will-change:transform,filter] ${
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
            className="fixed inset-0 z-[100] bg-[#070708] flex flex-col md:flex-row cursor-pointer overflow-hidden"
          >
            {/* Unified Stage Spotlight & Dot Matrix Texture */}
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: "radial-gradient(circle at 40% 50%, rgba(235,0,40,0.15) 0%, transparent 70%)",
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none opacity-15 z-0"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "22px 22px"
              }}
            />

            {/* Close Button - Fixed in the top-right corner of the screen */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSpeaker(null);
              }}
              className="fixed top-5 right-5 md:top-6 md:right-8 text-white/80 hover:text-white transition-all p-3 rounded-full bg-black/70 backdrop-blur-md hover:bg-ted-red z-[110] border border-white/20 hover:border-ted-red cursor-pointer shadow-2xl group flex items-center justify-center"
              aria-label="Close speaker specs"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* Left Panel - Spotlight Presenter Display (Fixed & Pinned) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[48%] h-[42dvh] md:h-full relative overflow-hidden flex items-center justify-center p-6 sm:p-10 md:p-14 cursor-default shrink-0 border-b md:border-b-0 md:border-r border-white/10 z-10"
            >
              {/* Status pill tag at top left of photo area */}
              <div className="absolute top-6 left-6 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-ted-red animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">
                  TEDxGCEM 2026 Keynote
                </span>
              </div>

              {/* Photo Frame Container with Tech Corner Brackets */}
              <div className="relative z-20 w-full h-full max-h-[82vh] flex items-center justify-center">
                {/* Tech Corner Brackets */}
                <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-ted-red z-30" />
                <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-ted-red z-30" />
                <div className="absolute -bottom-3 -left-3 w-4 h-4 border-b-2 border-l-2 border-ted-red z-30" />
                <div className="absolute -bottom-3 -right-3 w-4 h-4 border-b-2 border-r-2 border-ted-red z-30" />

                <img 
                  src={selectedSpeaker.photo} 
                  alt={selectedSpeaker.name} 
                  className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
                />
              </div>
            </motion.div>

            {/* Right Panel - Scrollable Editorial Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[52%] h-[58dvh] md:h-full flex flex-col justify-start p-6 sm:p-10 md:p-14 lg:p-16 cursor-default relative overflow-y-auto shrink-0 z-10 [scrollbar-width:thin] [scrollbar-color:rgba(235,0,40,0.4)_transparent]"
            >
              <div className="max-w-2xl w-full mx-auto space-y-6 md:space-y-8 text-left my-auto py-6 relative z-10">
                {/* Speaker's name & badge */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-ted-red text-[10px] font-bold uppercase tracking-[0.25em] font-mono">
                      {"// OFFICIAL SPEAKER PROFILE"}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black italic tracking-tighter leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80 break-words">
                    {selectedSpeaker.name}
                  </h3>
                  {selectedSpeaker.designation && (
                    <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/30 text-ted-red text-xs font-mono font-bold uppercase tracking-wider">
                      <span>🎤</span>
                      <span>{selectedSpeaker.designation}</span>
                    </div>
                  )}
                </div>

                {/* Glassmorphic Biography - Frosted glass with red neon accent rail */}
                {selectedSpeaker.bio && (
                  <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.04] border border-white/10 border-t-white/20 border-l-[3px] border-l-ted-red backdrop-blur-xl p-4 sm:p-5 space-y-2 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-ted-red text-[10px] uppercase font-mono tracking-widest font-bold block">
                        {"// BIOGRAPHY"}
                      </span>
                    </div>
                    <p className="text-white/90 text-xs sm:text-sm md:text-[15px] leading-relaxed italic font-light whitespace-pre-line">
                      &ldquo;{selectedSpeaker.bio}&rdquo;
                    </p>
                  </div>
                )}

                {/* Glassmorphic Background - Cohesive frosted panel */}
                {selectedSpeaker.details && (
                  <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.05] via-white/[0.01] to-white/[0.03] border border-white/10 border-t-white/15 backdrop-blur-xl p-4 sm:p-5 space-y-2 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ted-red" />
                      <span className="text-white/50 text-[10px] uppercase font-mono tracking-widest font-bold">
                        Background
                      </span>
                    </div>
                    <p className="text-white/75 text-xs sm:text-[13px] md:text-sm leading-relaxed font-light pl-3.5 whitespace-pre-line">
                      {selectedSpeaker.details}
                    </p>
                  </div>
                )}

                {/* Full-width custom contact buttons (only rendered if links exist) */}
                {(() => {
                  const hasLinkedin = Boolean(selectedSpeaker.linkedin && selectedSpeaker.linkedin.trim());
                  const hasInstagram = Boolean(selectedSpeaker.instagram && selectedSpeaker.instagram.trim());
                  const hasEmail = Boolean(selectedSpeaker.email && selectedSpeaker.email.trim());

                  if (!hasLinkedin && !hasInstagram && !hasEmail) return null;

                  const linkedinUrl = selectedSpeaker.linkedin?.trim().startsWith("http")
                    ? selectedSpeaker.linkedin.trim()
                    : `https://${selectedSpeaker.linkedin?.trim()}`;

                  const rawInsta = selectedSpeaker.instagram?.trim().replace(/^@/, "");
                  const instaUrl = rawInsta?.startsWith("http") ? rawInsta : `https://instagram.com/${rawInsta}`;

                  return (
                    <div className="flex flex-row flex-wrap gap-2.5 pt-2 w-full">
                      {hasLinkedin && (
                        <a 
                          href={linkedinUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[120px] py-3 px-4 border border-white/10 hover:border-blue-500/50 bg-white/[0.03] hover:bg-blue-500/10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold uppercase tracking-wider text-[9px] sm:text-[11px] text-white shadow-lg"
                        >
                          <Linkedin className="w-4 h-4 text-blue-400" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {hasInstagram && (
                        <a 
                          href={instaUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[120px] py-3 px-4 border border-white/10 hover:border-pink-500/50 bg-white/[0.03] hover:bg-pink-500/10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold uppercase tracking-wider text-[9px] sm:text-[11px] text-white shadow-lg"
                        >
                          <Instagram className="w-4 h-4 text-pink-400" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {hasEmail && (
                        <a 
                          href={`mailto:${selectedSpeaker.email?.trim()}`} 
                          className="flex-1 min-w-[120px] py-3 px-4 border border-white/10 hover:border-ted-red bg-white/[0.03] hover:bg-ted-red/15 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold uppercase tracking-wider text-[9px] sm:text-[11px] text-white shadow-lg"
                        >
                          <Mail className="w-4 h-4 text-ted-red" />
                          <span>Email PR</span>
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
