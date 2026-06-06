"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GetMyPass() {
  const [email, setEmail] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [passFound, setPassFound] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate a lookup delay
    setTimeout(() => {
      setIsSearching(false);
      if (email.toLowerCase().includes("@")) {
        setPassFound(true);
      }
    }, 1500);
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Access Pass</h2>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase">GET MY PASS</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
      >
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />
        
        {!passFound ? (
          <form onSubmit={handleSearch} className="relative z-10 space-y-8">
            <div className="text-center mb-8">
              <p className="text-white/60 text-lg">
                Enter the Email address used during registration to retrieve your official <span className="text-ted-red uppercase font-bold">TED</span><span className="text-ted-red lowercase font-bold">x</span><span className="text-white uppercase font-bold">GCEM</span> access pass.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="relative group">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TEDxGCEM@gmail.com" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-ted-red transition-all text-white text-lg"
                />
              </div>

              <button 
                type="submit"
                disabled={isSearching}
                className="w-full py-5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find My Pass"
                )}
              </button>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <div>
              <h4 className="text-3xl font-black mb-2 text-white">Pass Found!</h4>
              <p className="text-white/60">Your registration for {email} has been verified.</p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Event</span>
                <span className="text-xs font-bold text-white uppercase tracking-widest">
                  <span className="text-ted-red uppercase">TED</span><span className="text-ted-red lowercase">x</span>GCEM 2026
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Attendee</span>
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{email}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-8 py-5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Pass
              </button>
              <button 
                onClick={() => {setPassFound(false); setEmail("");}}
                className="px-8 py-5 bg-transparent border border-white/10 text-white/60 font-bold rounded-2xl text-lg hover:bg-white/5 transition-all uppercase tracking-widest"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <p className="text-white/30 text-xs text-center max-w-lg">
          Didn't find your pass? If you haven't registered yet,
        </p>
        <button 
          className="px-6 py-3 bg-ted-red border border-ted-red text-white font-bold rounded-full text-sm hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(235,0,40,0.2)]"
          onClick={() => {
            // Since we are in a sub-component, we'll assume the user will navigate 
            // via the TabNav, but providing a visual button here as requested.
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Register Now
        </button>
        <p className="text-white/20 text-[10px] uppercase tracking-widest mt-4">
          For technical issues, CONTACT US
        </p>
      </div>
    </section>
  );
}
