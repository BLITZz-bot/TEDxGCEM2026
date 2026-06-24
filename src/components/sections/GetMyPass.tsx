"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { useAuth } from "@/hooks/useAuth";
import { EventSettings } from "@/lib/settings-service";

interface GetMyPassProps {
  onTabChange: (id: TabId) => void;
  settings?: EventSettings | null;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  organization: string;
  ticket_status: string;
}

export default function GetMyPass({ onTabChange, settings }: GetMyPassProps) {
  const { user, loading, loginWithGoogle } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);

  const checkRegistration = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/pass");
      const data = await res.json();
      if (res.ok) {
        setRegistration(data.registration);
      } else {
        throw new Error(data.error || "Failed to retrieve pass.");
      }
    } catch (err) {
      console.error("Error fetching registration:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Wait until settings are loaded to determine if we should fetch
    if (settings === null || settings === undefined) {
      return;
    }

    if (settings.reveal_tickets === false) {
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (user && user.email) {
      const timer = setTimeout(() => {
        checkRegistration();
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setRegistration(null);
        setIsChecking(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, settings]);

  const handlePrint = () => {
    window.print();
  };

  if (settings?.reveal_tickets === false) {
    return (
      <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col justify-center items-center font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-ted-dark-gray/50 border border-white/10 p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />
          
          <div className="w-20 h-20 bg-ted-red/20 border border-ted-red/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EB0028" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h4 className="text-3xl font-black uppercase tracking-tight text-white">Downloads Closed</h4>
            <p className="text-white/60 max-w-md mx-auto text-xs leading-relaxed font-sans font-light">
              Ticket pass checking and downloads for TEDxGCEM 2026 are currently closed. Check back closer to the event schedule, or log in with your admin credentials to modify setting options.
            </p>
          </div>
          <button 
            onClick={() => onTabChange("home")}
            className="px-8 py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-full text-xs transition-all uppercase tracking-widest cursor-pointer border border-ted-red shadow-[0_0_15px_rgba(235,0,40,0.25)]"
          >
            Return Home
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col print:pt-0 print:pb-0 print:px-0">
      {/* Hero Banner Manifesto - Hide during print */}
      <div className="w-full mb-24 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16 print:hidden">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
        >
          RETRIEVE YOUR <br />
          ATTENDEE <span className="text-ted-red">PASS</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
        >
          Access your verified registration, check application status, and view/print your entry pass.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden print:bg-white print:border-none print:p-0 print:text-black print:shadow-none print:rounded-none"
      >
        {/* Decorative Background Element - Hide during print */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full print:hidden" />
        
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {loading || isChecking ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-16"
              >
                <div className="w-10 h-10 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono uppercase tracking-widest text-white/40">Verifying Status...</span>
              </motion.div>
            ) : !user ? (
              <motion.div
                key="login-prompt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-ted-red shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.66a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.66a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M12 18h.01"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Google Login Required</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                    Please sign in with the Google Account you used during registration to retrieve your verified attendee pass.
                  </p>
                </div>

                <button
                  onClick={loginWithGoogle}
                  className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl text-xs hover:bg-ted-red hover:text-white transition-all duration-300 uppercase tracking-widest flex items-center gap-3 cursor-pointer shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </motion.div>
            ) : registration ? (
              <motion.div 
                key="pass-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Status Badge */}
                <div className="flex justify-center print:hidden">
                  {registration.ticket_status === "confirmed" || registration.ticket_status === "approved" ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-500 text-[10px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(34,197,94,0.08)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Ticket Verified & Confirmed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-[10px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(234,179,8,0.08)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      Pending Organizer Approval
                    </span>
                  )}
                </div>

                {registration.ticket_status === "confirmed" || registration.ticket_status === "approved" ? (
                  /* Premium Printable brutalist pass */
                  <div className="max-w-md mx-auto border-2 border-white bg-black p-6 md:p-8 rounded-[1.5rem] relative overflow-hidden print:border-black print:text-black print:bg-white print:rounded-none">
                    {/* Top ticket strip */}
                    <div className="flex justify-between items-start border-b border-dashed border-white/30 pb-6 mb-6 print:border-black/30">
                      <div>
                        <div className="text-xl font-black italic tracking-tighter uppercase">
                          <span className="text-ted-red">TED<span className="lowercase">x</span></span>
                          <span className="text-white print:text-black">GCEM</span>
                        </div>
                        <span className="text-[8px] font-mono tracking-widest text-white/50 print:text-black/50 uppercase">Ideas Worth Spreading</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-mono tracking-widest text-white/40 print:text-black/40 block">TICKET ID</span>
                        <span className="text-xs font-mono font-bold text-white print:text-black">
                          {`TEDX-${registration.id.slice(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                    </div>

                    {/* Pass Details */}
                    <div className="space-y-6">
                      <div>
                        <span className="text-[8px] font-mono tracking-widest text-white/40 print:text-black/40 uppercase block mb-1">ATTENDEE NAME</span>
                        <span className="text-2xl font-black uppercase text-white print:text-black leading-none">{registration.full_name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[8px] font-mono tracking-widest text-white/40 print:text-black/40 uppercase block mb-1">INSTITUTION</span>
                          <span className="text-sm font-bold uppercase text-white print:text-black">{registration.organization}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono tracking-widest text-white/40 print:text-black/40 uppercase block mb-1">ACCESS CATEGORY</span>
                          <span className="text-sm font-bold uppercase text-ted-red">GENERAL PASS</span>
                        </div>
                      </div>

                      {/* Mock Barcode / QR Code for check-in */}
                      <div className="pt-6 border-t border-white/10 flex flex-col items-center justify-center space-y-3 print:border-black/10">
                        {/* Brutalist Barcode representation */}
                        <div className="h-12 w-full bg-white flex gap-[2px] p-2 overflow-hidden justify-center select-none" title="Scan Ticket Code">
                          {Array.from({ length: 60 }).map((_, idx) => {
                            const width = (idx % 3 === 0) ? "w-[3px]" : (idx % 2 === 0) ? "w-[1px]" : "w-[2px]";
                            const opacity = (idx % 7 === 0) ? "bg-transparent" : "bg-black";
                            return <div key={idx} className={`${width} ${opacity} h-full`} />;
                          })}
                        </div>
                        <span className="text-[8px] font-mono tracking-[0.3em] text-white/50 print:text-black/50">
                          {`*TEDX2026${registration.id.slice(0, 8).toUpperCase()}*`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Pending Ticket UI */
                  <div className="max-w-md mx-auto text-center space-y-6 py-6 print:hidden">
                    <p className="text-white/70 leading-relaxed text-sm md:text-base">
                      Hi <span className="text-white font-bold">{registration.full_name}</span>, your registration is currently **Pending Approval**. Our team checks applications in batches to verify details and seating limits.
                    </p>
                    <p className="text-white/40 text-xs font-light">
                      A confirmation email containing payment/ticket instructions will be dispatched to <span className="text-ted-red font-medium">{registration.email}</span> once approved. You can also reload this page to download your pass immediately.
                    </p>
                  </div>
                )}

                {/* Print/Download actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 print:hidden">
                  {registration.ticket_status === "confirmed" || registration.ticket_status === "approved" ? (
                    <button 
                      onClick={handlePrint}
                      className="px-8 py-5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Print Pass
                    </button>
                  ) : (
                    <button 
                      onClick={() => checkRegistration()}
                      className="px-8 py-5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                      Refresh Status
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* No Registration Found */
              <motion.div
                key="no-pass"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center space-y-6 py-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-ted-red shadow-inner mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">No Pass Application Found</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                    We could not find any active attendee pass application associated with your email: <span className="text-white font-bold font-mono">{user.email}</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button 
                    onClick={() => onTabChange("register")}
                    className="px-8 py-4.5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-base shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Navigation Help - Hide during print */}
      <div className="mt-12 flex flex-col items-center gap-4 print:hidden">
        <p className="text-white/20 text-[10px] uppercase tracking-widest">
          For technical issues, CONTACT US
        </p>
      </div>
    </section>
  );
}
