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
  const [leftCanvas, setLeftCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rightCanvas, setRightCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!showIntro) return;
    if (!leftCanvas || !rightCanvas) return;
    const leftCtx = leftCanvas.getContext("2d");
    const rightCtx = rightCanvas.getContext("2d");
    if (!leftCtx || !rightCtx) return;

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
      text?: string;
    }

    const dots: Dot[] = [];
    const debris: Debris[] = [];
    const spacing = 35; // pixel spacing of the dots grid

    const handleResize = () => {
      const parent = leftCanvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;

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

      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);

      const w = leftCanvas.width;
      const h = leftCanvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Update dots repulsion/breathing physics (runs once per frame)
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
              const speed = Math.random() * 10 + 5;
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
            dot.vx *= 0.95;
            dot.vy *= 0.95;
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
      }

      // 2. Update debris physics (runs once per frame)
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.angle += d.va;
        d.vx *= 0.96;
        d.vy *= 0.96;
        d.alpha -= 0.014;

        if (d.alpha <= 0) {
          debris.splice(i, 1);
        }
      }

      // 3. Trigger explosion and debris spawn (runs once per frame)
      if (progress >= 100 && !triggeredExplosion) {
        triggeredExplosion = true;
        setTriggerExplosion(true);
        
        // Spawn standard block debris
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 4;
          debris.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 8 + 3,
            angle: Math.random() * Math.PI,
            va: Math.random() * 0.3 - 0.15,
            alpha: 1.0,
            color: Math.random() > 0.3 ? "235, 0, 40" : "255, 255, 255"
          });
        }

        // Spawn letter debris ("TEDxGCEM" characters blasting out)
        const chars = ["T", "E", "D", "x", "G", "C", "E", "M"];
        for (let k = 0; k < 3; k++) { // 3 waves of flying characters
          chars.forEach((char) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 6; // high-speed blast outward
            const size = Math.random() * 20 + 14; // random scale for visual variety
            debris.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size,
              angle: Math.random() * Math.PI,
              va: Math.random() * 0.2 - 0.1,
              alpha: 1.0,
              color: char === "T" || char === "E" || char === "D" || char === "x" ? "235, 0, 40" : "255, 255, 255",
              text: char
            });
          });
        }
        
        // Finish the intro sequence and transition to the full site reveal
        setTimeout(() => {
          isTerminated = true;
          leftCtx.clearRect(0, 0, w, h);
          rightCtx.clearRect(0, 0, w, h);
          setShowIntro(false);
        }, 1600);
      }

      // 4. Render drawing states on both contexts
      const render = (ctx: CanvasRenderingContext2D) => {
        // Clear background with black
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, w, h);

        // A. Draw central text & zoom entry (before explosion)
        if (progress < 100) {
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
          let textAlpha = 1.0;
          let shake = 0;

          if (elapsed < 600) {
            const t = elapsed / 600;
            const ease = 1 - Math.pow(1 - t, 3);
            textScale = 8.0 - ease * 7.0;
            textAlpha = ease;
            shake = (1.0 - ease) * 8;
          }

          if (shake > 0) {
            ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
          }

          let glitchOffset = 0;
          if (Math.random() > 0.94) {
            glitchOffset = Math.random() * 10 - 5;
          }

          ctx.save();
          ctx.scale(textScale, textScale);

          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(235, 0, 40, 0.6)";

          ctx.fillStyle = `rgba(235, 0, 40, ${textAlpha})`;
          ctx.fillText("TEDx", startX + glitchOffset, 0);

          ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
          ctx.fillText("GCEM", startX + tedxWidth + glitchOffset, 0);
          ctx.restore();

          if (elapsed < 600) {
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

        // B. Draw Dot Matrix Grid
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          if (dot.alpha > 0) {
            ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
            ctx.fillRect(dot.cx - dot.size / 2, dot.cy - dot.size / 2, dot.size, dot.size);
          }
        }

        // C. Draw Text Blast Expanding Zoom-Out Shockwave (after explosion)
        if (progress >= 100) {
          const postExplosionTime = elapsed - duration;
          if (postExplosionTime < 800) {
            const t = postExplosionTime / 800;
            const waveScale = 1.0 + Math.pow(t, 2) * 14.0;
            const waveAlpha = Math.max(0, 1 - Math.pow(t, 1.5));
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(waveScale, waveScale);
            
            const fontSize = Math.min(w * 0.09, 72);
            ctx.font = `italic 900 ${fontSize}px Impact, Arial Black, sans-serif`;
            ctx.textBaseline = "middle";
            
            const tedxWidth = ctx.measureText("TEDx").width;
            const gcemWidth = ctx.measureText("GCEM").width;
            const totalWidth = tedxWidth + gcemWidth;
            const startX = -totalWidth / 2;
            
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = `rgba(235, 0, 40, ${waveAlpha * 0.75})`;
            ctx.strokeText("TEDx", startX, 0);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.5})`;
            ctx.strokeText("GCEM", startX + tedxWidth, 0);
            
            ctx.restore();
          }
        }

        // D. Draw Debris & Shattered Letters
        for (let i = 0; i < debris.length; i++) {
          const d = debris[i];
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.angle);
          ctx.fillStyle = `rgba(${d.color}, ${d.alpha})`;

          if (d.text) {
            ctx.font = `italic 900 ${d.size}px Impact, Arial Black, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (d.color === "235, 0, 40") {
              ctx.shadowBlur = 8;
              ctx.shadowColor = "rgba(235, 0, 40, 0.5)";
            }
            ctx.fillText(d.text, 0, 0);
          } else {
            ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
          }
          ctx.restore();
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
  }, [showIntro, leftCanvas, rightCanvas]);

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
      </div>
    </main>
  );
}
