// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
"use client";

/**
 * @component HomeClient
 *
 * Root client component for the TEDxGCEM website.
 *
 * Responsibilities:
 *  - Manages the active tab state and page transitions
 *  - Fetches and distributes EventSettings to all section components
 *  - Renders the interactive cursor spotlight, cinematic background, and footer
 *
 * Receives `initialSettings` from the Server Component (`page.tsx`) via SSR
 * to avoid a loading flash on first paint, then re-fetches dynamically so
 * admin setting updates are reflected without a full page reload.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabNav, { type TabId } from "@/components/ui/TabNav";
import { DevCredit } from "@/components/ui/DevCredit";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
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
import type { EventSettings } from "@/lib/settings-service";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface HomeClientProps {
  initialSettings: EventSettings | null;
}

// â”€â”€â”€ Footer navigation links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FOOTER_NAV_LINKS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "speakers", label: "Speakers" },
  { id: "team", label: "Team" },
  { id: "schedule", label: "Schedule" },
  { id: "partners", label: "Partners" },
  { id: "register", label: "Register" },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function HomeClient({ initialSettings }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<EventSettings | null>(initialSettings);

  // Track whether a tab change was initiated by a user click (vs. scroll)
  const scrollInitiatedRef = React.useRef(false);

  // â”€â”€â”€ Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("[HomeClient] Error loading settings:", err));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync active tab with URL query parameters (?tab=register or ?draft_id=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as TabId | null;
    const draftParam = params.get("draft_id");

    const timer = setTimeout(() => {
      if (draftParam || tabParam === "register") {
        setActiveTab("register");
      } else if (
        tabParam &&
        ["home", "about", "speakers", "team", "schedule", "partners", "get-pass", "contact", "admin"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // â”€â”€â”€ Responsive layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // â”€â”€â”€ Cursor spotlight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // â”€â”€â”€ Scroll-based tab sync (register â†” get-pass) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    if (activeTab !== "register" && activeTab !== "get-pass") return;

    const observerOptions: IntersectionObserverInit = {
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
          } else if (
            id === "ticket-section" &&
            activeTab !== "get-pass" &&
            !scrollInitiatedRef.current
          ) {
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

    return () => observer.disconnect();
  }, [activeTab]);

  // â”€â”€â”€ Scroll-to after tab change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    if (scrollInitiatedRef.current) {
      if (activeTab === "get-pass") {
        const element = document.getElementById("ticket-section");
        if (element) {
          const timer = setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
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
      return undefined;
    }
  }, [activeTab]);

  // â”€â”€â”€ Tab change handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleTabChange = (id: TabId) => {
    if (id === activeTab) {
      if (id === "register") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (id === "get-pass") {
        document.getElementById("ticket-section")?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (id === "register" || id === "get-pass") {
      scrollInitiatedRef.current = true;
    }

    // Apply red/black curtain transition only on desktop (â‰¥ md) and when not
    // switching directly between register and get-pass (they share a scroll view)
    const isDesktop = window.innerWidth >= 768;
    const isRegisterAndPassTransition =
      (activeTab === "register" && id === "get-pass") ||
      (activeTab === "get-pass" && id === "register");

    if (isDesktop && !isRegisterAndPassTransition) {
      setIsTransitioning(true);
      // Switch content at 580 ms — screen is fully covered by the curtains
      setTimeout(() => setActiveTab(id), 580);
      // Slide curtains off at 640 ms
      setTimeout(() => setIsTransitioning(false), 640);
    } else {
      // Mobile: switch immediately (mobile menu has its own transition)
      setActiveTab(id);
    }
  };

  // â”€â”€â”€ Section renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        return (
          <AdminConsole key="admin" settings={settings} onSettingsUpdate={fetchSettings} />
        );
      default:
        return <Hero key="home" onTabChange={handleTabChange} settings={settings} />;
    }
  };

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Interactive cursor spotlight glow (desktop only) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-20 hidden md:block"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(235, 0, 40, 0.15), transparent 80%)`,
        }}
      />

      {/* Desktop page transition curtain overlay (dual-layered staggered) */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            {/* Layer 1: Red curtain */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 bg-ted-red z-[9998] pointer-events-none hidden md:block"
            />
            {/* Layer 2: Black curtain (staggered 150 ms behind) */}
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

      {/* Main website wrapper */}
      <div className="relative w-full min-h-screen bg-black z-10">
        {/* Cinematic background image overlay (X-Wing theme) */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/X_wing.png')",
            backgroundPosition: "center center",
            backgroundSize: "80%",
            backgroundRepeat: "no-repeat",
            opacity: 0.18,
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 10%, rgba(0, 0, 0, 0.75) 75%, black 100%)",
          }}
        />

        {/* Navigation */}
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} settings={settings} />

        {/* Main content with animated transitions */}
        <div className="relative z-20">
          {/* Interactive Particle Constellation on all pages except Home */}
          {activeTab !== "home" && <ParticleBackground />}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab === "get-pass" ? "register" : activeTab}
              initial={isMobile ? { opacity: 0, x: 30 } : { opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={isMobile ? { opacity: 0, x: -30 } : { opacity: 0 }}
              transition={{
                duration: isMobile ? 0.22 : isTransitioning ? 0 : 0.35,
                ease: "easeOut",
              }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium brutalist footer */}
        <footer className="relative bg-black pt-12 md:pt-14 pb-8 md:pb-10 px-4 md:px-6 z-10 font-sans overflow-hidden">
          {/* Glowing top line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-ted-red/40 to-transparent" />

          {/* Dot matrix background grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.25]"
            style={{
              backgroundImage: "radial-gradient(rgba(235, 0, 40, 0.15) 1.5px, transparent 1.5px)",
              backgroundSize: "18px 18px",
              maskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          {/* Boxed tech-brutalist console container */}
          <div className="max-w-7xl mx-auto relative z-10 border border-white/10 bg-black/45 backdrop-blur-md p-6 md:p-8">
            {/* Tech corner brackets */}
            <div className="absolute -top-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-t-2 border-l-2 border-ted-red" />
            <div className="absolute -top-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-t-2 border-r-2 border-ted-red" />
            <div className="absolute -bottom-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-b-2 border-l-2 border-ted-red" />
            <div className="absolute -bottom-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-b-2 border-r-2 border-ted-red" />

            <div className="grid grid-cols-12 gap-y-6 md:gap-y-0 items-start">
              {/* Column 1: Giant logo & mission statement */}
              <div className="col-span-12 md:col-span-5 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8 space-y-3">
                <div className="text-2xl md:text-3xl font-black not-italic tracking-tighter uppercase select-none">
                  <span className="text-ted-red">
                    TED<span className="lowercase">x</span>
                  </span>
                  <span className="text-white">GCEM</span>
                </div>
                <p className="text-xs text-white font-light leading-relaxed max-w-sm">
                  An independently organized TEDx event dedicated to finding and sharing ideas
                  worth spreading that challenge and shape our community&apos;s future.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-white uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                  <span>Bangalore, India</span>
                </div>
              </div>

              {/* Column 2: Quick navigation links */}
              <div className="col-span-6 md:col-span-4 border-r border-white/10 pr-3 md:px-8 space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">
                  {"// Navigation"}
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 md:flex md:flex-col md:gap-1.5">
                  {FOOTER_NAV_LINKS.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleTabChange(link.id)}
                      className="text-left text-white hover:text-ted-red hover:pl-1 transition-[color,padding-left] duration-150 ease-out cursor-pointer uppercase font-mono text-[10.5px] tracking-wider flex items-center gap-1.5 group py-0.5"
                    >
                      <span className="text-ted-red opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-bold text-[8px] flex items-center">
                        <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      </span>
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Contact & socials */}
              <div className="col-span-6 md:col-span-3 pl-3 md:pl-8 space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ted-red font-bold font-mono">
                  {"// Connect"}
                </h4>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://www.instagram.com/tedxgcem/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white hover:text-white transition-[color] duration-150 group font-mono text-[10.5px] tracking-wider"
                  >
                    <div className="w-7 h-7 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">
                      INSTAGRAM
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/tedxgcem/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white hover:text-white transition-[color] duration-150 group font-mono text-[10.5px] tracking-wider"
                  >
                    <div className="w-7 h-7 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">
                      LINKEDIN
                    </span>
                  </a>
                  <a
                    href="https://whatsapp.com/channel/0029VbDVD8cH5JLySv7Xpt16"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white hover:text-white transition-[color] duration-150 group font-mono text-[10.5px] tracking-wider"
                  >
                    <div className="w-7 h-7 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">
                      WHATSAPP
                    </span>
                  </a>
                  <a
                    href="https://www.youtube.com/@tedxgcem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white hover:text-white transition-[color] duration-150 group font-mono text-[10.5px] tracking-wider"
                  >
                    <div className="w-7 h-7 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2 29 29 0 0 0 .46 5.25 29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                      </svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">
                      YOUTUBE
                    </span>
                  </a>
                  <button
                    onClick={() => handleTabChange("contact")}
                    className="flex items-center gap-2.5 text-white hover:text-white transition-[color] duration-150 group font-mono text-[10.5px] tracking-wider text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-none border border-white/10 flex items-center justify-center group-hover:border-ted-red group-hover:bg-ted-red group-hover:text-white transition-[border-color,background-color,color] duration-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <span className="group-hover:text-ted-red group-hover:translate-x-1 transition-[color,transform] duration-150">
                      CONTACT US
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Purpose & legal compliance note (Google OAuth) */}
            <div className="border-t border-white/10 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[9.5px] font-mono text-neutral-400 text-center md:text-left">
              <span className="max-w-xl leading-relaxed">
                TEDxGCEM uses Google Sign-In solely for delegate authentication, pass
                reservation, and ticketing communication.
              </span>
              <div className="flex items-center gap-4 text-white uppercase tracking-wider font-semibold">
                <a
                  href="/privacy"
                  className="hover:text-ted-red transition-colors underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                <span className="text-white/20">&bull;</span>
                <a
                  href="/terms"
                  className="hover:text-ted-red transition-colors underline underline-offset-4"
                >
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Bottom compliance & copyright */}
            <div className="border-t border-white/10 mt-4 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <span className="text-[9px] uppercase tracking-[0.15em] text-white font-semibold font-mono max-w-lg leading-relaxed">
                This independent TEDx event is operated under license from TED.
              </span>
              <span className="text-[9px] text-white tracking-[0.15em] font-mono uppercase">
                Â© {new Date().getFullYear()}{" "}
                <span className="text-ted-red font-black">
                  TED<span className="lowercase">x</span>
                </span>
                GCEM. ALL RIGHTS RESERVED.
              </span>
            </div>
          </div>

          {/* Developer credit — visible across all tabs */}
          <DevCredit />
        </footer>
      </div>
    </main>
  );
}
