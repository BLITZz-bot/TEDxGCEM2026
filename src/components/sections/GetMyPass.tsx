"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { KeyRound, CreditCard, Download, RefreshCw } from "lucide-react";

interface GetMyPassProps {
  onTabChange: (id: TabId) => void;
}

export default function GetMyPass({ onTabChange }: GetMyPassProps) {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [passFound, setPassFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (email.toLowerCase().includes("@")) {
        setPassFound(true);
      }
    }, 1600);
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">Verify Status</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-black">GET MY PASS</h3>
      </motion.div>

      <div className="w-full max-w-md bg-white border border-black/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Glow detail */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-ted-red/5 blur-[80px] rounded-full" />

        <AnimatePresence mode="wait">
          {!passFound ? (
            <motion.form
              key="search-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSearch}
              className="space-y-6 relative z-10"
            >
              <p className="text-black/60 text-center text-sm">
                Enter your registered email address to fetch your custom digital ticket pass.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-black/40 font-mono ml-2 flex items-center gap-1.5">
                  <KeyRound size={12} /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tedxgcem@gmail.com"
                  className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-black"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 bg-ted-red text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(235,0,40,0.3)] transition-all uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                {isSearching ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find My Pass"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="pass-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 text-center relative z-10"
            >
              <div className="w-full aspect-[1.6/1] bg-white border border-black/5 rounded-[2rem] p-6 text-left flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <img src="/logo-black.png" alt="TEDx" className="h-4 w-auto" />
                  <span className="text-[9px] font-mono uppercase text-black/40 tracking-wider">Verified Pass</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-black/20 font-mono block">Attendee</span>
                  <span className="text-lg font-black text-black block truncate">{email}</span>
                </div>
                <div className="flex justify-between items-end border-t border-black/5 pt-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-black/20 font-mono block">Access Code</span>
                    <span className="text-[10px] font-mono font-bold text-ted-red">GCEM-2026-TICKET</span>
                  </div>
                  <div className="flex gap-0.5 opacity-20">
                    <div className="w-1 h-5 bg-black" />
                    <div className="w-0.5 h-5 bg-black" />
                    <div className="w-2 h-5 bg-black" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-4 bg-ted-red text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white hover:text-ted-red transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none">
                  <Download size={14} /> Download Pass
                </button>
                <button
                  onClick={() => { setPassFound(false); setEmail(""); }}
                  className="px-6 py-4 bg-black/5 border border-black/5 text-black/60 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-black/10 transition-all cursor-pointer"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
