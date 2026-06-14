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
  Mic, 
  Compass, 
  Zap, 
  Activity
} from "lucide-react";

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

const speakers = [
  { 
    id: 1, 
    name: "Dr. Sarah Chen", 
    topic: "The Future of AI Ethics", 
    size: "large",
    bio: "Sarah is a research fellow at the Institute for Human-Centered AI, studying algorithmic accountability and ethics in large-scale generative models.",
    details: "Ph.D. in Computer Science from Stanford. Former lead ethical researcher at DeepMind.",
    icon: Cpu
  },
  { 
    id: 2, 
    name: "Marcus Thorne", 
    topic: "Urban Rewilding", 
    size: "small",
    bio: "An environmental architect specializing in integrating bio-diverse ecosystems into skyscrapers and urban infrastructure.",
    details: "Founder of GreenGrid Studios. TED Senior Fellow and designer of Milan's Vertical Forests.",
    icon: Globe
  },
  { 
    id: 3, 
    name: "Aisha Roberts", 
    topic: "Quantum Storytelling", 
    size: "medium",
    bio: "A media theorist exploring the application of quantum physics concepts to interactive narratives and digital media.",
    details: "Professor of Digital Media at MIT. Author of 'Schrödinger's Screen'.",
    icon: Sparkles
  },
  { 
    id: 4, 
    name: "Julian Voss", 
    topic: "The Sound of Silence", 
    size: "small",
    bio: "A sound designer and acoustician researching the neurological effects of absolute silence in high-noise environments.",
    details: "Acoustic consultant for NASA's quiet spacecraft initiative. Winner of multiple sound engineering awards.",
    icon: Compass
  },
  { 
    id: 5, 
    name: "Elena Rodriguez", 
    topic: "Bionic Architecture", 
    size: "medium",
    bio: "A pioneer in bio-inspired building design, building self-heating and self-cooling living structures using synthetic materials.",
    details: "Dean of Architecture at Barcelona Tech. Pioneer in biological-material printing.",
    icon: Zap
  },
  { 
    id: 6, 
    name: "Kenji Tanaka", 
    topic: "Minimalist Mathematics", 
    size: "small",
    bio: "A mathematician and author discovering elegance and simple geometry in chaotic topological networks.",
    details: "Fields Medalist. Research focuses on topological data analysis in social network graphs.",
    icon: Activity
  },
];

export default function Speakers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedSpeaker, setSelectedSpeaker] = useState<{
    id: number;
    name: string;
    topic: string;
    bio: string;
    details: string;
  } | null>(null);

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    // Listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update particle coordinates
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce or wrap particles
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        // Flee interaction from cursor
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
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

      // Draw interactive connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Draw connections to the cursor coordinate
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const alpha = (1 - dist / mouseRadius) * 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(235, 0, 40, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Draw connections to neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.45;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-black select-none">
      
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
          className="mb-16 text-center sm:text-left"
        >
          <span className="text-ted-red font-bold text-sm uppercase tracking-[0.25em] mb-3 block">The Lineup</span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tight uppercase">
            FEATURED <span className="text-ted-red">SPEAKERS</span>
          </h2>
        </motion.div>

        {/* Speakers Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {speakers.map((speaker, index) => {
            const SpeakerIcon = speaker.icon;
            return (
              <motion.div
                key={speaker.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => setSelectedSpeaker(speaker)}
                className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-end p-8 transition-all hover:border-ted-red/35 hover:bg-white/[0.04] cursor-pointer ${
                  speaker.size === "large" ? "md:col-span-2 md:row-span-2" : 
                  speaker.size === "medium" ? "md:col-span-1 md:row-span-2" : "md:col-span-1 md:row-span-1"
                }`}
              >
                {/* Radial glow accent on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(250px_circle_at_center,rgba(235,0,40,0.07),transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Visual placeholder inside card */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <SpeakerIcon className="w-20 h-20 text-white/[0.01] group-hover:text-ted-red/[0.06] group-hover:scale-110 transition-all duration-500" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-1 pointer-events-none" />

                <div className="relative z-10">
                  <span className="text-ted-red text-xs font-bold uppercase tracking-[0.2em] block mb-1">Speaker</span>
                  <h4 className="text-2xl font-black italic text-white mb-1">{speaker.name}</h4>
                  <p className="text-white/60 text-sm group-hover:text-white transition-colors">{speaker.topic}</p>
                </div>
                
                {/* Corner Expand Indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-ted-red/40">
                    <span className="text-ted-red text-xs font-bold">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Speaker Inspection Modal */}
      <AnimatePresence>
        {selectedSpeaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSpeaker(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-ted-dark-gray/95 border border-white/10 rounded-3xl p-8 relative cursor-default overflow-hidden backdrop-blur-xl shadow-2xl"
            >
              {/* Radial glow background accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-ted-red/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedSpeaker(null)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ted-red/20 to-ted-red/5 border border-ted-red/35 flex items-center justify-center mb-6">
                  <Mic className="w-9 h-9 text-ted-red" />
                </div>
                
                <h3 className="text-2xl font-black italic text-white mb-1">{selectedSpeaker.name}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-ted-red font-bold mb-4">{selectedSpeaker.topic}</p>
                
                <p className="text-white/80 text-sm leading-relaxed max-w-md mb-6 italic">
                  &ldquo;{selectedSpeaker.bio}&rdquo;
                </p>

                <p className="text-white/50 text-xs leading-relaxed max-w-md mb-8 border-t border-white/5 pt-4">
                  {selectedSpeaker.details}
                </p>
                
                <div className="flex gap-6 w-full justify-center text-[10px] uppercase font-bold tracking-wider">
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-ted-red transition-all duration-300 flex items-center gap-1.5"
                  >
                    <Linkedin className="w-4.5 h-4.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-ted-red transition-all duration-300 flex items-center gap-1.5"
                  >
                    <Instagram className="w-4.5 h-4.5" />
                    <span>Instagram</span>
                  </a>
                  <a 
                    href={`mailto:speakers@tedxgcem.com`} 
                    className="text-white/40 hover:text-ted-red transition-all duration-300 flex items-center gap-1.5"
                  >
                    <Mail className="w-4.5 h-4.5" />
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
