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
        <h3 className="text-4xl md:text-6xl font-black italic">
          ABOUT <span className="text-ted-red uppercase">TED</span><span className="text-ted-red lowercase">x</span><span className="text-white uppercase">GCEM</span>
        </h3>
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
              <span className="text-ted-red italic uppercase">TED</span><span className="text-ted-red italic lowercase">x</span><span className="text-white uppercase">GCEM</span>
            </h4>
            <p className="text-white/70 leading-relaxed">
              TEDxGCEM is a locally organized event that brings people together to share a TED-like experience at the Gopalan College of Engineering and Management. Our mission is to foster &quot;Ideas Worth Spreading&quot; within our campus and the wider community, sparking deep discussion and connection.
            </p>
          </div>
          
          <div className="bg-ted-dark-gray/50 border border-white/10 p-8 rounded-3xl">
            <h4 className="text-2xl font-bold mb-4">What is<span className="text-ted-red uppercase"> TED</span>?</h4>
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
            <h4 className="text-2xl font-bold mb-4">About <span className="text-ted-red uppercase">TED</span></h4>
            <p className="text-white/70 leading-relaxed">
              TED is a nonprofit organization devoted to Ideas Worth Spreading, often in the form of short talks delivered by leading thinkers and doers. Many of these talks are given at TED conferences, intimate TED Salons and thousands of self-organized TEDx events around the world.
            </p>
            <div className="mt-8 pt-6 border-t border-white/5">
              {/* <p className="text-sm text-white/40 italic">
                Follow TED on Twitter at <a href="http://twitter.com/TEDTalks" className="text-ted-red hover:underline">twitter.com/TEDTalks</a>, or on Facebook at <a href="http://www.facebook.com/TED" className="text-ted-red hover:underline">facebook.com/TED</a>.
              </p> */}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Our Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-32"
      >
        <div className="text-center mb-16 overflow-hidden">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2"
          >
            The Organizers
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-black italic uppercase"
          >
            OUR TEAM
          </motion.h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { name: "Team Member 1", role: "Licensee & Organizer" },
            { name: "Team Member 2", role: "Co-Organizer" },
            { name: "Team Member 3", role: "Curation Lead" },
            { name: "Team Member 4", role: "Marketing Lead" },
            { name: "Team Member 5", role: "Production Lead" },
            { name: "Team Member 6", role: "Design Lead" },
            { name: "Team Member 7", role: "Sponsorship Lead" },
            { name: "Team Member 8", role: "Volunteer Lead" },
          ].map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-ted-dark-gray border border-white/5 group-hover:border-ted-red/30 transition-all">
                {/* Stylized Placeholder for Team Member Photo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-ted-red transition-colors">{member.name}</h4>
              <p className="text-xs uppercase tracking-widest text-white/40">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
