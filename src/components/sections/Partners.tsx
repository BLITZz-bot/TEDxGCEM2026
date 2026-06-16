"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const partners = [
  { 
    name: "Global Tech Corp", 
    level: "Platinum", 
    logo: "/GRAFIK1.png",
    description: "Global Tech Corp is a leading multinational technology firm specializing in enterprise software development, cloud infrastructure, and digital transformation services.",
    email: "sponsor@globaltech.corp",
    phone: "+91 98765 43210"
  },
  { 
    name: "Future Systems", 
    level: "Platinum", 
    logo: "/GRAFIK1.png",
    description: "Future Systems is at the forefront of cyber-physical engineering, delivering automation, robotics, and smart city infrastructure solutions worldwide.",
    email: "info@futuresystems.net",
    phone: "+91 87654 32109"
  },
  { 
    name: "Innovate AI", 
    level: "Gold", 
    logo: "/GRAFIK1.png",
    description: "Innovate AI leverages state-of-the-art machine learning models to provide automated business analytics, predictive modeling, and intelligent agent systems.",
    email: "partnership@innovate.ai",
    phone: "+91 76543 21098"
  },
  { 
    name: "Eco Solutions", 
    level: "Gold", 
    logo: "/GRAFIK1.png",
    description: "Eco Solutions develops sustainable technologies, green energy grids, and resource management software to help enterprises lower their carbon footprints.",
    email: "hello@ecosolutions.org",
    phone: "+91 65432 10987"
  },
  { 
    name: "Creative Media", 
    level: "Silver", 
    logo: "/GRAFIK1.png",
    description: "Creative Media is an award-winning digital design agency crafting immersive web experiences, brand identities, and high-impact marketing campaigns.",
    email: "design@creativemedia.com",
    phone: "+91 54321 09876"
  },
  { 
    name: "Urban Planning Co", 
    level: "Silver", 
    logo: "/GRAFIK1.png",
    description: "Urban Planning Co designs smart architectural spaces and coordinates eco-friendly community infrastructure projects for futuristic municipalities.",
    email: "build@urbanplanning.co",
    phone: "+91 43210 98765"
  },
  { 
    name: "NextGen Education", 
    level: "Silver", 
    logo: "/GRAFIK1.png",
    description: "NextGen Education provides online learning platforms, interactive academic curricula, and AI-driven tutoring tools to schools across the globe.",
    email: "edu@nextgen.org",
    phone: "+91 32109 87654"
  },
  { 
    name: "Digital Arts", 
    level: "Silver", 
    logo: "/GRAFIK1.png",
    description: "Digital Arts is a creative collaborative providing digital illustration, visual effects, and high-fidelity rendering software to creators.",
    email: "art@digitalarts.io",
    phone: "+91 21098 76543"
  },
];

