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
  const [isMounted, setIsMounted] = useState(false);
  const [leftCanvas, setLeftCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rightCanvas, setRightCanvas] = useState<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !showIntro) return;
    if (!leftCanvas || !rightCanvas) return;
    const leftCtx = leftCanvas.getContext("2d");
    const rightCtx = rightCanvas.getContext("2d");
    if (!leftCtx || !rightCtx) return;

    let animationFrameId: number;
    let triggeredSplit = false;
    let isTerminated = false;

    interface Dot {
      x: number;
      y: number;
      alpha: number;
      color: string;
      size: number;
    }

    const dots: Dot[] = [];
    const spacing = 35; // pixel spacing of the dots grid

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      leftCanvas.width = w;
      leftCanvas.height = h;
      rightCanvas.width = w;
      rightCanvas.height = h;

      initGrid(w, h);
    };

    const initGrid = (w: number, h: number) => {
      dots.length = 0;
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const startX = (w - (cols - 1) * spacing) / 2;
      const startY = (h - (rows - 1) * spacing) / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = startX + c * spacing;
          const y = startY + r * spacing;
          
          const isRed = Math.random() > 0.93;
          dots.push({
            x,
            y,
            alpha: isRed ? 0.25 : 0.08,
            color: isRed ? "235, 0, 40" : "255, 255, 255",
            size: isRed ? 1.6 : 0.8
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const duration = 1500; // 1.5 seconds zoom-in & breathe
    const startTime = Date.now();

    const draw = () => {
      if (isTerminated) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);

      const w = leftCanvas.width;
      const h = leftCanvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Update dots breathing wave (runs once per frame)
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.x - cx;
        const dy = dot.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin(dist / 60 - elapsed / 180) * 0.04;
        dot.alpha = Math.max(0.02, (dot.color === "235, 0, 40" ? 0.25 : 0.08) + wave);
      }

      // 2. Trigger screen split when duration completes
      if (progress >= 100 && !triggeredSplit) {
        triggeredSplit = true;
        setTriggerExplosion(true);
        
        // Finish the intro sequence and transition to the full site reveal
        setTimeout(() => {
          isTerminated = true;
          leftCtx.clearRect(0, 0, w, h);
          rightCtx.clearRect(0, 0, w, h);
          setShowIntro(false);
        }, 1600);
      }

      // 3. Render drawing states on context
      const render = (ctx: CanvasRenderingContext2D) => {
        // Clear background
        ctx.clearRect(0, 0, w, h);

        // Before the split starts, draw solid black background on canvas
        if (progress < 100) {
          ctx.fillStyle = "rgb(0, 0, 0)";
          ctx.fillRect(0, 0, w, h);
        }

        // A. Draw central text & zoom entry (fades out as panels split)
        const postSplitTime = progress >= 100 ? (elapsed - duration) : 0;
        let textAlpha = 1.0;
        
        if (progress >= 100) {
          textAlpha = Math.max(0, 1 - postSplitTime / 800); // fade out over 800ms during split
        } else if (elapsed < 600) {
          const t = elapsed / 600;
          const ease = 1 - Math.pow(1 - t, 3);
          textAlpha = ease;
        }

        if (textAlpha > 0) {
          ctx.save();
          ctx.translate(cx, cy);

          const fontSize = Math.min(w * 0.09, 72);
          ctx.font = `italic 900 ${fontSize}px Impact, Arial Black, sans-serif`;
          ctx.textBaseline = "middle";

          const tedxWidth = ctx.measureText("TEDx").width;
          const gcemWidth = ctx.measureText("GCEM").width;
          const totalWidth = tedxWidth + gcemWidth;
          const startX = -totalWidth / 2;

          let textScale = 1.0;
          let shake = 0;

          if (progress < 100 && elapsed < 600) {
            const t = elapsed / 600;
            const ease = 1 - Math.pow(1 - t, 3);
            textScale = 8.0 - ease * 7.0;
            shake = (1.0 - ease) * 8;
          }

          if (shake > 0) {
            ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
          }

          let glitchOffset = 0;
          if (progress < 100 && Math.random() > 0.94) {
            glitchOffset = Math.random() * 10 - 5;
          }

          ctx.save();
          ctx.scale(textScale, textScale);

          ctx.shadowBlur = progress < 100 ? 12 : 0;
          ctx.shadowColor = "rgba(235, 0, 40, 0.6)";

          // Draw TEDx
          ctx.fillStyle = `rgba(235, 0, 40, ${textAlpha})`;
          ctx.fillText("TEDx", startX + glitchOffset, 0);

          // Draw GCEM
          ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
          ctx.fillText("GCEM", startX + tedxWidth + glitchOffset, 0);
          ctx.restore();

          if (progress < 100 && elapsed < 600) {
            const t = elapsed / 600;
            const ease = 1 - Math.pow(1 - t, 3);
            const echoScale = textScale * 1.4;
            const echoAlpha = (1.0 - ease) * 0.2;
            
            if (echoAlpha > 0) {
              ctx.save();
              ctx.scale(echoScale, echoScale);
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(235, 0, 40, ${echoAlpha})`;
              ctx.fillText("TEDx", startX + glitchOffset, 0);
              ctx.fillStyle = `rgba(255, 255, 255, ${echoAlpha})`;
              ctx.fillText("GCEM", startX + tedxWidth + glitchOffset, 0);
              ctx.restore();
            }
          }

          ctx.restore();
        }

        // B. Draw Dot Matrix Grid (slides with the curtains)
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          if (dot.alpha > 0) {
            ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
            ctx.fillRect(dot.x - dot.size / 2, dot.y - dot.size / 2, dot.size, dot.size);
          }
        }
      };

      // Draw onto both contexts
      render(leftCtx);
      render(rightCtx);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, showIntro, leftCanvas, rightCanvas]);

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
      {isMounted && showIntro && (
        <div className="fixed inset-0 z-[99990] pointer-events-none select-none overflow-hidden">
          {/* Left Shutter Panel */}
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: triggerExplosion ? "-100%" : "0%" }}
            transition={{ duration: 1.3, ease: [0.85, 0, 0.15, 1] }}
            style={{ clipPath: "inset(0 50% 0 0)" }}
            className="absolute inset-0 bg-black pointer-events-auto"
          >
            <canvas 
              ref={setLeftCanvas} 
              className="absolute inset-0 w-full h-full pointer-events-none" 
            />
          </motion.div>
 
          {/* Right Shutter Panel */}
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: triggerExplosion ? "100%" : "0%" }}
            transition={{ duration: 1.3, ease: [0.85, 0, 0.15, 1] }}
            style={{ clipPath: "inset(0 0 0 50%)" }}
            className="absolute inset-0 bg-black pointer-events-auto"
          >
            <canvas 
              ref={setRightCanvas} 
              className="absolute inset-0 w-full h-full pointer-events-none" 
            />
          </motion.div>

          {/* Ambient Background Glow */}
          {!triggerExplosion && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-ted-red/10 rounded-full blur-[100px] pointer-events-none z-0" />
          )}

          {/* Shockwaves */}
          {triggerExplosion && (
            <div className="absolute inset-0 pointer-events-none z-50">
              {/* Screen Camera Flash */}
              <motion.div
                key="screen-flash"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 bg-white pointer-events-none"
              />

              {/* Concentric Glowing Ring 1 */}
              <motion.div 
                key="shockwave-ring-1"
                initial={{ scale: 1, opacity: 0.8, x: "-50%", y: "-50%" }}
                animate={{ scale: 220, opacity: [0.8, 0.6, 0], x: "-50%", y: "-50%" }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="absolute top-1/2 left-1/2 w-4 h-4 border border-ted-red rounded-full shadow-[0_0_15px_rgba(235,0,40,0.6)] pointer-events-none"
              />
              {/* Concentric Glowing Ring 2 */}
              <motion.div 
                key="shockwave-ring-2"
                initial={{ scale: 1, opacity: 0.6, x: "-50%", y: "-50%" }}
                animate={{ scale: 260, opacity: [0.6, 0], x: "-50%", y: "-50%" }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="absolute top-1/2 left-1/2 w-4 h-4 border border-white/20 rounded-full pointer-events-none"
              />
            </div>
          )}
        </div>
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

      {/* Main Website Wrapper */}
      <div
        className="relative w-full min-h-screen bg-black"
        style={{ 
          zIndex: isTransitioning ? 10 : 99995,
          opacity: isMounted && (triggerExplosion || !showIntro) ? 1 : 0,
          transition: "opacity 0.2s ease-out"
        }}
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
      </div>
    </main>
  );
}
