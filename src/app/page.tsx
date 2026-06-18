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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return <Hero key="home" onTabChange={setActiveTab} />;
      case "about":
        return <About key="about" />;
      case "speakers":
        return <Speakers key="speakers" />;
      case "schedule":
        return <Schedule key="schedule" />;
      case "partners":
        return <Partners key="partners" />;
      case "register":
        return <RegisterNow key="register" onTabChange={setActiveTab} />;
      case "get-pass":
        return <GetMyPass key="get-pass" onTabChange={setActiveTab} />;
      case "contact":
        return <Contact key="contact" />;
      default:
        return <Hero key="home" onTabChange={setActiveTab} />;
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

      {/* Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content with Animated Transitions */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Compliance Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/80 backdrop-blur-sm text-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-white/40 mb-8">
            This independent TEDx event is operated under license from TED.
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <a 
              href="https://www.instagram.com/tedxgcem/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Instagram</span>
            </a>

            <a 
              href="https://www.linkedin.com/in/tedxgcem/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">LinkedIn</span>
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-xs uppercase tracking-[0.2em] text-white/60">
            <button className="hover:text-ted-red transition-colors" onClick={() => setActiveTab("contact")}>
              Contact Us
            </button>
          </div>
          <p className="mt-8 text-[10px] text-white/20 tracking-widest flex items-center justify-center gap-1.5 flex-wrap">
            © {new Date().getFullYear()}
            <img src="/logo-white.png" alt="TEDxGCEM" className="h-3.5 w-auto inline-block align-middle" style={{ mixBlendMode: "screen", filter: "brightness(1.1)" }} />
            All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
