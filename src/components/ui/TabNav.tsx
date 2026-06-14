"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export type TabId = 
  | "home" 
  | "about" 
  | "speakers" 
  | "schedule" 
  | "partners" 
  | "register" 
  | "get-pass" 
  | "contact";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "speakers", label: "Speakers" },
  { id: "schedule", label: "Schedule" },
  { id: "partners", label: "Partners" },
  { id: "register", label: "Register Now" },
  { id: "get-pass", label: "Get My Pass" },
  { id: "contact", label: "Contact" },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center p-6 pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-ted-dark-gray/80 p-1.5 rounded-full border border-white/10 max-w-full pointer-events-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative px-4 py-2 text-xs md:text-sm font-medium transition-colors duration-200 rounded-full outline-none whitespace-nowrap cursor-pointer",
                activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-ted-red rounded-full"
                  transition={{ type: "spring", duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Hamburger Button */}
      <div className="fixed top-6 right-6 z-50 flex md:hidden pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-black/85 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto md:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {tabs.map((tab, idx) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "text-xl font-black uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer flex items-center gap-2",
                    activeTab === tab.id ? "text-ted-red" : "text-white/50 hover:text-white"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.span 
                      layoutId="mobile-active-dot"
                      className="w-1.5 h-1.5 rounded-full bg-ted-red inline-block"
                    />
                  )}
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
