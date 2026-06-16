"use client";

import React from "react";
import { motion } from "framer-motion";
import demoImg from "../../../public/DEMO.png";

export default function About() {
  const team = [
    { name: "Aarav Sharma", role: "Licensee & Organizer" },
    { name: "Diya Iyer", role: "Co-Organizer" },
    { name: "Rohan Verma", role: "Curation Lead" },
    { name: "Kavya Menon", role: "Design & Tech Lead" },
    { name: "Vikram Sen", role: "Marketing & PR Lead" },
    { name: "Ananya Rao", role: "Operations & Production Lead" },
    { name: "Siddharth Nair", role: "Sponsorship & Finance Lead" },
    { name: "Meera Patel", role: "Volunteer Coordinator" }
  ];

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-24 px-6 relative text-white overflow-hidden font-sans select-none">
      
      {/* Editorial Vertical Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      {/* Decorative gradients */}
      <div className="absolute inset-y-0 left-0 w-32 pointer-events-none bg-gradient-to-r from-ted-red/5 to-transparent z-0" />
      <div className="absolute inset-y-0 right-0 w-32 pointer-events-none bg-gradient-to-l from-ted-red/5 to-transparent z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Hero Banner Manifesto */}
        <div className="mb-24 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
          >
            YOUR IDEA <br />
            BELONGS ON <span className="text-ted-red">STAGE</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
          >
            We are looking for bold thinkers with ideas worth spreading. Each year, TEDxGCEM brings new voices to the community.
          </motion.p>
        </div>

        {/* Asymmetric Bento Section presenting Mission Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32 items-stretch">
          
          {/* Main Card: TEDxGCEM (Takes 8 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="md:col-span-8 bg-black border-2 border-white p-8 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <h3 className="text-3xl font-black italic uppercase text-white mb-4 leading-tight">
                THE LOCAL STAGE: <span className="not-italic"><span className="text-ted-red">TEDx</span>GCEM</span>
              </h3>
              <p className="text-white/60 leading-relaxed text-sm md:text-base font-light">
                TEDxGCEM is an independently organized event licensed by TED, hosted at the Gopalan College of Engineering and Management. Our forum brings together leading visionaries, developers, artists, and activists to share powerful messages, stimulating meaningful conversation and creating local community connection.
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/40">
              <span className="font-mono">HOST: GCEM BANGALORE</span>
              <div className="flex items-center gap-2 text-ted-red font-bold uppercase cursor-pointer group-hover:text-white transition-colors duration-300">
                <span className="group-hover:translate-x-1.5 transition-transform duration-300">View Guidelines</span>
                <svg width="22" height="8" viewBox="0 0 22 8" fill="currentColor" className="transform group-hover:translate-x-1.5 transition-transform duration-300">
                  <path d="M21.1035 3.75177L14.5377 7.50366L14.5377 -0.000122357L21.1035 3.75177Z" />
                  <path d="M0 3.75183H15.9455" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Column block: Program specifications (Takes 4 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-4 flex flex-col gap-6"
          >
            
            <div className="flex-1 bg-black border-2 border-white p-6 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col justify-between cursor-pointer">
              <div>
                <h4 className="text-lg font-black italic text-white uppercase mb-2">WHAT IS <span className="not-italic">TEDx</span>?</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">
                  A program of self-organized local events combining live speakers and recorded talks to spark deep community discussion and connection.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-black border-2 border-white p-6 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col justify-between cursor-pointer">
              <div>
                <h4 className="text-lg font-black italic text-white uppercase mb-2">WHAT IS <span className="not-italic">TED</span>?</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">
                  A global nonprofit organization dedicated to Ideas Worth Spreading, hosting annual summits, and translating powerful talks globally.
                </p>
              </div>
            </div>

          </motion.div>

          {/* Theme Card: Transforming Perspectives (Takes 12 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-12 bg-black border-2 border-white p-8 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
          >
            <div className="max-w-xl">
              <h4 className="text-2xl font-black italic text-white uppercase mb-2">
                THEME: <span className="text-ted-red">TRANSFORMING PERSPECTIVES</span>
              </h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.
              </p>
            </div>
            <div className="w-12 h-12 rounded-none border border-white/15 flex items-center justify-center text-white/40 shrink-0 group-hover:border-ted-red/40 group-hover:text-ted-red transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[spin_8s_linear_infinite]"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
          </motion.div>

        </div>

        {/* Organizing Committee Directory */}
        <div className="mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="border-b border-white/10 pb-6 mb-16"
          >
            <span className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2">{"// ORG_INDEX"}</span>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              THE ORGANIZING COMMITTEE
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative w-full bg-black border-2 border-white rounded-none shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-4 md:p-6 select-none"
              >
                {/* Visual photo frame inside card */}
                <div className="relative aspect-square w-full overflow-hidden border border-white mb-3 md:mb-4 pointer-events-none">
                  <img 
                    src={demoImg.src} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="mt-2">
                  <div className="flex items-start gap-1.5 md:gap-2 mb-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-ted-red shrink-0 mt-[6px] md:mt-[9px]" />
                    <h4 className="text-sm md:text-lg font-black italic text-white uppercase tracking-tight font-mono leading-tight break-words">{member.name}</h4>
                  </div>
                  <p className="text-[10px] md:text-xs text-white/40 font-mono tracking-wider break-words leading-tight pl-[12px] md:pl-[16px]">
                    {member.role}
                  </p>
                </div>

              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
