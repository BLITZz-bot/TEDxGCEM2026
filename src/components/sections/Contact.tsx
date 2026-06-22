"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function Contact() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [mapView, setMapView] = useState<"roadmap" | "satellite">("roadmap");

  const mapUrl = mapView === "roadmap"
    ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7735829891867!2d77.71457027490598!3d12.986328487330406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11920e734dc9%3A0xefdf9d49329b63e8!2sGopalan%20College%20of%20Engineering%20and%20Management!5e0!3m2!1sen!2sin!4v1780655596097!5m2!1sen!2sin"
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7735829891867!2d77.71457027490598!3d12.986328487330406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11920e734dc9%3A0xefdf9d49329b63e8!2sGopalan%20College%20of%20Engineering%20and%20Management!5e1!3m2!1sen!2sin!4v1780655596097!5m2!1sen!2sin";
  const googleMapsLink = "https://www.google.com/maps/search/Gopalan+College+of+Engineering+and+Management"; 

  // Autofill user credentials when auth state loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setEmail(user.email || "");
        if (user.user_metadata?.full_name) {
          setName(user.user_metadata.full_name);
        }
      } else {
        setEmail("");
        setName("");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transmit message.");
      }

      setIsSubmitted(true);
      setMessage(""); // Clear message field
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to transmit message. Please check connection and try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col">
      {/* Hero Banner Manifesto */}
      <div className="mb-24 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
        >
          GET IN TOUCH <br />
          WITH OUR <span className="text-ted-red">TEAM</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
        >
          Have a question, feedback, or want to partner with us? Reach out and let&apos;s build something extraordinary together.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        {/* Left Side: Location & Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ted-dark-gray/50 border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full overflow-hidden"
        >
          <div className="mb-8">
            <h4 className="text-ted-red font-bold uppercase tracking-widest text-xs mb-4">Location</h4>
            <p className="text-2xl font-black mb-2">GOPALAN COLLEGE OF ENGINEERING AND MANAGEMENT</p>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Bengaluru, Karnataka 560048
            </p>

            <div className="space-y-6">
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=tedxgcem@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 group cursor-pointer w-fit"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:border-ted-red/50 group-hover:text-ted-red group-hover:bg-ted-red/10 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h4 className="text-ted-red font-bold uppercase tracking-widest text-[10px] mb-0.5">Email Us</h4>
                  <span className="text-xl font-black group-hover:text-ted-red transition-colors block leading-tight">tedxgcem@gmail.com</span>
                </div>
              </a>

              <a href="https://www.instagram.com/tedxgcem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer w-fit">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:border-ted-red/50 group-hover:text-ted-red group-hover:bg-ted-red/10 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <div>
                  <h4 className="text-ted-red font-bold uppercase tracking-widest text-[10px] mb-0.5">Instagram</h4>
                  <span className="text-xl font-black group-hover:text-ted-red transition-colors block leading-tight">TEDxGCEM</span>
                </div>
              </a>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-grow relative rounded-[2rem] overflow-hidden border border-white/5 min-h-[300px] group">
            <iframe
              src={mapUrl}
              className="w-full h-full border-0 grayscale-0 md:grayscale opacity-100 md:opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            {/* 3D Satellite Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setMapView(prev => prev === "roadmap" ? "satellite" : "roadmap");
              }}
              className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl border border-white/25 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center shadow-lg hover:border-ted-red/50 hover:bg-black transition-all duration-300 cursor-pointer group/toggle"
              title={mapView === "roadmap" ? "Switch to 3D Satellite View" : "Switch to 2D Map View"}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
                {mapView === "roadmap" ? (
                  <svg className="w-5 h-5 text-white/70 group-hover/toggle:text-ted-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white/70 group-hover/toggle:text-ted-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                )}
                <span className="text-[7px] font-black tracking-widest uppercase mt-1 text-white/50 group-hover/toggle:text-white transition-colors">
                  {mapView === "roadmap" ? "3D Earth" : "2D Map"}
                </span>
              </div>
            </button>
            {/* Overlay to make it clickable */}
            <a 
              href={googleMapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute inset-0 z-10 cursor-pointer"
              title="Open in Google Maps"
            />
          </div>
        </motion.div>

        {/* Right Side: Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-ted-dark-gray/50 border border-white/10 p-8 md:p-10 rounded-[2.5rem] flex flex-col h-full min-h-[400px] justify-center"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-10 h-10 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono uppercase tracking-widest text-white/40">Loading Auth...</span>
              </motion.div>
            ) : !user ? (
              <motion.div
                key="login-prompt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-ted-red shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Verification Required</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                    To prevent spam and verify sender identities, please sign in with Google to transmit messages to our organizing team.
                  </p>
                </div>

                <button
                  onClick={loginWithGoogle}
                  className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl text-xs hover:bg-ted-red hover:text-white transition-all duration-300 uppercase tracking-widest flex items-center gap-3 cursor-pointer shadow-lg animate-pulse"
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
            ) : !isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col h-full justify-between"
              >
                {/* Form header / Logged in user info */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2 overflow-hidden mr-4">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 shrink-0">Sender:</span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-white font-black truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[9px] uppercase tracking-widest font-mono text-ted-red hover:underline cursor-pointer shrink-0 font-bold"
                  >
                    Logout
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-sm text-white"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      disabled
                      value={email}
                      className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-white/50 cursor-not-allowed"
                      title="Your logged-in Google email"
                    />
                    <textarea 
                      rows={5}
                      placeholder="Your Message" 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-ted-red transition-all resize-none text-sm text-white"
                    />
                  </div>
                  
                  {submitError && (
                    <p className="text-ted-red text-xs font-mono">{submitError}</p>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 mt-6 bg-ted-red text-white font-black rounded-2xl shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-8"
              >
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Message Transmitted</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                    Thank you for reaching out. Our organizing committee has received your message and will respond within 24 to 48 hours.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                  }}
                  className="px-8 py-4 bg-ted-red text-white font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest cursor-pointer"
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
