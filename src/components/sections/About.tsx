"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function About() {
  const [activeMember, setActiveMember] = useState<string | null>(null);

  const team = [
    { 
      num: "01",
      name: "Aarav Sharma", 
      role: "Licensee & Organizer", 
      headline: "Ideas belong on stage... and they will shape our future.",
      bio: "Fascinated by the intersection of technology, humanities, and entrepreneurship. Dedicated to building a world-class platform where ideas spark actionable change.",
      email: "aarav@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "02",
      name: "Diya Iyer", 
      role: "Co-Organizer", 
      headline: "Transforming regional ideas into global connections, step by step.",
      bio: "Operations enthusiast and community builder. Passionate about structuring seamless, unforgettable physical and digital experiences.",
      email: "diya@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "03",
      name: "Rohan Verma", 
      role: "Curation Lead", 
      headline: "Searching for the quiet voices that challenge common patterns.",
      bio: "Uncovering voices that deserve to be heard. Constantly seeking narratives that disrupt conventions and prompt deep reflection.",
      email: "rohan@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "04",
      name: "Kavya Menon", 
      role: "Design & Tech Lead", 
      headline: "Visual systems should bridge gaps between ideas and humans.",
      bio: "Creative technologist crafting immersive visual systems, responsive products, and interactive storytelling portals that bridge design and code.",
      email: "kavya@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "05",
      name: "Vikram Sen", 
      role: "Marketing & PR Lead", 
      headline: "Creating digital spaces where community sparks organic dialogue.",
      bio: "Storyteller focused on amplifying local perspectives. Driven by creating digital buzz and meaningful audience engagement.",
      email: "vikram@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "06",
      name: "Ananya Rao", 
      role: "Operations & Production Lead", 
      headline: "Flawless physical execution is the baseline of high storytelling.",
      bio: "Managing complex timelines, sets, audio-visual layouts, and on-ground setups with surgical precision to ensure a flawless stage delivery.",
      email: "ananya@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "07",
      name: "Siddharth Nair", 
      role: "Sponsorship & Finance Lead", 
      headline: "Empowering organizational growth through smart mutual values.",
      bio: "Building strategic corporate alliances and financial frameworks that secure resources and empower long-term community value.",
      email: "siddharth@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    },
    { 
      num: "08",
      name: "Meera Patel", 
      role: "Volunteer Coordinator", 
      headline: "Coordinating human capital is the key to event success.",
      bio: "Empowering our high-energy team of student volunteers, coordinating shifts, and ensuring everyone plays their part in the TEDxGCEM vision.",
      email: "meera@tedxgcem.com", 
      linkedin: "#", 
      instagram: "#" 
    }
  ];

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 relative bg-black text-white overflow-hidden font-sans select-none">
      
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
              <div className="flex justify-between items-center text-[9px] text-white/30 font-mono mb-4 select-none">
                <span>{"[ SYS_LOG: CORE_MANIFEST ]"}</span>
                <span className="text-ted-red font-bold animate-pulse">[ ONLINE ]</span>
              </div>
              <h3 className="text-3xl font-black italic uppercase text-white mb-4 leading-tight">
                THE LOCAL STAGE: <span className="text-ted-red">TEDx</span>GCEM
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
                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono mb-4 select-none">
                  <span>{"[ SPEC: LOCAL_NODE ]"}</span>
                  <span className="text-ted-red font-bold">[ OK ]</span>
                </div>
                <h4 className="text-lg font-black italic text-white uppercase mb-2">WHAT IS TEDx?</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">
                  A program of self-organized local events combining live speakers and recorded talks to spark deep community discussion and connection.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-black border-2 border-white p-6 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col justify-between cursor-pointer">
              <div>
                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono mb-4 select-none">
                  <span>{"[ SPEC: GLOBAL_NODE ]"}</span>
                  <span className="text-ted-red font-bold">[ OK ]</span>
                </div>
                <h4 className="text-lg font-black italic text-white uppercase mb-2">WHAT IS TED?</h4>
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
              <div className="flex justify-between items-center text-[9px] text-white/30 font-mono mb-4 select-none">
                <span>{"[ PARAM: ANNUAL_THEME ]"}</span>
                <span className="text-ted-red font-bold">[ SET_INDEX ]</span>
              </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => setActiveMember(activeMember === member.num ? null : member.num)}
                className="group relative w-full h-[320px] md:h-[400px] bg-black border-2 border-white rounded-none shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 md:p-6 cursor-pointer select-none"
              >
                {/* Visual placeholder inside card */}
                <div className="relative aspect-[16/10] w-full bg-white/[0.015] overflow-hidden border border-white mb-3 md:mb-4 pointer-events-none">
                  <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono select-none">+</div>
                  <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono select-none">+</div>
                  <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono select-none">+</div>
                  <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono select-none">+</div>
                  
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.25] group-hover:opacity-[0.4] transition-opacity duration-300"
                    style={{
                      backgroundImage: "radial-gradient(rgba(235, 0, 40, 0.45) 20%, transparent 20%)",
                      backgroundSize: "6px 6px"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[28px] md:text-[40px] font-black italic text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] group-hover:[-webkit-text-stroke:1px_rgba(235,0,40,0.15)] transition-all duration-300 select-none">
                      TEDx
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-ted-red shrink-0" />
                    <h4 className="text-sm md:text-lg font-black italic text-white uppercase tracking-tight font-mono truncate">{member.name}</h4>
                  </div>
                  <p className="text-[10px] md:text-xs text-white/40 font-mono tracking-wider truncate">
                    {member.role}
                  </p>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-white/40 pt-3 md:pt-4 border-t border-white/5 mt-auto">
                  <span>NODE_{member.num}</span>
                  <span className="text-ted-red font-bold group-hover:translate-x-1 transition-transform duration-300 text-[9px] md:text-[10px]">BIO →</span>
                </div>

                {/* HOVER/TAP BIO PANEL */}
                <div className={`absolute inset-0 bg-black/98 border-t-2 border-ted-red p-4 md:p-6 flex flex-col justify-between transition-transform duration-500 ease-out z-20 ${
                  activeMember === member.num ? "translate-y-0" : "translate-y-[102%] md:group-hover:translate-y-0"
                }`}>
                  <div>
                    <div className="flex justify-between items-center text-[9px] md:text-[10px] text-white/30 border-b border-white/5 pb-2 mb-3 md:mb-4 font-mono select-none">
                      <span>{"// ACCESS_GRANTED"}</span>
                      <span className="text-ted-red">NODE_{member.num}</span>
                    </div>
                    
                    <h4 className="text-xs md:text-sm font-black italic tracking-tight mb-2 md:mb-4 text-white uppercase leading-snug font-mono line-clamp-2 md:line-clamp-none">
                      &ldquo;{member.headline}&rdquo;
                    </h4>
                    
                    <div className="text-[10px] md:text-[11px] text-white/70 font-light leading-relaxed border-l-2 border-ted-red pl-2 md:pl-3 italic mb-2 md:mb-4 max-h-[85px] md:max-h-[140px] overflow-y-auto no-scrollbar select-text">
                      {member.bio}
                    </div>
                  </div>

                  {/* Social contacts */}
                  <div className="border-t border-white/5 pt-3 md:pt-4 flex justify-between items-center text-[9px] md:text-[10px] font-mono mt-auto">
                    <div className="flex gap-3 md:gap-4">
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 hover:text-ted-red transition-colors flex items-center gap-1"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">LINKEDIN</span>
                      </a>
                      <a 
                        href={member.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 hover:text-ted-red transition-colors flex items-center gap-1"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">INSTAGRAM</span>
                      </a>
                    </div>
                    <a 
                      href={`mailto:${member.email}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="text-white/40 hover:text-ted-red transition-colors"
                    >
                      EMAIL
                    </a>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
