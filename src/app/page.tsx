"use client";

import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      <div className="relative w-full min-h-screen bg-black z-10">
        {/* Navigation */}
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content with Animated Transitions */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={isMobile ? { opacity: 0, x: 30 } : { opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={isMobile ? { opacity: 0, x: -30 } : { opacity: 0 }}
              transition={{ duration: isMobile ? 0.22 : (isTransitioning ? 0 : 0.35), ease: "easeOut" }}
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
                <div className="text-3xl font-black not-italic tracking-tighter uppercase select-none">
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
