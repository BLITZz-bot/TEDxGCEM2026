"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-ted-dark-gray/80 p-1.5 rounded-3xl sm:rounded-full border border-white/10 max-w-full overflow-x-auto no-scrollbar pointer-events-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-200 rounded-full outline-none whitespace-nowrap",
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
  );
}
