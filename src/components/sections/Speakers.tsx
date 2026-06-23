"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Sparkles, 
  Globe, 
  Mail, 
  X, 
  Cpu, 
  Compass, 
  Zap, 
  Activity
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const DEFAULT_SPEAKERS = [
  { 
    id: "1", 
    name: "Dr. Sarah Chen", 
    designation: "Neuroscientist & Author", 
    size: "large",
    bio: "Sarah is a research fellow at the Institute for Human-Centered AI, studying algorithmic accountability and ethics in large-scale generative models.",
    details: "Ph.D. in Computer Science from Stanford. Former lead ethical researcher at DeepMind.",
    icon: Cpu,
    photo: slImg.src
  },
  { 
    id: "2", 
    name: "Marcus Thorne", 
    designation: "Founder & CEO, Future Labs", 
    size: "small",
    bio: "An environmental architect specializing in integrating bio-diverse ecosystems into skyscrapers and urban infrastructure.",
    details: "Founder of GreenGrid Studios. TED Senior Fellow and designer of Milan's Vertical Forests.",
    icon: Globe,
    photo: slImg.src
  },
  { 
    id: "3", 
    name: "Aisha Roberts", 
    designation: "Digital Media Theorist", 
    size: "medium",
    bio: "A media theorist exploring the application of quantum physics concepts to interactive narratives and digital media.",
    details: "Professor of Digital Media at MIT. Author of 'Schrödinger's Screen'.",
    icon: Sparkles,
    photo: slImg.src
  },
  { 
    id: "4", 
    name: "Julian Voss", 
    designation: "Sound Designer & Acoustician", 
    size: "small",
    bio: "A sound designer and acoustician researching the neurological effects of absolute silence in high-noise environments.",
    details: "Acoustic consultant for NASA's quiet spacecraft initiative. Winner of multiple sound engineering awards.",
    icon: Compass,
    photo: slImg.src
  },
  { 
    id: "5", 
    name: "Elena Rodriguez", 
    designation: "Bionic Architecture Pioneer", 
    size: "medium",
    bio: "A pioneer in bio-inspired building design, building self-heating and self-cooling living structures using synthetic materials.",
    details: "Dean of Architecture at Barcelona Tech. Pioneer in biological-material printing.",
    icon: Zap,
    photo: slImg.src
  },
  { 
    id: "6", 
    name: "Kenji Tanaka", 
    designation: "Mathematician & Author", 
    size: "small",
    bio: "A mathematician and author discovering elegance and simple geometry in chaotic topological networks.",
    details: "Fields Medalist. Research focuses on topological data analysis in social network graphs.",
    icon: Activity,
    photo: slImg.src
  },
];

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

export default function Speakers({ settings }: SpeakersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [speakers, setSpeakers] = useState<Speaker[]>(DEFAULT_SPEAKERS);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    fetch("/api/speakers")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.speakers && data.speakers.length > 0) {
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

  const resumeCanvasRef = useRef<(() => void) | null>(null);

  // Disable body scroll and hide mobile hamburger when modal is open
  useEffect(() => {
    if (selectedSpeaker) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [selectedSpeaker]);

  // Dynamically calculate the maximum width of the grid based on the card width + gap (32px / 2rem)
  const gridMaxWidth = `calc((${BOX_SETTINGS.width} * 2) + 2rem)`;

  // Particle constellation network simulation (matching About page theme)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 85;
    const connectionDistance = 110;
    const mouseRadius = 140;

    const mouse = { x: -1000, y: -1000 };

    let canvasRect = canvas.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX - canvasRect.left;
      mouse.y = e.clientY - canvasRect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        canvasRect = canvas.getBoundingClientRect();
      }
    };

    const handleScroll = () => {
      canvasRect = canvas.getBoundingClientRect();
    };

    // Listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // Initial sizing
    handleResize();

    // Spawn particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 0.8,
        // 75% red nodes, 25% white nodes
        color: Math.random() > 0.25 ? "235, 0, 40" : "255, 255, 255",
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      // Pause canvas drawing and calculations when the speaker bio modal is open.
      if (selectedSpeakerRef.current) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update particle coordinates
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce or wrap particles
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        // Flee interaction from cursor (optimized with squared distance)
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const mouseRadiusSq = mouseRadius * mouseRadius;
          if (distSq < mouseRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 1.5;
            p.y += Math.sin(angle) * force * 1.5;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, 0.75)`;
        ctx.fill();
      });

      // 1. Draw connections to the cursor coordinate (batched to a single stroke draw call)
      if (mouse.x !== -1000 && mouse.y !== -1000) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(235, 0, 40, 0.25)";
        ctx.lineWidth = 0.7;
        const mouseRadiusSq = mouseRadius * mouseRadius;
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
          }
        });
        ctx.stroke();
      }

      // 2. Draw connections to neighboring particles (batched to a single stroke draw call)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 0.45;
      const connDistSq = connectionDistance * connectionDistance;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    resumeCanvasRef.current = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 relative overflow-hidden select-none">
      
      {/* Fullscreen Particle Constellation Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-55"
      />

      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black pointer-events-none z-0" />

      {/* Background ambient blurring light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-ted-red/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-ted-red/5 rounded-full blur-[130px]" />
      </div>

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
      <AnimatePresence onExitComplete={() => {
        if (resumeCanvasRef.current) {
          resumeCanvasRef.current();
        }
      }}>
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
