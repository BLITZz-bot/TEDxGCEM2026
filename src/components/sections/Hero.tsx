"use client";

import React from "react";
import { motion } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";

interface HeroProps {
  onTabChange: (id: TabId) => void;
}

interface BgSettings {
  desktop: { x: number; y: number; scale: number };
  mobile: { x: number; y: number; scale: number };
  opacity: number;
  themeYearSize: number;
}

export default function Hero({ onTabChange }: HeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isControlsOpen, setIsControlsOpen] = React.useState(false);
  const [bgSettings, setBgSettings] = React.useState<BgSettings>({
    desktop: {
      x: 112.80010986328125,
      y: 140.20001220703125,
      scale: 1.1
    },
    mobile: {
      x: -21,
      y: 97,
      scale: 1.1
    },
    opacity: 58,
    themeYearSize: 14
  });
  const [isCursorDragActive, setIsCursorDragActive] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const isProduction = process.env.NODE_ENV === "production";

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tedx_bg_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBgSettings(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error("Failed to load saved background settings", e);
        }
      }
    }
  }, []);

  const savePosition = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tedx_bg_settings", JSON.stringify(bgSettings));
      
      fetch("/api/save-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bgSettings)
      })
        .then(res => {
          if (!res.ok) throw new Error("API call failed");
          return res.json();
        })
        .then(() => {
          setSaveStatus("Saved directly to Hero.tsx code!");
          setTimeout(() => setSaveStatus(null), 4000);
        })
        .catch(err => {
          console.error("Could not write directly to file, copying snippet instead:", err);
          const codeSnippet = `const [bgSettings, setBgSettings] = React.useState({
    desktop: {
      x: 112.80010986328125,
      y: 140.20001220703125,
      scale: 1.1
    },
    opacity: 11
  });`;
          navigator.clipboard.writeText(codeSnippet)
            .then(() => {
              setSaveStatus("Saved locally & code copied!");
              setTimeout(() => setSaveStatus(null), 4000);
            })
            .catch(() => {
              setSaveStatus("Saved locally!");
              setTimeout(() => setSaveStatus(null), 3000);
            });
        });
    }
  };

  React.useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const particleCount = 200;

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 0;
      color = "";
      alpha = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * canvas!.height; // Distribute across vertical height initially
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + Math.random() * 50;
        this.vx = Math.random() * 2 - 1;
        this.vy = -(Math.random() * 1.5 + 0.4);
        this.size = Math.random() * 1.8 + 0.6;
        // 75% neon-red sparks, 25% white sparks
        this.color = Math.random() > 0.25 ? "235, 0, 40" : "255, 255, 255";
        this.alpha = Math.random() * 0.55 + 0.25;
      }

      update() {

        // Soft upward drift and slight noise/wind
        this.vy -= 0.02;
        this.vx += Math.random() * 0.1 - 0.05;

        // Apply friction drag (damps physics)
        this.vx *= 0.94;
        this.vy *= 0.94;

        this.x += this.vx;
        this.y += this.vy;

        // Reset if out of bounds or completely faded
        if (
          this.x < -10 || 
          this.x > canvas!.width + 10 || 
          this.y < -10 || 
          this.y > canvas!.height + 50
        ) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        if (this.color === "235, 0, 40") {
          ctx.shadowBlur = this.size * 3;
          ctx.shadowColor = "rgb(235, 0, 40)";
        }
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="min-h-screen relative flex flex-col justify-center px-6 md:px-20 overflow-hidden select-none bg-black">
      {/* Movable/Draggable Background Image Layer */}
      <motion.img 
        src="/bg.jpeg"
        drag={isCursorDragActive}
        dragMomentum={false}
        className={`absolute w-full h-full object-contain z-0 select-none hidden md:block ${
          isCursorDragActive 
            ? "pointer-events-auto cursor-grab active:cursor-grabbing" 
            : "pointer-events-none cursor-default"
        }`}
        style={{
          x: bgSettings.desktop.x,
          y: bgSettings.desktop.y,
          scale: bgSettings.desktop.scale,
        }}
        onDrag={(e, info) => {
          setBgSettings(prev => ({
            ...prev,
            desktop: {
              ...prev.desktop,
              x: prev.desktop.x + info.delta.x,
              y: prev.desktop.y + info.delta.y
            }
          }));
        }}
      />

      {/* Mobile-Only Movable/Draggable Background Image Layer */}
      <motion.img 
        src="/mobbg.png"
        drag={isCursorDragActive}
        dragMomentum={false}
        className={`absolute w-full h-full object-contain z-0 select-none block md:hidden ${
          isCursorDragActive 
            ? "pointer-events-auto cursor-grab active:cursor-grabbing" 
            : "pointer-events-none cursor-default"
        }`}
        style={{
          x: bgSettings.mobile.x,
          y: bgSettings.mobile.y,
          scale: bgSettings.mobile.scale,
        }}
        onDrag={(e, info) => {
          setBgSettings(prev => ({
            ...prev,
            mobile: {
              ...prev.mobile,
              x: prev.mobile.x + info.delta.x,
              y: prev.mobile.y + info.delta.y
            }
          }));
        }}
      />

      {/* Dark Overlay Tint Layer */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none z-0 block"
        style={{ opacity: bgSettings.opacity / 100 }}
      />

      {/* Bottom Black Gradient Fade Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-0 block" />

      {/* Mobile-Only Premium Ambient Glow (visible only on mobile) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none block md:hidden">
        <div 
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] opacity-50"
          style={{
            background: 'radial-gradient(circle at center, rgba(235, 0, 40, 0.15) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-64 h-64 opacity-20"
          style={{
            background: 'radial-gradient(circle at center, rgba(235, 0, 40, 0.2) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Interactive Swirling Fluid Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Grid Pattern Backdrop overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.01]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="55" height="55" patternUnits="userSpaceOnUse">
              <path d="M 55 0 L 0 0 0 55" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Left-Aligned Premium Editorial Content Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 max-w-xl flex flex-col items-start text-left space-y-6 -translate-y-12 md:translate-y-8"
      >
        <h2 className="text-xl md:text-2xl tracking-[0.25em] font-black uppercase font-sans leading-none">
          <span className="text-ted-red">TED<span className="lowercase">x</span></span>
          <span className="text-white">GCEM</span>
          <span className="text-white/40 tracking-[0.25em] font-sans ml-2 font-bold align-middle" style={{ fontSize: `${bgSettings.themeYearSize}px` }}>2026</span>
        </h2>
        
        <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter text-left uppercase">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-ted-red">
            RIPPLE
          </span>
        </h1>
        
        <p className="text-white/60 text-sm md:text-base leading-relaxed font-medium max-w-sm pb-6">
          A single idea can act as a catalyst, creating ripples that expand outward to challenge status quos, spark new connections, and transform communities.
        </p>

      </motion.div>

      {/* Absolute Positioned Stacked Console at the bottom-left */}
      <div className="absolute bottom-28 md:bottom-16 left-1/2 -translate-x-1/2 md:left-20 md:translate-x-0 z-20 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs sm:max-w-md px-0 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(235,0,40,0.5)" }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onTabChange("register")}
          className="w-full sm:w-auto px-10 py-4 bg-ted-red text-white font-black rounded-full text-sm transition-all uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(235,0,40,0.2)] text-center"
        >
          Get Tickets
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onTabChange("about")}
          className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/10 text-white font-bold rounded-full text-sm hover:border-white/15 transition-all uppercase tracking-widest cursor-pointer text-center"
        >
          Learn More
        </motion.button>
      </div>

      {/* Real-time Background Controls Panel */}
      {!isProduction && (
        <div className="fixed top-24 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
          <button 
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg"
            title="Customize Background Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white transition-transform duration-500 ${isControlsOpen ? 'rotate-90' : ''}`}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>

          {isControlsOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="bg-black/80 border border-white/10 backdrop-blur-xl p-5 rounded-3xl w-72 text-left space-y-4 shadow-2xl"
            >
              <h4 className="text-[10px] tracking-[0.2em] font-black uppercase text-ted-red mb-2 pb-2 border-b border-white/5 font-sans">
                BG Customizer
              </h4>

              {/* Cursor Dragging Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-white/50 font-sans uppercase">
                  Drag with Cursor
                </span>
                <button
                  onClick={() => setIsCursorDragActive(!isCursorDragActive)}
                  className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isCursorDragActive
                      ? "bg-ted-red text-white shadow-[0_0_10px_rgba(235,0,40,0.4)]"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isCursorDragActive ? "ON" : "OFF"}
                </button>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-white/50 font-sans">
                  <span>Scale (Zoom) [{isMobile ? "Mobile" : "Desktop"}]</span>
                  <span className="text-white font-mono">
                    {(isMobile ? bgSettings.mobile.scale : bgSettings.desktop.scale).toFixed(2)}x
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05"
                  value={isMobile ? bgSettings.mobile.scale : bgSettings.desktop.scale}
                  onChange={(e) => setBgSettings(prev => {
                    const device = isMobile ? "mobile" : "desktop";
                    return {
                      ...prev,
                      [device]: {
                        ...prev[device],
                        scale: parseFloat(e.target.value)
                      }
                    };
                  })}
                  className="w-full h-1 bg-white/10 accent-ted-red rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Position X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-white/50 font-sans">
                  <span>Offset X [{isMobile ? "Mobile" : "Desktop"}]</span>
                  <span className="text-white font-mono">
                    {isMobile ? bgSettings.mobile.x : bgSettings.desktop.x}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-1000" 
                  max="1000" 
                  value={isMobile ? bgSettings.mobile.x : bgSettings.desktop.x}
                  onChange={(e) => setBgSettings(prev => {
                    const device = isMobile ? "mobile" : "desktop";
                    return {
                      ...prev,
                      [device]: {
                        ...prev[device],
                        x: parseInt(e.target.value)
                      }
                    };
                  })}
                  className="w-full h-1 bg-white/10 accent-ted-red rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Position Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-white/50 font-sans">
                  <span>Offset Y [{isMobile ? "Mobile" : "Desktop"}]</span>
                  <span className="text-white font-mono">
                    {isMobile ? bgSettings.mobile.y : bgSettings.desktop.y}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-1000" 
                  max="1000" 
                  value={isMobile ? bgSettings.mobile.y : bgSettings.desktop.y}
                  onChange={(e) => setBgSettings(prev => {
                    const device = isMobile ? "mobile" : "desktop";
                    return {
                      ...prev,
                      [device]: {
                        ...prev[device],
                        y: parseInt(e.target.value)
                      }
                    };
                  })}
                  className="w-full h-1 bg-white/10 accent-ted-red rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity Overlay Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-white/50 font-sans">
                  <span>Dark Overlay</span>
                  <span className="text-white font-mono">{bgSettings.opacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="95" 
                  value={bgSettings.opacity}
                  onChange={(e) => setBgSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-white/10 accent-ted-red rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Theme Year Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-white/50 font-sans">
                  <span>2026 Size</span>
                  <span className="text-white font-mono">{bgSettings.themeYearSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="8" 
                  max="40" 
                  value={bgSettings.themeYearSize}
                  onChange={(e) => setBgSettings(prev => ({ ...prev, themeYearSize: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-white/10 accent-ted-red rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Save Position Option */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <button
                  onClick={savePosition}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-[9px] tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ted-red"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save Position
                </button>
                {saveStatus && (
                  <p className="text-[9px] text-green-400 font-bold text-center animate-pulse">
                    {saveStatus}
                  </p>
                )}
              </div>
              
              <p className="text-[8px] text-white/20 text-center uppercase tracking-widest pt-1 font-sans">
                Adjusts background in real-time
              </p>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
