"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Home, Info, Users, Calendar, Award, Ticket, CreditCard, Mail } from "lucide-react";

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
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", icon: <Home size={18} /> },
  { id: "about", label: "About", icon: <Info size={18} /> },
  { id: "speakers", label: "Speakers", icon: <Users size={18} /> },
  { id: "schedule", label: "Schedule", icon: <Calendar size={18} /> },
  { id: "partners", label: "Partners", icon: <Award size={18} /> },
  { id: "register", label: "Register", icon: <Ticket size={18} /> },
  { id: "get-pass", label: "Passes", icon: <CreditCard size={18} /> },
  { id: "contact", label: "Contact", icon: <Mail size={18} /> },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop Light Glass Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:block pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="flex items-center gap-1.5 bg-white/70 backdrop-blur-2xl px-4 py-2.5 rounded-full border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] pointer-events-auto group hover:border-ted-red/20 transition-all duration-300"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative p-3 rounded-full transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2",
                  isActive ? "text-white bg-ted-red shadow-[0_0_20px_rgba(235,0,40,0.2)]" : "text-black/40 hover:text-black/80 hover:bg-black/5"
                )}
                title={tab.label}
              >
                {tab.icon}
                {isActive && (
                  <motion.span 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    className="text-xs font-bold uppercase tracking-wider pr-1 text-white block whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile Sticky Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-black/5">
        <img
          src="/logo-black.png"
          alt="TEDxGCEM"
          className="h-6 w-auto"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-black cursor-pointer"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Overlay Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl md:hidden flex flex-col justify-center items-center px-6 pt-24"
          >
            <div className="flex flex-col gap-4 w-full max-w-sm">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 py-4 px-6 rounded-2xl border transition-all text-left cursor-pointer",
                      isActive ? "bg-ted-red border-ted-red text-white shadow-lg" : "bg-black/5 border-black/5 text-black/50 hover:bg-black/10"
                    )}
                  >
                    {tab.icon}
                    <span className="font-bold uppercase tracking-wider text-base">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
