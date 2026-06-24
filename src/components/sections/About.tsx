"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import demoImg from "../../../public/DEMO.png";
import type { EventSettings } from "@/lib/settings-service";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  image_url: string;
  email?: string;
  linkedin?: string;
  bio: string;
}

interface AboutProps {
  settings: EventSettings | null;
}

export default function About({ settings }: AboutProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.team) {
          setTeam(data.team);
        }
      })
      .catch((err) => console.error("Error loading team members:", err))
      .finally(() => setLoading(false));
  }, []);

  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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

          {/* Theme Card: Dynamic Theme Name & Description (Takes 12 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-12 bg-black border-2 border-white p-8 rounded-none transition-all duration-300 shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
          >
            <div className="max-w-xl">
              <h4 className="text-2xl font-black italic text-white uppercase mb-2">
                THEME: <span className="text-ted-red">{settings?.reveal_about_theme ? (settings.about_theme_name || "TRANSFORMING PERSPECTIVES") : "THEME REVEALING SOON"}</span>
              </h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                {settings?.reveal_about_theme ? (
                  settings.about_theme_desc || "This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure."
                ) : (
                  "The theme for the upcoming TEDxGCEM event will be revealed soon. Stay tuned for a journey that will challenge your perceptions, spark curiosity, and inspire new ways of thinking."
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-none border border-white/15 flex items-center justify-center text-white/40 shrink-0 group-hover:border-ted-red/40 group-hover:text-ted-red transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[spin_8s_linear_infinite]"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
          </motion.div>

        </div>

        {/* Organizing Committee Directory */}
        {settings?.reveal_team !== false ? (
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

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : team.length === 0 ? (
              <p className="text-center text-white/40 font-mono text-sm py-16">No team members registered yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={member.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    style={{ perspective: "1000px" }}
                    className="w-full h-[310px] xs:h-[330px] sm:h-[360px] md:h-[400px] lg:h-[430px] select-none group"
                  >
                    <div
                      onClick={() => toggleFlip(index)}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: flippedCards[index] ? "rotateY(180deg)" : "rotateY(0deg)",
                        cursor: "pointer"
                      }}
                      className="w-full h-full relative"
                    >
                      {/* FRONT FACE */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden"
                        }}
                        className="w-full h-full bg-black border-2 border-white p-4 md:p-5 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] group-hover:shadow-[12px_12px_0px_0px_#EB0028] group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 transition-all duration-300"
                      >
                        <div>
                          {/* Visual photo frame inside card */}
                          <div className="relative aspect-square w-full overflow-hidden border border-white mb-3 md:mb-4 pointer-events-none bg-zinc-950">
                            <img 
                              src={member.image_url || demoImg.src} 
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
                            <p className="text-[10px] md:text-xs text-white/40 font-mono tracking-wider break-words leading-tight pl-[12px] md:pl-[16px] mb-2">
                              {member.role}
                            </p>
                            
                            {/* Interactive Mail & LinkedIn Connects on Front Face */}
                            {(member.email || member.linkedin) && (
                              <>
                                <div className="h-[1px] bg-white/10 my-2 ml-[12px] md:ml-[16px]" />
                                <div className="flex items-center gap-2 pl-[12px] md:pl-[16px]">
                                  {member.email && (
                                    <a
                                      href={`mailto:${member.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 p-1.5 border border-white/10 hover:border-ted-red flex items-center justify-center"
                                      title={`Email ${member.name}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </a>
                                  )}
                                  {member.linkedin && (
                                    <a
                                      href={member.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 p-1.5 border border-white/10 hover:border-ted-red flex items-center justify-center"
                                      title={`${member.name}'s LinkedIn`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                                    </a>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)"
                        }}
                        className="w-full h-full bg-neutral-950 border-2 border-white p-4 md:p-5 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] group-hover:shadow-[12px_12px_0px_0px_#EB0028] group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 transition-all duration-300"
                      >
                        {/* Top: Biography */}
                        <div className="space-y-2 overflow-y-auto pr-1 scrollbar-none max-h-[140px] xs:max-h-[160px] sm:max-h-[180px] md:max-h-[220px]">
                          <span className="text-ted-red text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-mono block">{"// PROFILE"}</span>
                          <p className="text-[10px] md:text-[11px] lg:text-[12px] text-white/70 leading-relaxed font-light font-mono whitespace-pre-line">
                            {member.bio}
                          </p>
                        </div>

                        {/* Bottom: Designation & Social Connects */}
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <div className="flex items-start gap-1.5 md:gap-2 mb-1">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-ted-red shrink-0 mt-[5px] md:mt-[7px]" />
                            <h4 className="text-xs md:text-md lg:text-lg font-black italic text-white uppercase tracking-tight font-mono leading-tight break-words">{member.name}</h4>
                          </div>
                          <p className="text-[9px] md:text-[10px] text-white/40 font-mono tracking-wider break-words leading-tight pl-[12px] md:pl-[16px] mb-2">
                            {member.role}
                          </p>
                          
                          {/* Interactive Mail & LinkedIn Connects */}
                          {(member.email || member.linkedin) && (
                            <>
                              <div className="h-[1px] bg-white/10 my-2 ml-[12px] md:ml-[16px]" />
                              <div className="flex items-center gap-2 pl-[12px] md:pl-[16px]">
                                {member.email && (
                                  <a
                                    href={`mailto:${member.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 p-1.5 border border-white/10 hover:border-ted-red flex items-center justify-center"
                                    title={`Email ${member.name}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                  </a>
                                )}
                                {member.linkedin && (
                                  <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 p-1.5 border border-white/10 hover:border-ted-red flex items-center justify-center"
                                    title={`${member.name}'s LinkedIn`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className="mt-24 border-2 border-white/10 p-12 bg-black/40 text-center space-y-4 max-w-2xl mx-auto shadow-[6px_6px_0px_0px_#EB0028] relative overflow-hidden">
              <div className="absolute -top-[1.5px] -left-[1.5px] w-3 h-3 border-t-2 border-l-2 border-ted-red" />
              <div className="absolute -top-[1.5px] -right-[1.5px] w-3 h-3 border-t-2 border-r-2 border-ted-red" />
              <div className="absolute -bottom-[1.5px] -left-[1.5px] w-3 h-3 border-b-2 border-l-2 border-ted-red" />
              <div className="absolute -bottom-[1.5px] -right-[1.5px] w-3 h-3 border-b-2 border-r-2 border-ted-red" />
              
              <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white leading-tight">
                THE FACES BEHIND THE EXPERIENCE
              </h3>
              <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-ted-red leading-none">
                COMING
              </h3>
              
              <div className="h-[1.5px] w-12 bg-ted-red/30 mx-auto my-2" />
              
              <p className="text-white font-black font-mono tracking-[0.35em] uppercase text-sm md:text-base animate-pulse">
                SOON
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
