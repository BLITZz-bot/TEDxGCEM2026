"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabNav, { TabId } from "@/components/ui/TabNav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Speakers from "@/components/sections/Speakers";
import Schedule from "@/components/sections/Schedule";
import Partners from "@/components/sections/Partners";
import RegisterNow from "@/components/sections/RegisterNow";
import GetMyPass from "@/components/sections/GetMyPass";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showIntro, setShowIntro] = useState(true);
  const [triggerExplosion, setTriggerExplosion] = useState(false);
  const introCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!showIntro) return;

    const canvas = introCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let triggeredExplosion = false;
    let isTerminated = false;

    interface Dot {
      x: number;
      y: number;
      cx: number;
      cy: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      isScattered: boolean;
      size: number;
    }

    interface Debris {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      angle: number;
      va: number;
      alpha: number;
      color: string;
    }

    const dots: Dot[] = [];
    const debris: Debris[] = [];
    const spacing = 35; // pixel spacing of the dots grid

    const handleResize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      initGrid();
    };

    const initGrid = () => {
      dots.length = 0;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;
      const startX = (canvas.width - (cols - 1) * spacing) / 2;
      const startY = (canvas.height - (rows - 1) * spacing) / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = startX + c * spacing;
          const y = startY + r * spacing;
          
          const isRed = Math.random() > 0.93;
          dots.push({
            x,
            y,
            cx: x,
            cy: y,
            vx: 0,
            vy: 0,
            alpha: isRed ? 0.25 : 0.08,
            color: isRed ? "235, 0, 40" : "255, 255, 255",
            isScattered: false,
            size: isRed ? 1.6 : 0.8
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const duration = 1500; // 1.5 seconds square rotation & grid scan
    const startTime = Date.now();

    const draw = () => {
      if (isTerminated) return;

      // Draw solid black background
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Draw Central Shutter (grows & spins)
      if (progress < 100) {
        ctx.save();
        ctx.translate(cx, cy);
        
        const rotationSpeed = 0.002 + (progress / 100) * 0.018;
        const angle = elapsed * rotationSpeed;
        ctx.rotate(angle);

        const size = 10 + (progress / 100) * 35;
        
        // Outer Brutalist Framing Square
        ctx.strokeStyle = "rgba(235, 0, 40, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size - 6, -size - 6, (size + 6) * 2, (size + 6) * 2);

        // Core Solid Red Shutter
        ctx.fillStyle = "rgb(235, 0, 40)";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgb(235, 0, 40)";
        ctx.fillRect(-size, -size, size * 2, size * 2);

        // White hot center insert
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.shadowBlur = 0;
        ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);

        ctx.restore();
      }

      // 2. Draw Dot Matrix Grid & Handle Disintegration
      const waveRadius = progress >= 100 ? (elapsed - duration) * 1.8 : 0;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        
        if (progress >= 100) {
          const dx = dot.cx - cx;
          const dy = dot.cy - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (!dot.isScattered) {
            if (dist < waveRadius) {
              dot.isScattered = true;
              const angle = Math.atan2(dy, dx);
              const speed = Math.random() * 8 + 4;
              dot.vx = Math.cos(angle) * speed;
              dot.vy = Math.sin(angle) * speed;
            } else {
              // Fade out un-scattered dots slightly
              dot.alpha -= 0.004;
            }
          } else {
            // Update scattered dots physics
            dot.cx += dot.vx;
            dot.cy += dot.vy;
            dot.vx *= 0.94;
            dot.vy *= 0.94;
            dot.alpha -= 0.012;
          }
        } else {
          // Subtle idle breathing wave effect before explosion
          const dx = dot.x - cx;
          const dy = dot.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(dist / 60 - elapsed / 180) * 0.04;
          dot.alpha = Math.max(0.02, (dot.color === "235, 0, 40" ? 0.25 : 0.08) + wave);
        }

        if (dot.alpha > 0) {
          ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
          ctx.fillRect(dot.cx - dot.size / 2, dot.cy - dot.size / 2, dot.size, dot.size);
        }
      }

      // 3. Draw Shutter Debris
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.angle += d.va;
        d.vx *= 0.95;
        d.vy *= 0.95;
        d.alpha -= 0.016;

        if (d.alpha <= 0) {
          debris.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.fillStyle = `rgba(${d.color}, ${d.alpha})`;
        ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
        ctx.restore();
      }

      // Continue drawing loop
      animationFrameId = requestAnimationFrame(draw);

      // Trigger the explosion states when the gathering finishes
      if (progress >= 100 && !triggeredExplosion) {
        triggeredExplosion = true;
        setTriggerExplosion(true);
        
        // Spawn shutter block debris
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 4;
          debris.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 6 + 3,
            angle: Math.random() * Math.PI,
            va: Math.random() * 0.2 - 0.1,
            alpha: 1.0,
            color: Math.random() > 0.25 ? "235, 0, 40" : "255, 255, 255"
          });
        }
        
        // Finish the intro sequence and transition to the full site reveal
        setTimeout(() => {
          isTerminated = true;
          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          setShowIntro(false);
        }, 1600);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showIntro]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleTabChange = (id: TabId) => {
    if (id === activeTab) return;
    
    // Only apply red/black curtain transition on desktop/laptop sizes (md breakpoint)
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      setIsTransitioning(true);
      
      // Switch the page content at 580ms (when screen is fully covered by red and black layers)
      setTimeout(() => {
        setActiveTab(id);
      }, 580);
      
      // Slide the curtains off the screen at 640ms
      setTimeout(() => {
        setIsTransitioning(false);
      }, 640);
    } else {
      // Mobile changes tab content immediately (mobile menu has its own transition)
      setActiveTab(id);
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return <Hero key="home" onTabChange={handleTabChange} />;
      case "about":
        return <About key="about" />;
      case "speakers":
        return <Speakers key="speakers" />;
      case "schedule":
        return <Schedule key="schedule" />;
      case "partners":
        return <Partners key="partners" />;
      case "register":
        return <RegisterNow key="register" onTabChange={handleTabChange} />;
      case "get-pass":
        return <GetMyPass key="get-pass" onTabChange={handleTabChange} />;
      case "contact":
        return <Contact key="contact" />;
      default:
        return <Hero key="home" onTabChange={handleTabChange} />;
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* First-time Opening Cinematic Intro Ripple Loader */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          className="fixed inset-0 bg-black z-[99990] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Canvas for Dot-Matrix Shutter */}
          <canvas 
            ref={introCanvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          />

          {/* Ambient Background Glow */}
          <div className="absolute w-[300px] h-[300px] bg-ted-red/10 rounded-full blur-[100px] pointer-events-none z-0" />

          {/* Shockwaves */}
          {triggerExplosion && (
            <>
              {/* Concentric Glowing Ring 1 */}
              <motion.div 
                key="shockwave-ring-1"
                initial={{ scale: 1, opacity: 0.8, x: "-50%", y: "-50%" }}
                animate={{ scale: 220, opacity: [0.8, 0.6, 0], x: "-50%", y: "-50%" }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="absolute top-1/2 left-1/2 w-4 h-4 border border-ted-red rounded-full shadow-[0_0_15px_rgba(235,0,40,0.6)] pointer-events-none z-10"
              />
              {/* Concentric Glowing Ring 2 */}
              <motion.div 
                key="shockwave-ring-2"
                initial={{ scale: 1, opacity: 0.6, x: "-50%", y: "-50%" }}
                animate={{ scale: 260, opacity: [0.6, 0], x: "-50%", y: "-50%" }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="absolute top-1/2 left-1/2 w-4 h-4 border border-white/20 rounded-full pointer-events-none z-10"
              />
            </>
          )}
        </motion.div>
      )}

      {/* Interactive Cursor Spotlight Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-20 hidden md:block"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(235, 0, 40, 0.15), transparent 80%)`
        }}
      />

      {/* Desktop Page Transition Curtain Overlay (Dual-layered staggered) */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            {/* Layer 1: Red Curtain */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 bg-ted-red z-[9998] pointer-events-none hidden md:block"
            />
            {/* Layer 2: Black Curtain (Staggered slide-in coming 150ms later) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              className="fixed inset-0 bg-black z-[9999] pointer-events-none hidden md:block"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Website Wrapper with Expanding Portal Reveal */}
      <motion.div
        initial={{ clipPath: "circle(0vmax at 50% 50%)" }}
        animate={{ 
          clipPath: !showIntro 
            ? "circle(99999px at 50% 50%)" 
            : triggerExplosion 
              ? "circle(150vmax at 50% 50%)" 
              : "circle(0vmax at 50% 50%)" 
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative w-full min-h-screen bg-black"
        style={{ zIndex: isTransitioning ? 10 : 99995 }}
      >
        {/* Navigation */}
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content with Animated Transitions */}
        <div className="relative z-10">
          <AnimatePresence>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Brutalist Footer */}
        <footer className="relative bg-black pt-24 pb-16 px-6 z-10 font-sans overflow-hidden">
          {/* Glowing top line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-ted-red/40 to-transparent" />

          {/* Dot Matrix background grid overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.25]"
            style={{
              backgroundImage: "radial-gradient(rgba(235, 0, 40, 0.15) 1.5px, transparent 1.5px)",
              backgroundSize: "18px 18px",
              maskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)"
            }}
          />

          {/* Boxed Tech-Brutalist Console Container */}
          <div className="max-w-7xl mx-auto relative z-10 border border-white/10 bg-black/45 backdrop-blur-md p-8 md:p-12">
            {/* Tech Corner Brackets */}
            <div className="absolute -top-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-t-2 border-l-2 border-ted-red" />
            <div className="absolute -top-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-t-2 border-r-2 border-ted-red" />
            <div className="absolute -bottom-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-b-2 border-l-2 border-ted-red" />
            <div className="absolute -bottom-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-b-2 border-r-2 border-ted-red" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 items-start">
              
              {/* Column 1: Giant Logo & Mission Statement */}
              <div className="md:col-span-5 md:border-r border-white/10 md:pr-12 pb-8 md:pb-0 space-y-4">
                <div className="text-3xl font-black italic tracking-tighter uppercase select-none">
                  <span className="text-ted-red">TED<span className="lowercase">x</span></span>
                  <span className="text-white">GCEM</span>
                </div>
                <p className="text-xs md:text-sm text-white/50 font-light leading-relaxed max-w-sm">
                  An independently organized TEDx event dedicated to finding and sharing ideas worth spreading that challenge and shape our community&apos;s future.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                  <span>Bangalore, India</span>
                </div>
              </div>

              {/* Column 2: Quick Navigation Links */}
              <div className="md:col-span-4 md:border-r border-white/10 md:px-12 pb-8 md:pb-0 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">{"// Navigation"}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { id: "home", label: "Home" },
                    { id: "about", label: "About" },
                    { id: "speakers", label: "Speakers" },
                    { id: "schedule", label: "Schedule" },
                    { id: "partners", label: "Partners" },
                    { id: "register", label: "Register" },
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleTabChange(link.id as TabId)}
                      className="text-left text-white/40 hover:text-ted-red hover:pl-1.5 transition-[color,padding-left] duration-150 ease-out cursor-pointer uppercase font-mono text-[11px] tracking-widest flex items-center gap-1.5 group"
                    >
                      <span className="text-ted-red opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-bold text-[9px]">▶</span>
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Contact & Socials */}
              <div className="md:col-span-3 md:pl-12 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">{"// Connect"}</h4>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://www.instagram.com/tedxgcem/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">INSTAGRAM</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/tedxgcem/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">LINKEDIN</span>
                  </a>
                  <button 
                    onClick={() => handleTabChange("contact")}
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">CONTACT US</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Compliance & Copyright */}
            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-semibold font-mono max-w-lg leading-relaxed">
                This independent TEDx event is operated under license from TED.
              </span>
              <span className="text-[9px] text-white/30 tracking-[0.15em] font-mono uppercase">
                © {new Date().getFullYear()} <span className="text-ted-red font-black">TED<span className="lowercase">x</span></span>GCEM. ALL RIGHTS RESERVED.
              </span>
            </div>
          </div>
        </footer>
      </motion.div>
    </main>
  );
}