export default function Partners() {
  const [activePartner, setActivePartner] = useState<typeof partners[0] | null>(null);

  // Disable body scroll and hide mobile hamburger when modal is open
  useEffect(() => {
    if (activePartner) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [activePartner]);

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Sticky Editorial Manifesto */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit space-y-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[10px] uppercase tracking-widest font-black font-mono shadow-[0_0_15px_rgba(235,0,40,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-ted-red" />
              Sponsorships 2026
            </span>
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase text-white">
              POWERING THE <br />
              LOCAL <span className="text-ted-red">MOVEMENT</span>
            </h2>
            <div className="h-[1.5px] w-20 bg-ted-red" />
          </div>
          
          <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-md">
            Our partners enable us to create a platform for ideas that shape the future. By supporting TEDxGCEM, they help amplify voices that challenge, inspire, and redefine our community narrative.
          </p>

          <div className="pt-4">
            <a 
              href="mailto:tedxgcem@gmail.com"
              className="group relative inline-flex items-center gap-3 px-8 py-4.5 bg-ted-red text-white font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest cursor-pointer"
            >
              <span>Partner With Us</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Scrollable Logo Grid */}
        <div className="lg:col-span-7 space-y-20">
          
          {/* Platinum Partners */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-ted-red" />
              <h4 className="text-white/50 uppercase tracking-[0.3em] text-[10px] font-mono font-bold">Platinum Partners</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {partners.filter(p => p.level === "Platinum").map((partner, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  onClick={() => setActivePartner(partner)}
                  className="flex flex-col items-center justify-center p-8 group cursor-pointer transition-all duration-300 border border-white/20 bg-white/[0.04] backdrop-blur-md rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md hover:border-ted-red/60 hover:bg-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.18)]"
                >
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} Logo`} 
                    className="w-full max-w-[200px] h-28 object-contain transition-all duration-500" 
                  />
                  <div className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white group-hover:text-ted-red transition-colors duration-300 mt-4 text-center">
                    {partner.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gold Partners */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <h4 className="text-white/50 uppercase tracking-[0.3em] text-[10px] font-mono font-bold">Gold Partners</h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {partners.filter(p => p.level === "Gold").map((partner, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  onClick={() => setActivePartner(partner)}
                  className="flex flex-col items-center justify-center p-6 group cursor-pointer transition-all duration-300 border border-white/20 bg-white/[0.04] backdrop-blur-md rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm hover:border-ted-red/60 hover:bg-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(235,0,40,0.15)]"
                >
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} Logo`} 
                    className="w-full max-w-[150px] h-20 object-contain transition-all duration-500" 
                  />
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-ted-red transition-colors duration-300 mt-3.5 text-center">
                    {partner.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Silver Partners (Spans full width below the split columns) */}
      <div className="mt-24 border-t border-white/5 pt-16">
        <div className="flex items-center gap-3 mb-10">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <h4 className="text-white/50 uppercase tracking-[0.3em] text-[10px] font-mono font-bold">Silver Partners</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {partners.filter(p => p.level === "Silver").map((partner, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              onClick={() => setActivePartner(partner)}
              className="flex flex-col items-center justify-center p-5 group cursor-pointer transition-all duration-300 border border-white/20 bg-white/[0.04] backdrop-blur-md rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm hover:border-ted-red/60 hover:bg-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(235,0,40,0.12)]"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} Logo`} 
                className="w-full max-w-[130px] h-16 object-contain transition-all duration-500" 
              />
              <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white group-hover:text-ted-red transition-colors duration-300 mt-3 text-center">
                {partner.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partner Info Modal Dialog */}
      <AnimatePresence>
        {activePartner && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePartner(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-ted-dark-gray border border-white/10 p-8 md:p-10 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-xl rounded-bl-xl shadow-2xl z-10 overflow-hidden flex flex-col items-center text-center cursor-default"
            >
              {/* Decorative Corner Tech Bracket */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ted-red" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ted-red" />

              {/* Close Button */}
              <button
                onClick={() => setActivePartner(null)}
                className="absolute top-4 left-4 right-auto sm:left-auto sm:right-4 text-white/40 hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              {/* Badge */}
              <span className={`text-[9px] font-mono tracking-widest font-black uppercase px-2.5 py-0.5 rounded-sm mb-6 ${
                activePartner.level === "Platinum" ? "bg-ted-red/10 text-ted-red" :
                activePartner.level === "Gold" ? "bg-yellow-500/10 text-yellow-500" :
                "bg-white/10 text-white/70"
              }`}>
                {activePartner.level} Partner
              </span>

              {/* Logo */}
              <div className="w-full h-32 flex items-center justify-center p-4">
                <img 
                  src={activePartner.logo} 
                  alt={`${activePartner.name} Logo`} 
                  className="w-auto h-full max-h-24 object-contain" 
                />
              </div>

              {/* Name */}
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mt-4">
                {activePartner.name}
              </h3>

              {/* Description */}
              <p className="text-white/60 text-sm md:text-base leading-relaxed font-light mt-4 mb-2">
                {activePartner.description}
              </p>

              {/* Divider */}
              <div className="w-full h-[1.5px] bg-white/5 my-6" />

              {/* Contact Info Footer Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs font-mono mb-8">
                {activePartner.email && (
                  <a 
                    href={`mailto:${activePartner.email}`}
                    className="flex items-center gap-2.5 px-4 py-3 border border-white/5 bg-white/[0.01] hover:bg-ted-red/5 hover:border-ted-red/30 transition-all duration-150 rounded-xl group text-white/70 hover:text-white"
                  >
                    <svg className="w-4.5 h-4.5 text-ted-red transition-transform duration-150 group-hover:scale-110 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-0.5 font-bold font-mono">Email</span>
                      <span className="truncate block text-white/90 group-hover:text-white transition-colors">{activePartner.email}</span>
                    </div>
                  </a>
                )}
                {activePartner.phone && (
                  <a 
                    href={`tel:${activePartner.phone}`}
                    className="flex items-center gap-2.5 px-4 py-3 border border-white/5 bg-white/[0.01] hover:bg-ted-red/5 hover:border-ted-red/30 transition-all duration-150 rounded-xl group text-white/70 hover:text-white"
                  >
                    <svg className="w-4.5 h-4.5 text-ted-red transition-transform duration-150 group-hover:scale-110 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-0.5 font-bold font-mono">Phone</span>
                      <span className="block text-white/90 group-hover:text-white transition-colors">{activePartner.phone}</span>
                    </div>
                  </a>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => setActivePartner(null)}
                className="px-8 py-3.5 bg-ted-red text-white font-black rounded-2xl text-[11px] shadow-[0_0_20px_rgba(235,0,40,0.25)] hover:shadow-[0_0_30px_rgba(235,0,40,0.45)] hover:bg-white hover:text-ted-red transition-all duration-150 uppercase tracking-widest cursor-pointer"
              >
                Back to Partners
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
