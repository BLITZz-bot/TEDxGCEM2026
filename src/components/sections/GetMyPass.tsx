"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GetMyPass() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Ticketing</h2>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase">GET MY PASS</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Ticket Type 1 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-ted-dark-gray/50 border-2 border-ted-red/20 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 bg-ted-red text-white text-[10px] font-bold px-6 py-2 rounded-bl-3xl uppercase tracking-widest">
            Early Bird
          </div>
          <h4 className="text-3xl font-black mb-2">Student Pass</h4>
          <p className="text-white/40 text-sm mb-6">Exclusively for GCEM students with valid ID.</p>
          
          <div className="text-5xl font-black mb-8">
            <span className="text-2xl font-bold">₹</span>499
          </div>

          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Full access to all talks
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Official TEDx Merchandise
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Networking Lunch
            </li>
          </ul>

          <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-ted-red hover:text-white transition-all uppercase tracking-widest">
            Purchase Pass
          </button>
        </motion.div>

        {/* Ticket Type 2 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-ted-dark-gray/50 border border-white/10 rounded-[2.5rem] p-8 flex flex-col"
        >
          <h4 className="text-3xl font-black mb-2">General Pass</h4>
          <p className="text-white/40 text-sm mb-6">Open for all external attendees and professionals.</p>
          
          <div className="text-5xl font-black mb-8">
            <span className="text-2xl font-bold">₹</span>999
          </div>

          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Full access to all talks
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Professional Networking
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-ted-red">✓</span> Networking Lunch & High Tea
            </li>
          </ul>

          <button className="w-full py-4 bg-transparent border border-white/20 text-white font-black rounded-2xl hover:border-ted-red hover:bg-ted-red transition-all uppercase tracking-widest">
            Purchase Pass
          </button>
        </motion.div>
      </div>

      <p className="mt-12 text-white/30 text-xs text-center max-w-lg">
        All passes are non-refundable. Please ensure you have read our attendee guidelines before purchasing. For bulk bookings, please contact us.
      </p>
    </section>
  );
}
