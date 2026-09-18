"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import demoImg from "../../../public/DEMO.webp";
import type { EventSettings } from "@/lib/settings-service";
import { INITIAL_MEMBERS } from "@/lib/members-data";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  image_url: string;
  email?: string;
  linkedin?: string;
  bio: string;
  display_order?: number;
}

interface TeamProps {
  settings: EventSettings | null;
}

// Static team members are loaded directly from INITIAL_MEMBERS

export default function Team({ settings }: TeamProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    // Use static members data
    const staticTeam = INITIAL_MEMBERS.map((m, index) => ({
      id: m.slug,
      name: m.name,
      role: m.role,
      image_url: m.photoUrl,
      email: m.email || undefined,
      linkedin: m.linkedin || undefined,
      bio: m.bio,
      display_order: index
    }));
    setTeam(staticTeam);
    setLoading(false);
  }, []);

  // Disable body scroll and hide mobile hamburger when modal is open
  useEffect(() => {
    if (activeMember) {
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
  }, [activeMember]);

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-24 px-6 relative text-white overflow-hidden font-sans select-none">
      {/* Editorial Vertical Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Organizing Committee Directory Header - Always Visible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="mb-14 sm:mb-20 flex flex-col justify-between items-start gap-4 border-b border-white/10 pb-12 text-left"
        >
          <span className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2">{"// ORG_INDEX"}</span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase">
            ORGANIZING <span className="text-ted-red">COMMITTEE</span>
          </h2>
          <div className="h-[1.5px] w-20 bg-ted-red" />
        </motion.div>

        {settings?.reveal_team !== false ? (
          <AnimatePresence mode="wait">
            {loading ? (
              /* High-tech TEDx shimmer skeleton loading state */
              <motion.div
                key="team-loading-skeletons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                  <div key={idx} className="flex flex-col w-full">
                    {/* Role Title Bar placeholder */}
                    <div className="h-4 w-24 sm:w-28 mx-auto bg-white/10 rounded-full animate-pulse mb-2 sm:mb-3" />

                    {/* Skeleton Card */}
                    <div className="relative flex flex-col items-center justify-center p-2.5 xs:p-3.5 sm:p-4.5 md:p-5 border border-white/15 bg-white/[0.04] backdrop-blur-md rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md sm:rounded-tl-3xl sm:rounded-br-3xl overflow-hidden w-full">
                      {/* Flowing diagonal shimmer */}
                      <motion.div
                        className="absolute -inset-full w-[300%] h-[300%] bg-gradient-to-r from-transparent via-ted-red/[0.08] to-transparent -rotate-45 pointer-events-none"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      />

                      {/* Tech Corner Brackets in TED-red */}
                      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-ted-red z-20" />
                      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-ted-red z-20" />

                      {/* Member Photo Frame Placeholder */}
                      <div className="w-full aspect-square max-w-[145px] xs:max-w-[165px] sm:max-w-[185px] md:max-w-[210px] rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-950/80 p-1 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase">
                            LOADING...
                          </span>
                        </div>
                      </div>

                      {/* Member Name Bar placeholder */}
                      <div className="h-3 w-20 sm:w-24 bg-white/10 rounded-full animate-pulse mt-2.5 sm:mt-3" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : team.length === 0 ? (
              <motion.div
                key="team-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/40 font-mono text-sm py-16"
              >
                No team members registered yet.
              </motion.div>
            ) : (
              <motion.div
                key="team-loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8"
              >
                {team.map((member, index) => (
                  <motion.div
                    key={member.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className="flex flex-col w-full"
                  >
                    {/* Role Title above the card */}
                    <h5 className="text-[10px] sm:text-xs md:text-sm font-mono font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white mb-2 sm:mb-3 text-center truncate px-1" title={member.role}>
                      {member.role}
                    </h5>

                    {/* Glassmorphism Card with exact asymmetric corners */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => setActiveMember(member)}
                      className="flex flex-col items-center justify-center p-2.5 xs:p-3.5 sm:p-4.5 md:p-5 group cursor-pointer transition-all duration-300 border border-white/20 bg-white/[0.04] backdrop-blur-md rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md sm:rounded-tl-3xl sm:rounded-br-3xl hover:border-ted-red/60 hover:bg-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.18)] w-full"
                    >
                      {/* Member Photo Frame */}
                      <div className="w-full aspect-square max-w-[145px] xs:max-w-[165px] sm:max-w-[185px] md:max-w-[210px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 bg-zinc-950/60 p-1 flex items-center justify-center shadow-inner">
                        <img 
                          src={member.image_url || demoImg.src} 
                          alt={`${member.name} Photo`} 
                          className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-all duration-500 group-hover:scale-105" 
                        />
                      </div>

                      {/* Member Name */}
                      <div className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60 group-hover:text-ted-red transition-colors duration-300 mt-2.5 sm:mt-3 text-center font-mono truncate w-full px-1">
                        {member.name}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* Coming Soon placeholder */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className="border-2 border-white/10 p-12 bg-black/40 text-center space-y-4 max-w-2xl mx-auto shadow-[6px_6px_0px_0px_#EB0028] relative overflow-hidden">
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

      {/* Member Profile Modal Dialog (matching Partners modal style) */}
      <AnimatePresence>
        {activeMember && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body with exact asymmetric corners and red corner brackets */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-ted-dark-gray border border-white/10 p-8 md:p-10 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-xl rounded-bl-xl shadow-2xl z-10 overflow-hidden flex flex-col items-center text-center cursor-default max-h-[90vh] overflow-y-auto scrollbar-none"
            >
              {/* Decorative Corner Tech Bracket */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ted-red" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ted-red" />

              {/* Close Button */}
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-4 left-4 right-auto sm:left-auto sm:right-4 text-white/40 hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {/* Role Badge */}
              <span className="text-[9px] font-mono tracking-widest font-black uppercase px-2.5 py-0.5 rounded-sm mb-6 bg-ted-red/10 text-ted-red">
                {activeMember.role}
              </span>

              {/* Member Photo */}
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-2 bg-black/40 p-1 flex items-center justify-center shrink-0">
                <img 
                  src={activeMember.image_url || demoImg.src} 
                  alt={`${activeMember.name} Photo`} 
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>

              {/* Member Name */}
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mt-4 font-mono">
                {activeMember.name}
              </h3>

              {/* Member Bio */}
              {activeMember.bio && (
                <p className="text-white/60 text-sm md:text-base leading-relaxed font-light mt-4 mb-2 whitespace-pre-line">
                  {activeMember.bio}
                </p>
              )}

              {/* Interactive Profile Link (if member has dedicated profile page) */}
              {(() => {
                const matched = INITIAL_MEMBERS.find(
                  (m) =>
                    m.name.trim().toLowerCase() === activeMember.name.trim().toLowerCase() ||
                    m.slug.toLowerCase() === activeMember.name.trim().toLowerCase().replace(/\s+/g, "-")
                );
                if (matched) {
                  return (
                    <Link
                      href={`/team/${matched.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-1.5 mt-2 bg-white/5 hover:bg-ted-red/15 border border-white/10 hover:border-ted-red/40 rounded-full text-[10px] font-mono tracking-wider text-white/80 hover:text-white transition-all group cursor-pointer"
                    >
                      <span>Explore Full Profile</span>
                      <svg className="w-3 h-3 text-ted-red transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </Link>
                  );
                }
                return null;
              })()}

              {/* Divider */}
              {(activeMember.email || activeMember.linkedin) && (
                <div className="w-full h-[1.5px] bg-white/5 my-6" />
              )}

              {/* Contact & Social Links Grid */}
              {(activeMember.email || activeMember.linkedin) && (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left text-xs font-mono mb-8">
                  {activeMember.email && (
                    <a 
                      href={`mailto:${activeMember.email}`}
                      className="flex items-center gap-2.5 px-4 py-3 border border-white/5 bg-white/[0.01] hover:bg-ted-red/5 hover:border-ted-red/30 transition-all duration-150 rounded-xl group text-white/70 hover:text-white"
                    >
                      <svg className="w-4.5 h-4.5 text-ted-red transition-transform duration-150 group-hover:scale-110 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-0.5 font-bold font-mono">Email</span>
                        <span className="truncate block text-white/90 group-hover:text-white transition-colors">{activeMember.email}</span>
                      </div>
                    </a>
                  )}
                  {activeMember.linkedin && activeMember.linkedin.trim() && (
                    <a 
                      href={activeMember.linkedin.trim().startsWith("http") ? activeMember.linkedin.trim() : `https://${activeMember.linkedin.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-3 border border-white/5 bg-white/[0.01] hover:bg-[#0077B5]/10 hover:border-[#0077B5]/40 transition-all duration-150 rounded-xl group text-white/70 hover:text-white"
                    >
                      <svg className="w-4.5 h-4.5 text-[#0077B5] transition-transform duration-150 group-hover:scale-110 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-0.5 font-bold font-mono">LinkedIn</span>
                        <span className="truncate block text-white/90 group-hover:text-white transition-colors">Connect ↗</span>
                      </div>
                    </a>
                  )}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => setActiveMember(null)}
                className="px-8 py-3.5 bg-ted-red text-white font-black rounded-2xl text-[11px] shadow-[0_0_20px_rgba(235,0,40,0.25)] hover:shadow-[0_0_30px_rgba(235,0,40,0.45)] hover:bg-white hover:text-ted-red transition-all duration-150 uppercase tracking-widest cursor-pointer mt-2"
              >
                Back to Team
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
