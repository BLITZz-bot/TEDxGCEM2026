"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden relative">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ted-red/10 blur-[120px] rounded-full z-0" />

      {/* Live Design Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-ted-red/20 rounded-full blur-xl"
            initial={{ 
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0.1 
            }}
            animate={{ 
              x: [
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%"
              ],
              y: [
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%"
              ],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
        
        {/* Animated Lines/Grid hint */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h2 className="font-bold text-2xl mb-4 tracking-widest">
          <span className="text-ted-red uppercase">TED</span><span className="text-ted-red lowercase">x</span><span className="text-white uppercase">GCEM</span> 2026
        </h2>
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
          IDEAS WORTH <br />
          <span className="text-white">
            SPREADING
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-white/60 text-lg md:text-xl mb-12">
          Join us at GCEM for a day of transformative talks that challenge the status quo and ignite new perspectives.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-ted-red text-white font-bold rounded-full text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] transition-all"
          >
            Get Tickets
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full text-lg hover:bg-white/5 transition-all"
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>

      {/* Mandatory Disclaimer in Hero or Footer? Footer is better, but a hint here is fine */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 text-xs tracking-widest text-white/50 uppercase"
      >
        This independent TEDx event is operated under license from TED.
      </motion.p>
    </section>
  );
}
