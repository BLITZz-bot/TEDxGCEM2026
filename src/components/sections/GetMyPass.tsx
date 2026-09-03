"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { useAuth } from "@/hooks/useAuth";
import { EventSettings } from "@/lib/settings-service";
import { getEventYear } from "@/lib/utils";

interface GetMyPassProps {
  onTabChange: (id: TabId) => void;
  settings?: EventSettings | null;
}

interface Registration {
  id: string;
  pass_code?: string;
  full_name: string;
  email: string;
  buyer_email?: string | null;
  organization: string;
  designation?: string | null;
  ticket_status: string;
  ticket_count?: number;
  payment_id?: string | null;
  razorpay_payment_id?: string | null;
  utr_number?: string | null;
  payment_method?: string | null;
  amount_paid?: number;
  unit_price?: number;
  delegate_index?: number;
  total_delegates?: number;
}

export default function GetMyPass({ onTabChange, settings }: GetMyPassProps) {
  const { user, loading, loginWithGoogle } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [hasPendingVerification, setHasPendingVerification] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const registration = registrations[selectedIndex] || null;

  const checkRegistration = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/pass");
      const data = await res.json();
      if (res.ok) {
        setHasPendingVerification(!!data.hasPendingVerification);
        if (Array.isArray(data.registrations) && data.registrations.length > 0) {
          setRegistrations(data.registrations);
        } else if (data.registration) {
          setRegistrations([data.registration]);
        } else {
          setRegistrations([]);
        }
      } else {
        throw new Error(data.error || "Failed to retrieve pass.");
      }
    } catch (err) {
      console.error("Error fetching registration:", err);
      setRegistrations([]);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
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
        setRegistrations([]);
        setIsChecking(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, settings]);

  const eventYear = getEventYear(settings?.event_date);
  const ticketId = registration?.pass_code || (
    registration?.id
      ? (registration.id.startsWith("TEDX-") ? registration.id : `TEDX-${registration.id.slice(0, 8).toUpperCase()}`)
      : "TEDX-PASS"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // PORTRAIT CANVAS PASS GENERATOR (1000 × 1600 ULTRA-HD LUXURY DELEGATE BADGE)
  // Generates a pixel-perfect high-resolution replica of the on-screen pass.
  // ─────────────────────────────────────────────────────────────────────────
  const handleDownloadImage = async () => {
    if (!registration) return;
    setIsDownloading(true);

    try {
      const W = 1000;
      const H = 1600;
      const R = 70;

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const roundRectPath = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // 1. Clip outer rounded badge
      ctx.save();
      roundRectPath(0, 0, W, H, R);
      ctx.clip();

      // Deep Black Canvas Background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // 2. Top Red Header Banner
      const headerH = 260;
      ctx.fillStyle = "#EB0028";
      ctx.fillRect(0, 0, W, headerH);

      // Lanyard Notch (Capsule shape at top)
      const slotW = 100;
      const slotH = 34;
      roundRectPath(W / 2 - slotW / 2, 38, slotW, slotH, 17);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Banner Logo: TEDxGCEM 2026
      ctx.font = "italic 900 68px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`TEDxGCEM ${eventYear}`, W / 2, 160);

      // 3. Category Pill: OFFICIAL DELEGATE PASS
      const pillW = 380;
      const pillH = 50;
      const pillY = 300;
      roundRectPath(W / 2 - pillW / 2, pillY, pillW, pillH, 25);
      ctx.fillStyle = "rgba(235, 0, 40, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "#EB0028";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillStyle = "#EB0028";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("● OFFICIAL DELEGATE PASS", W / 2, pillY + pillH / 2 + 1);

      // 4. Attendee Details
      ctx.font = "bold 17px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("ATTENDEE NAME", W / 2, 415);

      // Name (auto-scaling)
      let nameFontSize = 64;
      ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      const nameText = (registration.full_name || "DELEGATE").toUpperCase();
      while (ctx.measureText(nameText).width > W - 140 && nameFontSize > 34) {
        nameFontSize -= 4;
        ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      }
      ctx.fillText(nameText, W / 2, 485);

      // Designation
      if (registration.designation) {
        ctx.font = "bold 22px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = "#EB0028";
        ctx.fillText(registration.designation.toUpperCase(), W / 2, 545);
      }

      // 5. Institution Section
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 590);
      ctx.lineTo(W - 80, 590);
      ctx.stroke();

      ctx.font = "bold 17px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("INSTITUTION", W / 2, 630);

      let orgFontSize = 34;
      ctx.font = `900 ${orgFontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      const orgText = (registration.organization || "GCEM").toUpperCase();
      while (ctx.measureText(orgText).width > W - 160 && orgFontSize > 22) {
        orgFontSize -= 2;
        ctx.font = `900 ${orgFontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      }
      ctx.fillText(orgText, W / 2, 680);

      ctx.beginPath();
      ctx.moveTo(80, 720);
      ctx.lineTo(W - 80, 720);
      ctx.stroke();

      // 6. QR Code Container Box
      const qrBoxSize = 380;
      const qrBoxX = W / 2 - qrBoxSize / 2;
      const qrBoxY = 760;

      roundRectPath(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // 7. Render QR and Finish
      const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://tedxgcem.in";
      const verifyUrl = `${siteOrigin}/api/verify-pass?id=${encodeURIComponent(ticketId)}&email=${encodeURIComponent(registration.email)}`;
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verifyUrl)}&color=000000&bgcolor=ffffff`;

      const finishCanvas = () => {
        // Label under QR Code
        ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("EVENT DAY CHECK-IN SCAN QR", W / 2, qrBoxY + qrBoxSize + 45);

        // Dashed Divider Line
        ctx.setLineDash([12, 8]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(80, 1260);
        ctx.lineTo(W - 80, 1260);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pass ID text (Bright Red)
        ctx.font = "900 34px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = "#EB0028";
        ctx.fillText(ticketId, W / 2, 1330);

        // Venue Subtitle
        ctx.font = "bold 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillText("VENUE: GCEM AUDITORIUM, BENGALURU", W / 2, 1380);

        // Restore clipping mask
        ctx.restore();

        // 8. Outer Crisp White Border
        roundRectPath(3, 3, W - 6, H - 6, R);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Download High-Res PNG Image
        const link = document.createElement("a");
        const safeName = (registration?.full_name || "Delegate").replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `TEDxGCEM_Pass_${safeName}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
        setIsDownloading(false);
      };

      qrImg.onload = () => {
        // Draw QR centered inside white box with padding
        const qrPadding = 30;
        ctx.drawImage(qrImg, qrBoxX + qrPadding, qrBoxY + qrPadding, qrBoxSize - qrPadding * 2, qrBoxSize - qrPadding * 2);
        finishCanvas();
      };

      qrImg.onerror = () => {
        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText("QR SCAN CODE", W / 2, qrBoxY + qrBoxSize / 2);
        finishCanvas();
      };
    } catch (err) {
      console.error("Failed to generate pass image:", err);
      setIsDownloading(false);
    }
  };

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col">
      {/* Hero Banner */}
      <div className="w-full mb-20 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
        >
          YOUR ATTENDEE <br />
          <span className="text-ted-red">PASS BADGE</span>
        </motion.h2>
        <div className="h-[1.5px] w-20 bg-ted-red" />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
        >
          Download your official verified entry pass. Present this pass at the registration desk on event day for quick entry.
        </motion.p>
      </div>

      {settings?.reveal_tickets === false ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-ted-dark-gray/50 border border-white/10 p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm text-center space-y-8 relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-ted-red/20 border border-ted-red/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EB0028" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h4 className="text-3xl font-black uppercase tracking-tight text-white">Downloads Closed</h4>
            <p className="text-white/60 max-w-md mx-auto text-xs leading-relaxed font-sans font-light">
              Ticket pass downloads for TEDxGCEM {eventYear} are currently closed.
            </p>
          </div>
          <button 
            onClick={() => onTabChange("home")}
            className="px-8 py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-full text-xs transition-all uppercase tracking-widest cursor-pointer border border-ted-red shadow-[0_0_15px_rgba(235,0,40,0.25)]"
          >
            Return Home
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-ted-dark-gray/50 border border-white/10 p-6 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
        >
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
                      Please sign in with your registered Google Account to view your attendee pass.
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
                  key={`pass-${registration.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 flex flex-col items-center w-full"
                >
                  {/* Multi-Pass Switcher Tabs */}
                  {registrations.length > 1 && (
                    <div className="w-full max-w-md mx-auto space-y-2 pb-2">
                      <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1">
                        <span>All Passes ({registrations.length} Total):</span>
                        <span className="text-ted-red font-bold">Pass {selectedIndex + 1} of {registrations.length}</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
                        {registrations.map((pass, idx) => {
                          const isSelected = selectedIndex === idx;
                          return (
                            <button
                              key={pass.id}
                              type="button"
                              onClick={() => setSelectedIndex(idx)}
                              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                                isSelected
                                  ? "bg-ted-red text-white shadow-[0_0_15px_rgba(235,0,40,0.4)]"
                                  : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/10"
                              }`}
                            >
                              <span>🎟️ {pass.full_name} (Pass #{idx + 1})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {registration.ticket_status === "confirmed" || registration.ticket_status === "approved" ? (
                      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_20px_rgba(34,197,94,0.12)]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Pass Confirmed & Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_20px_rgba(234,179,8,0.12)]">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Pending Review
                      </span>
                    )}
                  </div>

                  {registration.ticket_status === "confirmed" || registration.ticket_status === "approved" ? (
                    /* Beautiful Vertical Portrait Pass Card Preview */
                    <div 
                      id="printable-pass-card" 
                      className="w-full max-w-[360px] bg-black border-2 border-white rounded-[2.2rem] overflow-hidden shadow-[0_0_50px_rgba(235,0,40,0.2)] text-white text-center flex flex-col items-center relative"
                    >
                      {/* Top Red Header */}
                      <div className="w-full bg-ted-red py-6 px-6 relative flex flex-col items-center justify-center">
                        {/* Mock Lanyard Hole */}
                        <div className="w-7 h-3 rounded-full bg-black/40 border border-white/20 mb-3" />
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                          TED<span className="lowercase">x</span>GCEM <span className="text-black font-mono text-xl">{eventYear}</span>
                        </h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 w-full flex flex-col items-center space-y-5">
                        {/* Delegate Pill */}
                        <span className="inline-block px-4 py-1 rounded-full bg-ted-red/10 border border-ted-red text-ted-red font-mono text-[10px] font-bold uppercase tracking-widest">
                          ● OFFICIAL DELEGATE PASS
                        </span>

                        {/* Name */}
                        <div>
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">ATTENDEE NAME</span>
                          <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
                            {registration.full_name}
                          </h2>
                          {registration.designation && (
                            <span className="text-[11px] font-mono text-ted-red font-bold uppercase tracking-wider block mt-1">
                              {registration.designation}
                            </span>
                          )}
                        </div>

                        {/* Institution */}
                        <div className="w-full border-t border-b border-white/10 py-3">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-0.5">INSTITUTION</span>
                          <span className="text-xs font-bold uppercase text-white/90 block truncate">{registration.organization}</span>
                        </div>

                        {/* QR Code (Encodes web verification URL) */}
                        <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "https://tedxgcem.com") + '/api/verify-pass?id=' + encodeURIComponent(ticketId) + '&email=' + encodeURIComponent(registration.email))}&color=000000&bgcolor=ffffff`} 
                            alt="Event Day Scan QR Code" 
                            className="w-32 h-32 object-contain"
                            crossOrigin="anonymous"
                          />
                        </div>

                        <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">
                          EVENT DAY CHECK-IN SCAN QR
                        </span>

                        {/* Pass ID Barcode Tag */}
                        <div className="pt-2 border-t border-dashed border-white/20 w-full flex flex-col items-center">
                          <span className="text-xs font-mono font-black text-ted-red tracking-widest uppercase">
                            {ticketId}
                          </span>
                          <span className="text-[8px] font-mono text-white/30 uppercase mt-1">
                            VENUE: GCEM AUDITORIUM, BENGALURU
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto text-center space-y-4 py-6">
                      <p className="text-white/70 text-sm">
                        Hi <span className="text-white font-bold">{registration.full_name}</span>, your registration is currently <span className="text-yellow-400 font-bold">Pending Review</span>.
                      </p>
                    </div>
                  )}

                  {/* Single Download Button */}
                  {(registration.ticket_status === "confirmed" || registration.ticket_status === "approved") && (
                    <div className="pt-4 w-full flex justify-center">
                      <button 
                        onClick={handleDownloadImage}
                        disabled={isDownloading}
                        className="px-10 py-5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-base shadow-[0_0_30px_rgba(235,0,40,0.4)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating Pass Badge...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download Official Pass</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="no-pass"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 text-center space-y-6 py-6"
                >
                  {hasPendingVerification ? (
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
                        ⏳
                      </div>
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-widest">
                          Payment Under Verification
                        </span>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white">
                          Pass Verification in Progress
                        </h4>
                        <p className="text-white/60 text-xs leading-relaxed font-light">
                          Your registration associated with <span className="text-white font-bold font-mono">{user.email}</span> is currently being verified against bank records by the TEDxGCEM organizing committee.
                        </p>
                        <p className="text-amber-400/80 text-[11px] font-mono">
                          Your official QR Pass Badge will be available to download here as soon as verification is approved.
                        </p>
                      </div>
                      <a
                        href="mailto:tedxgcem@gmail.com"
                        className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all"
                      >
                        Contact Team
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white">No Pass Application Found</h4>
                        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                          We could not find any active pass associated with <span className="text-white font-bold font-mono">{user.email}</span>.
                        </p>
                      </div>
                      <button 
                        onClick={() => onTabChange("register")}
                        className="px-8 py-4 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-base shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
  );
}
