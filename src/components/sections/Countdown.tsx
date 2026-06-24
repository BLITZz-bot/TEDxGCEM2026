"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { TabId } from "@/components/ui/TabNav";

interface CountdownProps {
  onTabChange: (id: TabId) => void;
  settings?: {
    theme_name: string;
    reveal_theme: boolean;
    reveal_date: boolean;
    reveal_countdown: boolean;
    event_date: string;
    event_time: string;
    event_day: string;
    countdown_target: string;
  } | null;
}

export default function Countdown({ onTabChange, settings }: CountdownProps) {
  const targetDateStr = settings?.countdown_target || "2026-10-15T09:00:00";
  
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
    isLive: false,
  });

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
          isLive: true,
        });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
        isLive: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section className="min-h-screen pt-24 md:pt-32 pb-24 px-6 relative text-white overflow-hidden font-sans select-none flex flex-col justify-center">
      {/* Editorial Vertical Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      {/* Pulsing Concentric Ripple Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute w-[200px] h-[200px] rounded-full border border-ted-red/10 animate-[ping_4s_ease-in-out_infinite]" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-ted-red/5 animate-[ping_6s_ease-in-out_infinite_1s]" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 animate-[ping_8s_ease-in-out_infinite_2s]" />
      </div>

      {/* Decorative Gradient Glows */}
      <div className="absolute inset-y-0 left-0 w-32 pointer-events-none bg-gradient-to-r from-ted-red/5 to-transparent z-0" />
      <div className="absolute inset-y-0 right-0 w-32 pointer-events-none bg-gradient-to-l from-ted-red/5 to-transparent z-0" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-ted-red text-xs uppercase tracking-[0.3em] font-mono block mb-2"
            >
              
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight"
            >
              EVENT COUNTDOWN
            </motion.h2>
          </div>
          
        </div>

        {/* Live Status Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <AnimatePresence mode="wait">
            {timeLeft.isLive ? (
              <motion.div
                key="live"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex items-center gap-3 px-6 py-3 bg-ted-red text-white font-mono uppercase tracking-[0.2em] text-sm md:text-base border border-white/20 shadow-[0_0_25px_rgba(235,0,40,0.4)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>TEDxGCEM 2026 is LIVE!</span>
              </motion.div>
            ) : (
              <motion.div
                key="countdown-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 font-mono text-xs uppercase tracking-[0.35em]"
              >
                {settings && (!settings.reveal_countdown || !settings.reveal_date) ? "COUNTDOWN STANDBY" : "The countdown is ticking"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bento Grid Countdown Block */}
        {settings && (!settings.reveal_countdown || !settings.reveal_date) ? (
          <div className="border border-dashed border-white/20 bg-neutral-950/40 backdrop-blur-md p-8 md:p-12 rounded-3xl max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-4 mb-16 shadow-[0_0_30px_rgba(235,0,40,0.05)] hover:border-ted-red/30 transition-all duration-300">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[10px] uppercase tracking-widest font-black font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
              Transmission Pending
            </span>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase">
                COUNTDOWN COMMENCING SOON
              </h3>
              <p className="text-[10px] md:text-xs font-mono text-white/40 max-w-md mx-auto leading-relaxed">
                The master sequence timer will initiate upon the official announcement of the event date and schedule. Pre-registrations remain active.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 xs:gap-3 md:gap-6 mb-16 max-w-2xl mx-auto">
            {timeBlocks.map((block, idx) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 xs:p-3 md:p-6 flex flex-col items-center justify-center shadow-lg hover:border-ted-red/50 hover:bg-neutral-900/60 transition-all duration-300 relative group cursor-default"
              >
                {/* Top ambient accent dot */}
                <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-ted-red mb-1 md:mb-2 transition-colors duration-300" />

                {/* Ticking Number */}
                <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white select-none">
                  {block.value}
                </span>

                {/* Label */}
                <span className="text-[7px] xs:text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors duration-300 mt-1">
                  {block.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Details & RSVP Bento Box Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Card 1: Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-8 bg-black border-2 border-white p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
          >
            <div>
             
              <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white mb-4 leading-tight">
                GCEM MAIN AUDITORIUM
              </h3>
              <p className="text-white/60 text-xs md:text-sm font-light leading-relaxed max-w-2xl font-mono">
                Get ready for GCEM&apos;s flagship independent event. We have curated a stellar lineup of speakers and performers.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between text-[10px] text-white/40 font-mono">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-ted-red" />
                <span>VENUE: Gopalan College of Engineering & Management, Bangalore</span>
              </div>
              {(!settings || settings.reveal_date) && (
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-ted-red" />
                  <span>
                    DATE: {settings ? settings.event_date : "October 15, 2026"} {"//"} {settings ? settings.event_time : "09:00 AM"} IST
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 2: RSVP CTA Action Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-4 bg-zinc-950 border-2 border-white p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#EB0028] hover:shadow-[12px_12px_0px_0px_#EB0028] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300 group"
          >
            <div className="space-y-4">
             
              <h4 className="text-xl font-black italic text-white uppercase leading-tight">
                SECURE YOUR PASS
              </h4>
              <p className="text-white/50 text-[11px] font-light leading-relaxed font-mono">
                Seats are strictly limited. Tickets are rolled out in batches.<br/>Get your tickets now !!
              </p>
            </div>

            <button
              onClick={() => onTabChange("register")}
              className="mt-6 w-full py-3 bg-ted-red hover:bg-white text-white hover:text-black font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2 border border-ted-red group-hover:-translate-y-1 group-hover:shadow-lg"
            >
              <Ticket size={14} />
              <span>GET YOUR TICKETS</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
