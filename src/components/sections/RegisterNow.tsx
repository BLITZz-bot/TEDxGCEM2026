"use client";

import React from "react";
import { motion } from "framer-motion";

export default function RegisterNow() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Join the Conversation</h2>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase">REGISTER NOW</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm"
      >
        <div className="space-y-8">
          <div className="text-center mb-10">
            <p className="text-white/60">
              Complete the form below to register for TEDxGCEM 2026. Limited seats available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+91 XXXXX XXXXX" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Organization / College</label>
              <input 
                type="text" 
                placeholder="GCEM" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Why do you want to attend?</label>
            <textarea 
              rows={4}
              placeholder="Tell us what excites you about TEDxGCEM..." 
              className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-ted-red transition-all text-white resize-none"
            />
          </div>

          <button className="w-full py-5 bg-ted-red text-white font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] transition-all uppercase tracking-widest">
            Submit Registration
          </button>
        </div>
      </motion.div>
    </section>
  );
}
