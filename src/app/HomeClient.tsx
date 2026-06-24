"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabNav, { TabId } from "@/components/ui/TabNav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Speakers from "@/components/sections/Speakers";
import Team from "@/components/sections/Team";
import Schedule from "@/components/sections/Schedule";
import Partners from "@/components/sections/Partners";
import RegisterNow from "@/components/sections/RegisterNow";
import GetMyPass from "@/components/sections/GetMyPass";
import Contact from "@/components/sections/Contact";
import Countdown from "@/components/sections/Countdown";
import Highlights from "@/components/sections/Highlights";
import EventDate from "@/components/sections/EventDate";
import AdminConsole from "@/components/sections/AdminConsole";
import { EventSettings } from "@/lib/settings-service";

interface HomeClientProps {
  initialSettings: EventSettings | null;
}

export default function HomeClient({ initialSettings }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showDevLinks, setShowDevLinks] = useState(false);
  const devCreditRef = useRef<HTMLDivElement>(null);
  const scrollInitiatedRef = useRef(false);
  
  // Dynamic settings state initialized from SSR settings
  const [settings, setSettings] = useState<EventSettings | null>(initialSettings);

  const fetchSettings = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error loading settings:", err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devCreditRef.current && !devCreditRef.current.contains(event.target as Node)) {
        setShowDevLinks(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    if (activeTab !== "register" && activeTab !== "get-pass") return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "register-section" && activeTab !== "register" && !scrollInitiatedRef.current) {
            setActiveTab("register");
          } else if (id === "ticket-section" && activeTab !== "get-pass" && !scrollInitiatedRef.current) {
            setActiveTab("get-pass");
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const registerEl = document.getElementById("register-section");
    const ticketEl = document.getElementById("ticket-section");

    if (registerEl) observer.observe(registerEl);
    if (ticketEl) observer.observe(ticketEl);

    return () => {
      observer.disconnect();
    };
  }, [activeTab]);

  useEffect(() => {
    if (scrollInitiatedRef.current) {
      if (activeTab === "get-pass") {
        const element = document.getElementById("ticket-section");
        if (element) {
          const timer = setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100);
          return () => clearTimeout(timer);
        }
      } else if (activeTab === "register") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const timer = setTimeout(() => {
        scrollInitiatedRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    } else {
      if (activeTab !== "register" && activeTab !== "get-pass") {
        window.scrollTo(0, 0);
      }
    }
  }, [activeTab]);

  const handleTabChange = (id: TabId) => {
    if (id === activeTab) {
      if (id === "register") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (id === "get-pass") {
        const element = document.getElementById("ticket-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
      return;
    }

    if (id === "register" || id === "get-pass") {
      scrollInitiatedRef.current = true;
    }
    
    // Only apply red/black curtain transition on desktop/laptop sizes (md breakpoint)
    const isDesktop = window.innerWidth >= 768;
    const isRegisterAndPassTransition = 
      (activeTab === "register" && id === "get-pass") || 
      (activeTab === "get-pass" && id === "register");

    if (isDesktop && !isRegisterAndPassTransition) {
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
        return (
          <div key="home" className="flex flex-col w-full">
            <Hero onTabChange={handleTabChange} settings={settings} />
            <EventDate settings={settings} />
            <Countdown onTabChange={handleTabChange} settings={settings} />
            <Highlights settings={settings} />
          </div>
        );
      case "about":
        return <About key="about" settings={settings} />;
      case "speakers":
        return <Speakers key="speakers" settings={settings} />;
      case "team":
        return <Team key="team" settings={settings} />;
      case "schedule":
        return <Schedule key="schedule" settings={settings} />;
      case "partners":
        return <Partners key="partners" settings={settings} />;
      case "register":
      case "get-pass":
        return (
          <div key="register-and-pass" className="flex flex-col w-full">
            <div id="register-section">
              <RegisterNow onTabChange={handleTabChange} settings={settings} />
            </div>
            <div id="ticket-section" className="w-full">
              <GetMyPass onTabChange={handleTabChange} settings={settings} />
            </div>
          </div>
        );
      case "contact":
        return <Contact key="contact" />;
      case "admin":
        return <AdminConsole key="admin" settings={settings} onSettingsUpdate={fetchSettings} />;
      default:
        return <Hero key="home" onTabChange={handleTabChange} settings={settings} />;
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
        {/* Cinematic Background Image Overlay (X-Wing theme) - Active on all pages except Home */}
        <AnimatePresence>
          {activeTab !== "home" && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.18 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: "url('/X_wing.png')",
                  backgroundPosition: "center center",
                  backgroundSize: "80%",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                  background: "radial-gradient(circle at center, transparent 10%, rgba(0, 0, 0, 0.75) 75%, black 100%)"
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} settings={settings} />

        {/* Main Content with Animated Transitions */}
        <div className="relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab === "get-pass" ? "register" : activeTab}
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

            <div className="grid grid-cols-12 gap-y-8 md:gap-y-0 items-start">
              
              {/* Column 1: Giant Logo & Mission Statement */}
              <div className="col-span-12 md:col-span-5 border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-12 space-y-4">
                <div className="text-3xl font-black not-italic tracking-tighter uppercase select-none">
                  <span className="text-ted-red">TED<span className="lowercase">x</span></span>
                  <span className="text-white">GCEM</span>
                </div>
                <p className="text-xs md:text-sm text-white font-light leading-relaxed max-w-sm">
                  An independently organized TEDx event dedicated to finding and sharing ideas worth spreading that challenge and shape our community&apos;s future.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-white uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                  <span>Bangalore, India</span>
                </div>
              </div>

              {/* Column 2: Quick Navigation Links */}
              <div className="col-span-6 md:col-span-4 border-r border-white/10 pr-4 md:px-12 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">{"// Navigation"}</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "home", label: "Home" },
                    { id: "about", label: "About" },
                    { id: "speakers", label: "Speakers" },
                    { id: "team", label: "Team" },
                    { id: "schedule", label: "Schedule" },
                    { id: "partners", label: "Partners" },
                    { id: "register", label: "Register" },
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleTabChange(link.id as TabId)}
                      className="text-left text-white hover:text-ted-red hover:pl-1.5 transition-[color,padding-left] duration-150 ease-out cursor-pointer uppercase font-mono text-[11px] tracking-widest flex items-center gap-1.5 group"
                    >
                      <span className="text-ted-red opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-bold text-[9px]">▶</span>
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Contact & Socials */}
              <div className="col-span-6 md:col-span-3 pl-4 md:pl-12 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">{"// Connect"}</h4>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://www.instagram.com/tedxgcem/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
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
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">LINKEDIN</span>
                  </a>
                  <a 
                    href="https://x.com/tedxgcem" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">TWITTER</span>
                  </a>
                  <a 
                    href="https://whatsapp.com/channel/0029Vb37kqMCBtxKXypYFt2q" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">WHATSAPP</span>
                  </a>
                  <a 
                    href="https://www.youtube.com/@tedxgcem" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2a29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">YOUTUBE</span>
                  </a>
                  <button 
                    onClick={() => handleTabChange("contact")}
                    className="flex items-center gap-3 text-white hover:text-white transition-[color] duration-150 group font-mono text-[11px] tracking-widest text-left cursor-pointer"
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
              <span className="text-[9px] uppercase tracking-[0.15em] text-white font-semibold font-mono max-w-lg leading-relaxed">
                This independent TEDx event is operated under license from TED.
              </span>
              <span className="text-[9px] text-white tracking-[0.15em] font-mono uppercase">
                © {new Date().getFullYear()} <span className="text-ted-red font-black">TED<span className="lowercase">x</span></span>GCEM. ALL RIGHTS RESERVED.
              </span>
            </div>
          </div>

          {/* Developer Credit - Only visible on the Contact page, centered below the footer box */}
          {activeTab === "contact" && (
            <div ref={devCreditRef} className="mt-12 flex flex-col items-center justify-center gap-3 text-center z-10 relative">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white font-mono flex items-center justify-center gap-1.5 flex-wrap">
                designed & developed by{" "}
                <span className="relative inline-block">
                  <button
                    onClick={() => setShowDevLinks(!showDevLinks)}
                    className="text-white font-black cursor-pointer hover:text-white/80 transition-colors duration-150 focus:outline-none relative inline-flex items-center uppercase tracking-[0.2em]"
                    aria-label="Show developer contact links"
                  >
                    M M BHARATH
                  </button>
                  <AnimatePresence>
                    {showDevLinks && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3.5 py-2 bg-neutral-950/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.15em] z-50 whitespace-nowrap"
                      >
                        <a
                          href="https://www.linkedin.com/in/bharath-m-m-a9960b309"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group px-1 py-0.5"
                        >
                          <svg className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                        <div className="w-[1px] h-3.5 bg-white/10" />
                        <a
                          href="https://mail.google.com/mail/?view=cm&fs=1&to=bharatha9483@gmail.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group px-1 py-0.5"
                        >
                          <svg className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span>Gmail</span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </span>
              </span>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
