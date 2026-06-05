"use client";

import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Our Mission</h2>
        <h3 className="text-4xl md:text-6xl font-black italic">ABOUT TEDxGCEM</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-ted-dark-gray/50 border border-white/10 p-8 rounded-3xl">
            <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-ted-red italic">TEDx</span> GCEM
            </h4>
            <p className="text-white/70 leading-relaxed">
              TEDxGCEM is a locally organized event that brings people together to share a TED-like experience at the Gopalan College of Engineering and Management. Our mission is to foster "Ideas Worth Spreading" within our campus and the wider community, sparking deep discussion and connection.
            </p>
          </div>
          
          <div className="bg-ted-dark-gray/50 border border-white/10 p-8 rounded-3xl">
            <h4 className="text-2xl font-bold mb-4">What is TEDx?</h4>
            <p className="text-white/70 leading-relaxed">
              In the spirit of ideas worth spreading, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection in a small group.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-ted-dark-gray/50 border border-white/10 p-8 rounded-3xl h-full">
            <h4 className="text-2xl font-bold mb-4">About TED</h4>
            <p className="text-white/70 leading-relaxed">
              TED is a nonprofit organization devoted to Ideas Worth Spreading, often in the form of short talks delivered by leading thinkers and doers. Many of these talks are given at TED conferences, intimate TED Salons and thousands of self-organized TEDx events around the world.
            </p>
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-sm text-white/40 italic">
                Follow TED on Twitter at <a href="http://twitter.com/TEDTalks" className="text-ted-red hover:underline">twitter.com/TEDTalks</a>, or on Facebook at <a href="http://www.facebook.com/TED" className="text-ted-red hover:underline">facebook.com/TED</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
